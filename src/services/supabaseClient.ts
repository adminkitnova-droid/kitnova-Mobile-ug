import { createClient } from '@supabase/supabase-js';
import { AuthUser, Role, Order, PaymentTransaction, Product } from '../types';

const SUPABASE_URL = 'https://qodecquwaxrwtwepkdxg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-9MolMEb0UGNUVAh6S9abQ_V7yLFaUC';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

/**
 * Validates user credentials against Supabase and resolves authorized role from profiles.
 * If network is unreachable or user is mock testing, falls back cleanly to authoritative store users.
 */
export async function authenticateUser(
  email: string,
  password?: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) return { success: false, error: 'Enter your email and password.' };
  if (password.length < 6) return { success: false, error: 'Password must contain at least 6 characters.' };

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error || !data.user || !data.session) {
      return { success: false, error: error?.message || 'Sign-in failed. Check your email and password.' };
    }
    return await resolveAuthenticatedUser(data.user.id, data.user.email || cleanEmail, data.user.user_metadata, data.session.access_token);
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unable to reach the authentication service. Check your connection.' };
  }
}

/** Resolve role only from the trusted database profile; client metadata cannot grant staff access. */
async function resolveAuthenticatedUser(
  id: string, email: string, metadata: Record<string, any> | undefined, token: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const { data: profile, error } = await supabase.from('profiles').select('id,email,full_name,phone,role,rider_vehicle_plate,status').eq('id', id).maybeSingle();
  if (error) return { success: false, error: 'Could not verify your account profile. Please try again.' };
  const role = (profile?.role || 'customer') as Role;
  if (profile?.status && profile.status !== 'active') {
    await supabase.auth.signOut();
    return { success: false, error: 'This account is not active. Contact support.' };
  }
  const user: AuthUser = {
    id, email, name: profile?.full_name || metadata?.full_name || email.split('@')[0],
    phone: profile?.phone || metadata?.phone, role,
    riderId: role === 'rider' ? profile?.rider_vehicle_plate || undefined : undefined, token
  };
  return { success: true, user };
}

/** Restore only a real Supabase session; localStorage user objects are not authentication. */
export async function restoreAuthenticatedUser(): Promise<AuthUser | null> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) return null;
    const resolved = await resolveAuthenticatedUser(data.session.user.id, data.session.user.email || '', data.session.user.user_metadata, data.session.access_token);
    return resolved.success ? resolved.user || null : null;
  } catch { return null; }
}

/**
 * Registers a new customer in Supabase and public.profiles.
 * Strictly assigns the 'customer' role. Public registration can NEVER assign 'rider' or admin roles.
 */
export async function registerCustomerAccount(
  fullName: string, email: string, phone: string, password?: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!fullName.trim() || !cleanEmail || !password || password.length < 6) {
    return { success: false, error: 'Provide your name, valid email, and a password of at least 6 characters.' };
  }
  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail, password, options: { data: { full_name: fullName.trim(), phone: phone.trim(), role: 'customer' } }
    });
    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Registration could not be completed. Please try again.' };
    if (data.session) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id, email: cleanEmail, full_name: fullName.trim(), phone: phone.trim(), role: 'customer', status: 'active'
      });
      if (profileError) return { success: false, error: 'Account created, but profile setup failed. Contact support before retrying.' };
      return await resolveAuthenticatedUser(data.user.id, cleanEmail, data.user.user_metadata, data.session.access_token);
    }
    return { success: false, error: 'Account created. Check your email to confirm it, then sign in.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unable to reach the registration service. Check your connection.' };
  }
}

/**
 * Sends a password reset email via Supabase Auth
 */
export async function sendPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
    if (!error) {
      return { success: true, message: `Password reset instructions sent to ${cleanEmail}.` };
    }
  } catch (err) {
    console.warn('Supabase resetPassword network attempt:', err);
  }

  // Graceful response for user feedback
  return {
    success: true,
    message: `If an account exists for ${cleanEmail}, password reset instructions have been dispatched.`
  };
}

/**
 * Invokes the authoritative Supabase Edge Function 'approve-payment'
 * to validate the administrator's active session and staff role before updating
 * an order's payment status to 'paid'.
 * Client-side direct database updates are forbidden by database RLS and triggers.
 */
export async function approvePaymentViaEdgeFunction(
  paymentId: string,
  orderId?: string,
  notes?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const { data, error } = await supabase.functions.invoke('approve-payment', {
      body: {
        paymentId,
        orderId,
        notes: notes || 'Approved by Super Admin',
        action: 'approve'
      },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });

    if (error) {
      console.warn('Edge Function approve-payment returned error:', error);
      return { success: false, error: error.message || 'Edge function error' };
    }

    if (data && data.success === false) {
      return { success: false, error: data.error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Exception invoking approve-payment Edge Function:', err);
    return { success: false, error: err?.message || 'Failed to contact Edge Function' };
  }
}

/**
 * Invokes the authoritative Supabase Edge Function 'approve-payment' with action 'reject'
 */
export async function rejectPaymentViaEdgeFunction(
  paymentId: string,
  rejectionReason: string,
  orderId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const { data, error } = await supabase.functions.invoke('approve-payment', {
      body: {
        paymentId,
        orderId,
        rejectionReason,
        action: 'reject'
      },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });

    if (error) {
      return { success: false, error: error.message || 'Edge function error' };
    }

    if (data && data.success === false) {
      return { success: false, error: data.error };
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to contact Edge Function' };
  }
}

