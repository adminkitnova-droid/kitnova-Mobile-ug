import { createClient } from '@supabase/supabase-js';
import { AuthUser, Role } from '../types';

const SUPABASE_URL = 'https://qodecquwaxrwtwepkdxg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-9MolMEb0UGNUVAh6S9abQ_V7yLFaUC';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

async function resolveAuthenticatedUser(id: string, email: string, metadata: any, token: string) {
  const { data: profile, error } = await supabase.from('profiles').select('id,email,full_name,phone,role,rider_vehicle_plate,status').eq('id', id).maybeSingle();
  if (error) return { success: false, error: 'Could not verify profile.' };
  const role = (profile?.role || 'customer') as Role;
  if (profile?.status && profile.status !== 'active') { await supabase.auth.signOut(); return { success: false, error: 'Account not active.' }; }
  const user: AuthUser = { id, email, name: profile?.full_name || metadata?.full_name || email.split('@')[0], phone: profile?.phone || metadata?.phone, role, riderId: role === 'rider' ? profile?.rider_vehicle_plate || undefined : undefined, token };
  return { success: true, user };
}

export async function authenticateUser(email: string, password?: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) return { success: false, error: 'Enter email and password.' };
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error || !data.user || !data.session) return { success: false, error: error?.message || 'Sign-in failed.' };
    return await resolveAuthenticatedUser(data.user.id, data.user.email || cleanEmail, data.user.user_metadata, data.session.access_token);
  } catch (err: any) { return { success: false, error: err?.message || 'Network error.' }; }
}

export async function restoreAuthenticatedUser(): Promise<AuthUser | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return null;
    const resolved = await resolveAuthenticatedUser(data.session.user.id, data.session.user.email || '', data.session.user.user_metadata, data.session.access_token);
    return resolved.success ? resolved.user as AuthUser || null : null;
  } catch { return null; }
}

export async function registerCustomerAccount(fullName: string, email: string, phone: string, password?: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!fullName.trim() || !cleanEmail || !password || password.length < 6) return { success: false, error: 'Provide name, email, password >=6.' };
  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail, password,
      options: { 
        emailRedirectTo: 'com.kitnova.jersey://auth/callback',
        data: { full_name: fullName.trim(), phone: phone.trim(), role: 'customer' } 
      }
    });
    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Registration failed.' };
    if (data.session) {
      await supabase.from('profiles').upsert({ id: data.user.id, email: cleanEmail, full_name: fullName.trim(), phone: phone.trim(), role: 'customer', status: 'active' });
      return await resolveAuthenticatedUser(data.user.id, cleanEmail, data.user.user_metadata, data.session.access_token);
    }
    return { success: false, error: 'Account created. Check email to confirm - link will open KITNOVA app.' };
  } catch (err: any) { return { success: false, error: err?.message || 'Registration error.' }; }
}

export async function sendPasswordReset(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo: 'com.kitnova.jersey://auth/callback' });
    if (!error) return { success: true, message: `Reset email sent to ${cleanEmail}. Open link in app.` };
  } catch (err) { console.warn(err); }
  return { success: true, message: `If account exists for ${cleanEmail}, reset sent.` };
}

export async function approvePaymentViaEdgeFunction(paymentId: string, orderId?: string, notes?: string) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const { data, error } = await supabase.functions.invoke('approve-payment', { body: { paymentId, orderId, notes: notes || 'Approved by Super Admin', action: 'approve' }, headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    if (error) return { success: false, error: error.message };
    if (data && data.success === false) return { success: false, error: data.error };
    return { success: true, data };
  } catch (err: any) { return { success: false, error: err?.message || 'Edge Function failed' }; }
}

export async function rejectPaymentViaEdgeFunction(paymentId: string, rejectionReason: string, orderId?: string) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const { data, error } = await supabase.functions.invoke('approve-payment', { body: { paymentId, orderId, rejectionReason, action: 'reject' }, headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    if (error) return { success: false, error: error.message };
    if (data && data.success === false) return { success: false, error: data.error };
    return { success: true, data };
  } catch (err: any) { return { success: false, error: err?.message || 'Edge Function failed' }; }
}
