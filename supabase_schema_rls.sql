-- ==============================================================================
-- KITNOVA SPORTSWEAR — AUTHORITATIVE SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- Target: Supabase Project ID qodecquwaxrwtwepkdxg
-- Multi-App Architecture: Application A (Customer & Rider) + Application B (Super Admin)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'customer',
    'rider',
    'super_admin',
    'operations_admin',
    'product_admin',
    'support_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method_type AS ENUM (
    'mtn_momo',
    'airtel_money',
    'manual_bank',
    'stripe_card',
    'cash_on_delivery'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_type AS ENUM (
    'unpaid',
    'payment_initiated',
    'pending_verification',
    'paid',
    'rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status_type AS ENUM (
    'pending',
    'payment_pending',
    'confirmed',
    'customization_review',
    'preparing',
    'ready',
    'rider_assigned',
    'picked_up',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  rider_vehicle_plate TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('club', 'national', 'training', 'blank')),
  team TEXT NOT NULL,
  description TEXT,
  base_price INTEGER NOT NULL, -- in UGX
  discount_price INTEGER,
  old_price INTEGER,
  sizes TEXT[] NOT NULL DEFAULT ARRAY['S', 'M', 'L', 'XL', '2XL'],
  colors TEXT[] NOT NULL DEFAULT ARRAY['#0F2A5F', '#D4A029', '#FFFFFF'],
  stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  is_customizable BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. PRODUCT IMAGES (Cloudinary Integration)
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  alt_text TEXT,
  side TEXT CHECK (side IN ('front', 'back', 'gallery')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. STUDIO FONTS
CREATE TABLE IF NOT EXISTS public.studio_fonts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  family TEXT NOT NULL,
  css_class TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 1,
  preview_text TEXT NOT NULL DEFAULT 'KAMPALA 10'
);

-- 8. STUDIO PRICING RULES (UGX)
CREATE TABLE IF NOT EXISTS public.studio_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_price INTEGER NOT NULL DEFAULT 5000,
  number_price INTEGER NOT NULL DEFAULT 5000,
  logo_price INTEGER NOT NULL DEFAULT 10000,
  sponsor_price INTEGER NOT NULL DEFAULT 15000,
  badge_price INTEGER NOT NULL DEFAULT 5000,
  sleeve_patch_price INTEGER NOT NULL DEFAULT 4000,
  frame_price INTEGER NOT NULL DEFAULT 3000,
  graphic_price INTEGER NOT NULL DEFAULT 5000,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. STUDIO DESIGNS
CREATE TABLE IF NOT EXISTS public.studio_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  base_jersey_color TEXT NOT NULL,
  collar_color TEXT,
  trim_color TEXT,
  layers JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_customization_price INTEGER NOT NULL DEFAULT 0,
  preview_front_url TEXT,
  preview_back_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. MANUAL PAYMENT METHODS CONFIGURATION
CREATE TABLE IF NOT EXISTS public.manual_payment_methods (
  id TEXT PRIMARY KEY,
  provider payment_method_type NOT NULL,
  title TEXT NOT NULL,
  merchant_name TEXT NOT NULL,
  merchant_number TEXT NOT NULL,
  ussd_template TEXT,
  instructions TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  qr_code_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal INTEGER NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  delivery_fee INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL,
  payment_method payment_method_type NOT NULL,
  payment_status payment_status_type NOT NULL DEFAULT 'pending_verification',
  payment_reference TEXT,
  payment_proof_url TEXT,
  status order_status_type NOT NULL DEFAULT 'customization_review',
  delivery_address JSONB NOT NULL,
  assigned_rider_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_rider_name TEXT,
  assigned_rider_phone TEXT,
  proof_of_delivery JSONB,
  status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. PAYMENTS TRANSACTION AUDIT TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  amount INTEGER NOT NULL,
  payment_method payment_method_type NOT NULL,
  reference_number TEXT NOT NULL,
  status payment_status_type NOT NULL DEFAULT 'pending_verification',
  evidence_url TEXT,
  notes TEXT,
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. AUDIT LOGS (Immutable)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  before_value TEXT,
  after_value TEXT
);

