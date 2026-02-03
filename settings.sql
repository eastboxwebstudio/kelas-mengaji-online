
-- 1. Create a Key-Value store table for settings
create table public.app_settings (
  key text primary key,
  value text,
  updated_at timestamp with time zone default now()
);

-- 2. Enable RLS
alter table public.app_settings enable row level security;

-- 3. Policy: Only Admins can view and modify settings
-- Pelajar atau Guest tidak boleh baca table ini.
create policy "Admins can manage settings" on public.app_settings
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 4. (Optional) Insert initial empty rows to avoid 'null' issues later
insert into public.app_settings (key, value) values 
('toyyibpay_secret_key', ''),
('toyyibpay_category_code', '')
on conflict (key) do nothing;
