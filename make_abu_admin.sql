-- Jalankan skrip ini di Supabase SQL Editor untuk menjadikan Abu sebagai Admin

-- 1. Kemaskini table profiles (Ini yang paling PENTING untuk akses dashboard app)
UPDATE public.profiles
SET role = 'admin'
WHERE id = '5018ad97-d7b3-4aad-9f44-2b9c0463ef16';

-- 2. Kemaskini metadata auth.users (Supaya konsisten jika token refresh)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"admin"')
WHERE id = '5018ad97-d7b3-4aad-9f44-2b9c0463ef16';

-- 3. Semak perubahan
SELECT * FROM public.profiles WHERE id = '5018ad97-d7b3-4aad-9f44-2b9c0463ef16';