-- 13b. SECURE ORDER AUDIT LOGS (Immutable, triggered on orders mutation)
-- Captures administrator ID (admin_id), original status, and new status for compliance
CREATE TABLE IF NOT EXISTS public.order_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT,
  admin_role TEXT,
  original_status order_status_type NOT NULL,
  new_status order_status_type NOT NULL,
  original_payment_status payment_status_type,
  new_payment_status payment_status_type,
  changed_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_audit_logs_order_id ON public.order_audit_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_order_audit_logs_admin_id ON public.order_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_order_audit_logs_created_at ON public.order_audit_logs(created_at DESC);

-- 14. COUPONS & PROMOTIONS
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL,
  min_spend INTEGER NOT NULL DEFAULT 0,
  usage_limit INTEGER NOT NULL DEFAULT 100,
  used_count INTEGER NOT NULL DEFAULT 0,
  expiry_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. CMS BANNERS
CREATE TABLE IF NOT EXISTS public.cms_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  tag TEXT NOT NULL,
  badge_text TEXT NOT NULL,
  image_url TEXT NOT NULL,
  cta_text TEXT NOT NULL,
  target_view TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 16. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('order', 'payment', 'delivery', 'inventory', 'support', 'promotion')),
  target_role TEXT NOT NULL CHECK (target_role IN ('customer', 'rider', 'admin', 'all')),
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_fonts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper Function to check if current user is an authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('super_admin', 'operations_admin', 'product_admin', 'support_admin')
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function to check if current user is an active courier
CREATE OR REPLACE FUNCTION public.is_rider()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'rider'
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own non-role profile fields"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (
    -- Prevent customers or riders from elevating their own role
    (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
    OR public.is_admin()
  );

-- PRODUCTS & CATEGORIES POLICIES
CREATE POLICY "Active products viewable by everyone"
  ON public.products FOR SELECT
  USING (status = 'active' OR public.is_admin());

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin());

CREATE POLICY "Active categories viewable by everyone"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- STUDIO FONTS & PRICING POLICIES
CREATE POLICY "Fonts viewable by everyone"
  ON public.studio_fonts FOR SELECT
  USING (true);

CREATE POLICY "Admins can update fonts"
  ON public.studio_fonts FOR ALL
  USING (public.is_admin());

CREATE POLICY "Pricing viewable by everyone"
  ON public.studio_pricing FOR SELECT
  USING (true);

CREATE POLICY "Admins can update studio pricing"
  ON public.studio_pricing FOR ALL
  USING (public.is_admin());

-- STUDIO DESIGNS POLICIES
CREATE POLICY "Users can view own designs"
  ON public.studio_designs FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can save designs"
  ON public.studio_designs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update own designs"
  ON public.studio_designs FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

-- MANUAL PAYMENT METHODS POLICIES
CREATE POLICY "Active manual payment methods viewable by all shoppers"
  ON public.manual_payment_methods FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Only admins can modify manual payment methods"
  ON public.manual_payment_methods FOR ALL
  USING (public.is_admin());

-- ORDERS POLICIES
CREATE POLICY "Customers can view their own orders"
  ON public.orders FOR SELECT
  USING (
    customer_id = auth.uid()
    OR assigned_rider_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY "Customers can place new orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
    OR customer_id IS NULL -- Guest checkout allowed
    OR public.is_admin()
  );

CREATE POLICY "Authorized staff and assigned riders can update orders"
  ON public.orders FOR UPDATE
  USING (
    assigned_rider_id = auth.uid()
    OR public.is_admin()
  )
  WITH CHECK (
    -- Direct client-side updates cannot set payment_status to 'paid' or status to 'paid'.
    -- Approvals MUST be routed through the 'approve-payment' Supabase Edge Function using service_role!
    (
      (NEW.payment_status <> 'paid' AND NEW.status <> 'paid')
      OR current_setting('request.jwt.claim.role', true) = 'service_role'
      OR current_user = 'service_role'
    )
  );

