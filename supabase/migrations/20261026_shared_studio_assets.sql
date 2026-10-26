-- Shared KITNOVA studio fonts and artwork. Run in the Supabase SQL editor.
-- Uses the existing public.is_admin() security-definer helper from supabase_schema_rls.sql.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kitnova-studio-assets', 'kitnova-studio-assets', true, 8388608,
  array['image/png','image/jpeg','image/webp','image/gif','image/svg+xml','font/woff','font/woff2','font/ttf','font/otf','application/font-woff','application/font-woff2','application/x-font-ttf','application/vnd.ms-opentype','application/octet-stream']
) on conflict (id) do update set public = true, file_size_limit = 8388608;

create table if not exists public.studio_assets (
  id text primary key,
  asset_type text not null check (asset_type in ('font','artwork')),
  name text not null check (length(trim(name)) between 1 and 120),
  family text,
  css_class text,
  category text check (category is null or category in ('crest','sponsor','badge','pattern','other')),
  storage_path text not null unique,
  public_url text not null,
  is_enabled boolean not null default true,
  is_default boolean not null default false,
  sort_order integer not null default 999,
  preview_text text default 'KITNOVA 10',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists studio_assets_customer_lookup on public.studio_assets(asset_type, is_enabled, sort_order);
alter table public.studio_assets enable row level security;
drop policy if exists "Customers read enabled studio assets" on public.studio_assets;
create policy "Customers read enabled studio assets" on public.studio_assets for select to anon, authenticated using (is_enabled = true or public.is_admin());
drop policy if exists "Admins insert studio assets" on public.studio_assets;
create policy "Admins insert studio assets" on public.studio_assets for insert to authenticated with check (public.is_admin() and created_by = auth.uid());
drop policy if exists "Admins update studio assets" on public.studio_assets;
create policy "Admins update studio assets" on public.studio_assets for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins delete studio assets" on public.studio_assets;
create policy "Admins delete studio assets" on public.studio_assets for delete to authenticated using (public.is_admin());

-- Public object reads are allowed for published assets. Writes/deletes require active admin role.
drop policy if exists "Public read kitnova studio assets" on storage.objects;
create policy "Public read kitnova studio assets" on storage.objects for select to anon, authenticated using (bucket_id = 'kitnova-studio-assets');
drop policy if exists "Admins upload kitnova studio assets" on storage.objects;
create policy "Admins upload kitnova studio assets" on storage.objects for insert to authenticated with check (bucket_id = 'kitnova-studio-assets' and public.is_admin());
drop policy if exists "Admins update kitnova studio assets" on storage.objects;
create policy "Admins update kitnova studio assets" on storage.objects for update to authenticated using (bucket_id = 'kitnova-studio-assets' and public.is_admin()) with check (bucket_id = 'kitnova-studio-assets' and public.is_admin());
drop policy if exists "Admins delete kitnova studio assets" on storage.objects;
create policy "Admins delete kitnova studio assets" on storage.objects for delete to authenticated using (bucket_id = 'kitnova-studio-assets' and public.is_admin());
