import { supabase } from './supabaseClient';
import type { StudioArtwork, StudioFont } from '../types';

const BUCKET = 'kitnova-studio-assets';
export type SharedStudioAsset = {
  id: string; asset_type: 'font' | 'artwork'; name: string; family: string | null;
  css_class: string | null; category: StudioArtwork['category'] | null;
  storage_path: string; public_url: string; is_enabled: boolean; is_default: boolean;
  sort_order: number; preview_text: string | null; created_at: string;
};

function extension(name: string) { return name.split('.').pop()?.toLowerCase() || 'bin'; }
function slug(value: string) { return value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'asset'; }

export async function uploadSharedStudioAsset(file: File, input: {
  type: 'font' | 'artwork'; name: string; category?: StudioArtwork['category']; family?: string;
  cssClass?: string; previewText?: string; sortOrder?: number;
}) {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) throw new Error('Sign in with an authorized admin account to publish shared studio assets.');
  const maxBytes = input.type === 'font' ? 1_500_000 : 8 * 1024 * 1024;
  if (file.size <= 0 || file.size > maxBytes) throw new Error(`File must be smaller than ${input.type === 'font' ? '1.5 MB' : '8 MB'}.`);
  const allowed = input.type === 'font' ? /\.(woff2?|ttf|otf)$/i.test(file.name) : file.type.startsWith('image/');
  if (!allowed) throw new Error(input.type === 'font' ? 'Use WOFF, WOFF2, TTF or OTF.' : 'Choose an image file.');
  const id = `${input.type}-${crypto.randomUUID()}`;
  const path = `${input.type}/${id}.${extension(file.name)}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type || undefined, cacheControl: '31536000' });
  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);
  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = publicData.publicUrl;
  const row = {
    id, asset_type: input.type, name: input.name.trim() || file.name.replace(/\.[^.]+$/, ''),
    family: input.type === 'font' ? (input.family || `KitnovaCustom${Date.now()}`) : null,
    css_class: input.type === 'font' ? (input.cssClass || `font-${slug(id)}`) : null,
    category: input.type === 'artwork' ? (input.category || 'other') : null,
    storage_path: path, public_url: publicUrl, is_enabled: true, is_default: false,
    sort_order: input.sortOrder ?? 999, preview_text: input.previewText || 'KITNOVA 10'
  };
  const { data, error } = await supabase.from('studio_assets').insert(row).select('*').single();
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw new Error(`Could not publish shared asset: ${error.message}`);
  }
  return data as SharedStudioAsset;
}

export async function listSharedStudioAssets(includeDisabled = false): Promise<{ fonts: StudioFont[]; artworks: StudioArtwork[] }> {
  let query = supabase.from('studio_assets').select('*').order('sort_order', { ascending: true });
  if (!includeDisabled) query = query.eq('is_enabled', true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const rows = (data || []) as SharedStudioAsset[];
  return {
    fonts: rows.filter(r => r.asset_type === 'font').map(r => ({
      id: r.id, name: r.name, family: r.family || r.name, cssClass: r.css_class || `font-${r.id}`,
      isEnabled: r.is_enabled, isDefault: r.is_default, sortOrder: r.sort_order,
      previewText: r.preview_text || 'KITNOVA 10', fontDataUrl: r.public_url
    })),
    artworks: rows.filter(r => r.asset_type === 'artwork').map(r => ({
      id: r.id, name: r.name, imageUrl: r.public_url, category: r.category || 'other',
      isEnabled: r.is_enabled, createdAt: r.created_at
    }))
  };
}

export async function updateSharedStudioAsset(id: string, updates: { is_enabled?: boolean; is_default?: boolean; name?: string; sort_order?: number }) {
  const { error } = await supabase.from('studio_assets').update(updates).eq('id', id);
  if (error) throw new Error(`Could not update shared asset: ${error.message}`);
}

export async function deleteSharedStudioAsset(id: string) {
  const { data: row, error: readError } = await supabase.from('studio_assets').select('storage_path').eq('id', id).single();
  if (readError) throw new Error(readError.message);
  const { error } = await supabase.from('studio_assets').delete().eq('id', id);
  if (error) throw new Error(`Could not delete shared asset: ${error.message}`);
  if (row?.storage_path) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove([row.storage_path]);
    if (storageError) console.warn('Asset metadata deleted; storage cleanup failed:', storageError.message);
  }
}