-- PAYMENTS POLICIES (Manual verification queue)
CREATE POLICY "Customers can view own payment logs"
  ON public.payments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.customer_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Customers can insert payment verification reference"
  ON public.payments FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND (orders.customer_id = auth.uid() OR orders.customer_id IS NULL))
    OR public.is_admin()
  );

CREATE POLICY "Only admins can verify or reject payments"
  ON public.payments FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (
    -- Direct client updates cannot verify payment to 'paid'. Must execute via approve-payment Edge Function!
    (
      NEW.status <> 'paid'
      OR current_setting('request.jwt.claim.role', true) = 'service_role'
      OR current_user = 'service_role'
    )
  );

-- ------------------------------------------------------------------------------
-- DATABASE TRIGGER: PREVENT DIRECT CLIENT-SIDE PAYMENT APPROVAL (EDGE FUNCTION MANDATE)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_direct_payment_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- If attempting to mark payment as paid from a non-service_role client context:
  IF (TG_TABLE_NAME = 'orders' AND ((NEW.payment_status = 'paid' AND OLD.payment_status <> 'paid') OR (NEW.status = 'paid' AND OLD.status <> 'paid'))) OR
     (TG_TABLE_NAME = 'payments' AND (NEW.status = 'paid' AND OLD.status <> 'paid')) THEN
    IF current_setting('request.jwt.claim.role', true) <> 'service_role' AND current_user <> 'service_role' THEN
      RAISE EXCEPTION 'Direct client-side payment approval is forbidden by security mandate. Approvals must be processed via the approve-payment Supabase Edge Function.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_prevent_direct_order_payment_approval ON public.orders;
CREATE TRIGGER tr_prevent_direct_order_payment_approval
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_direct_payment_approval();

DROP TRIGGER IF EXISTS tr_prevent_direct_payment_verification ON public.payments;
CREATE TRIGGER tr_prevent_direct_payment_verification
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_direct_payment_approval();

-- ------------------------------------------------------------------------------
-- DATABASE TRIGGER: CAPTURE ALL STATUS & PAYMENT CHANGES ON ORDERS (IMMUTABLE AUDIT)
-- Records administrator ID (admin_id), original status, and new status automatically
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.capture_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_admin_id UUID;
  v_admin_email TEXT;
  v_admin_role TEXT;
