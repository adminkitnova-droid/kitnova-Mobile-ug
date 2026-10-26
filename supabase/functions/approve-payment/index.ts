// ==============================================================================
// KITNOVA SPORTSWEAR — SUPABASE EDGE FUNCTION: approve-payment
// Path: supabase/functions/approve-payment/index.ts
//
// Purpose:
// Securely verifies an administrator's active session and authoritative role
// before updating an order's payment status to 'paid'.
// Prevents client-side database manipulation by running server-side with
// service_role privileges only after strict session & RBAC verification.
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ApprovePaymentPayload {
  paymentId: string;
  orderId?: string;
  notes?: string;
  action?: "approve" | "reject";
  rejectionReason?: string;
}

serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Validate Authorization Header
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized (401): Missing or malformed Bearer authorization token."
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();

    // 3. Initialize Supabase Clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Internal Server Configuration Error: Supabase credentials missing."
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Client with user token to verify session
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false }
    });

    // Authoritative service_role client to read/write without client bypass
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // 4. Validate Authenticated User Identity
    const { data: authUser, error: authError } = await userClient.auth.getUser();
    if (authError || !authUser?.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized (401): Invalid or expired session. Please re-authenticate."
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const userId = authUser.user.id;

    // 5. Query Profile to Verify Authoritative Staff Role
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("id, full_name, email, role, status")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Forbidden (403): User profile does not exist or cannot be verified."
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Check account status
    if (profile.status === "suspended") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Forbidden (403): This administrative account has been suspended."
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Role Enforcement: Only super_admin and operations_admin may approve/reject payments
    const AUTHORIZED_ROLES = ["super_admin", "operations_admin"];
    if (!AUTHORIZED_ROLES.includes(profile.role)) {
      // Log unauthorized attempt to audit table
      await adminClient.from("audit_logs").insert({
        actor_name: profile.full_name || authUser.user.email,
        actor_role: profile.role,
        module: "payments",
        action: "UNAUTHORIZED_PAYMENT_VERIFICATION_ATTEMPT",
        description: `User with role '${profile.role}' attempted to approve payment directly. Action was blocked.`,
        before_value: null,
        after_value: null
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: `Forbidden (403): Role '${profile.role}' is not authorized to verify or approve manual payments. Required: super_admin or operations_admin.`
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // 6. Parse and Validate Request Payload
    const body: ApprovePaymentPayload = await req.json();
    const { paymentId, orderId: explicitOrderId, notes, action = "approve", rejectionReason } = body;

    if (!paymentId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Bad Request (400): paymentId is required."
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // 7. Fetch the Existing Payment Transaction
    const { data: paymentRecord, error: paymentFetchError } = await adminClient
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (paymentFetchError || !paymentRecord) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Payment transaction '${paymentId}' not found.`
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const orderId = explicitOrderId || paymentRecord.order_id;
    const nowIso = new Date().toISOString();
    const actorName = profile.full_name || profile.email;

    // 8. Execute Authoritative State Update
    if (action === "approve") {
      // A. Update Payment Transaction Record
      const { error: paymentUpdateError } = await adminClient
        .from("payments")
        .update({
          status: "paid",
          verified_at: nowIso,
          verified_by: `${actorName} (${profile.role})`,
          notes: notes || "Payment reference verified via approve-payment Edge Function"
        })
        .eq("id", paymentId);

      if (paymentUpdateError) {
        throw new Error(`Failed to update payment transaction: ${paymentUpdateError.message}`);
      }

      // B. Update Associated Order (Status + Status History)
      if (orderId) {
        const { data: existingOrder } = await adminClient
          .from("orders")
          .select("id, order_number, customer_id, status_history")
          .eq("id", orderId)
          .single();

        const currentHistory = Array.isArray(existingOrder?.status_history)
          ? existingOrder.status_history
          : [];

        const updatedHistory = [
          ...currentHistory,
          {
            status: "paid",
            timestamp: nowIso,
            actor: `${actorName} (${profile.role})`,
            note: `Payment reference '${paymentRecord.reference_number}' verified and approved via Supabase Edge Function.`
          }
        ];

        const { error: orderUpdateError } = await adminClient
          .from("orders")
          .update({
            payment_status: "paid",
            status: "paid",
            status_history: updatedHistory,
            updated_at: nowIso
          })
          .eq("id", orderId);

        if (orderUpdateError) {
          throw new Error(`Failed to update order status: ${orderUpdateError.message}`);
        }

        // C. Notify Customer
        if (existingOrder?.customer_id) {
          await adminClient.from("notifications").insert({
            title: `Payment Approved: ${existingOrder.order_number}`,
            message: `Your payment of UGX ${paymentRecord.amount.toLocaleString()} has been verified. Your kit is moving to production!`,
            type: "payment",
            target_role: "customer",
            recipient_id: existingOrder.customer_id,
            is_read: false
          });
        }
      }

      // D. Record Immutable Audit Log
      await adminClient.from("audit_logs").insert({
        actor_name: actorName,
        actor_role: profile.role,
        module: "payments",
        action: "VERIFY_PAYMENT_APPROVED",
        description: `Verified payment '${paymentRecord.reference_number}' for Order ${paymentRecord.order_number} (UGX ${paymentRecord.amount.toLocaleString()}) via Edge Function.`,
        before_value: paymentRecord.status,
        after_value: "paid"
      });

      return new Response(
        JSON.stringify({
          success: true,
          action: "approved",
          paymentId,
          orderId,
          orderNumber: paymentRecord.order_number,
          newStatus: "paid",
          verifiedBy: actorName,
          verifiedAt: nowIso,
          message: "Payment successfully verified and approved."
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    } else {
      // Rejection branch
      if (!rejectionReason?.trim()) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Rejection requires a documented reason."
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // Update payment record to rejected
      await adminClient
        .from("payments")
        .update({
          status: "rejected",
          verified_at: nowIso,
          verified_by: `${actorName} (${profile.role})`,
          notes: `REJECTED: ${rejectionReason.trim()}`
        })
        .eq("id", paymentId);

      // Update order to payment_pending
      if (orderId) {
        await adminClient
          .from("orders")
          .update({
            payment_status: "rejected",
            status: "payment_pending",
            updated_at: nowIso
          })
          .eq("id", orderId);
      }

      // Audit Log
      await adminClient.from("audit_logs").insert({
        actor_name: actorName,
        actor_role: profile.role,
        module: "payments",
        action: "VERIFY_PAYMENT_REJECTED",
        description: `Rejected payment for Order ${paymentRecord.order_number}. Reason: ${rejectionReason.trim()}`,
        before_value: paymentRecord.status,
        after_value: "rejected"
      });

      return new Response(
        JSON.stringify({
          success: true,
          action: "rejected",
          paymentId,
          orderId,
          newStatus: "rejected",
          verifiedBy: actorName,
          verifiedAt: nowIso,
          message: "Payment reference marked as rejected."
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  } catch (error: any) {
    console.error("approve-payment Edge Function exception:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred processing payment verification."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