BEGIN
  -- Trigger whenever order status, payment status, or assigned rider changes
  IF (OLD.status IS DISTINCT FROM NEW.status) OR 
     (OLD.payment_status IS DISTINCT FROM NEW.payment_status) OR
     (OLD.assigned_rider_id IS DISTINCT FROM NEW.assigned_rider_id) THEN

    -- 1. Extract actor UID from Supabase JWT auth context
    v_admin_id := auth.uid();

    -- 2. Lookup admin metadata from profiles if available
    IF v_admin_id IS NOT NULL THEN
      SELECT email, role::text INTO v_admin_email, v_admin_role
      FROM public.profiles
      WHERE id = v_admin_id;
    END IF;

    -- Edge Function / service_role fallback
    IF v_admin_email IS NULL THEN
      v_admin_email := COALESCE(
        current_setting('request.jwt.claim.email', true),
        'edge_function_or_service_role'
      );
    END IF;

    IF v_admin_role IS NULL THEN
      v_admin_role := COALESCE(
        current_setting('request.jwt.claim.role', true),
        'service_role'
      );
    END IF;

    -- 3. Insert record into dedicated public.order_audit_logs table
    INSERT INTO public.order_audit_logs (
      order_id,
      order_number,
      admin_id,
      admin_email,
      admin_role,
      original_status,
      new_status,
      original_payment_status,
      new_payment_status,
      changed_fields,
      created_at
    ) VALUES (
      NEW.id,
      NEW.order_number,
      v_admin_id,
      v_admin_email,
      v_admin_role,
      OLD.status,
      NEW.status,
      OLD.payment_status,
      NEW.payment_status,
      jsonb_build_object(
        'original_status', OLD.status,
        'new_status', NEW.status,
        'original_payment_status', OLD.payment_status,
        'new_payment_status', NEW.payment_status,
        'original_rider_id', OLD.assigned_rider_id,
        'new_rider_id', NEW.assigned_rider_id,
        'original_rider_name', OLD.assigned_rider_name,
        'new_rider_name', NEW.assigned_rider_name
      ),
      timezone('utc'::text, now())
    );

    -- 4. Also insert into universal public.audit_logs for Super Admin governance view
    INSERT INTO public.audit_logs (
      actor_name,
      actor_role,
      module,
      action,
      description,
      before_value,
      after_value
    ) VALUES (
      COALESCE(v_admin_email, 'Administrator'),
      COALESCE(v_admin_role, 'super_admin'),
      'orders',
      'STATUS_CHANGE',
      'Order ' || NEW.order_number || ' status transitioned: [' || OLD.status::text || ' -> ' || NEW.status::text || '], payment: [' || OLD.payment_status::text || ' -> ' || NEW.payment_status::text || ']',
      jsonb_build_object('status', OLD.status, 'payment_status', OLD.payment_status, 'rider', OLD.assigned_rider_name)::text,
      jsonb_build_object('status', NEW.status, 'payment_status', NEW.payment_status, 'rider', NEW.assigned_rider_name)::text
    );

    -- 5. Append to order status_history JSON array
    NEW.status_history := COALESCE(OLD.status_history, '[]'::jsonb) || jsonb_build_object(
      'status', NEW.status,
      'payment_status', NEW.payment_status,
      'admin_id', v_admin_id,
      'admin_email', v_admin_email,
      'admin_role', v_admin_role,
      'timestamp', timezone('utc'::text, now())
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_capture_order_status_change ON public.orders;
CREATE TRIGGER tr_capture_order_status_change
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.capture_order_status_change();

-- AUDIT LOGS POLICIES (Immutable and strictly admin only)
CREATE POLICY "Only admins can read audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Only system triggers and admins can append audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (public.is_admin() OR current_setting('request.jwt.claim.role', true) = 'service_role' OR current_user = 'service_role');

-- ORDER AUDIT LOGS POLICIES (Strictly immutable, append-only via trigger or admin)
CREATE POLICY "Only admins can read order audit logs"
  ON public.order_audit_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "System triggers and admins can append order audit logs"
  ON public.order_audit_logs FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR current_setting('request.jwt.claim.role', true) = 'service_role'
    OR current_user = 'service_role'
  );

-- STRICT IMMUTABILITY: DISALLOW ANY UPDATES OR DELETIONS ON AUDIT TRAILS
CREATE POLICY "Order audit logs are strictly immutable (no updates)"
  ON public.order_audit_logs FOR UPDATE
  USING (false);

CREATE POLICY "Order audit logs are strictly immutable (no deletes)"
  ON public.order_audit_logs FOR DELETE
  USING (false);

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view their notifications"
  ON public.notifications FOR SELECT
  USING (
    recipient_id = auth.uid()
    OR target_role = 'all'
    OR (target_role = 'customer' AND NOT public.is_rider() AND NOT public.is_admin())
    OR (target_role = 'rider' AND public.is_rider())
    OR (target_role = 'admin' AND public.is_admin())
  );

CREATE POLICY "Users can mark own notifications as read"
  ON public.notifications FOR UPDATE
  USING (recipient_id = auth.uid() OR public.is_admin());

-- COUPONS & CMS BANNERS POLICIES
CREATE POLICY "Active coupons viewable by shoppers"
  ON public.coupons FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL
  USING (public.is_admin());

CREATE POLICY "Banners viewable by everyone"
  ON public.cms_banners FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage banners"
  ON public.cms_banners FOR ALL
  USING (public.is_admin());

-- ==============================================================================
-- AUTOMATIC AUTH TRIGGER (Assigns 'customer' role on new sign-up)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'customer' -- CRITICAL: All self-registrations receive 'customer' role ONLY
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
