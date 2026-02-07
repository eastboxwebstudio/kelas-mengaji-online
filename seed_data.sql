-- Pastikan pgcrypto aktif
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. BERSIHKAN DATA LAMA (CLEANUP - DELETE ALL)
DELETE FROM public.enrollments;
DELETE FROM public.classes;
DELETE FROM public.profiles;
DELETE FROM auth.users;

-- 2. Define UUIDs tetap
DO $$
DECLARE
  admin_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  class_iqra_id uuid := '11111111-1111-1111-1111-111111111111';
  class_tajwid_id uuid := '22222222-2222-2222-2222-222222222222';
  class_taranum_id uuid := '33333333-3333-3333-3333-333333333333';
BEGIN

  -- 3. Masukkan User Baru (HANYA ADMIN)
  -- Nota: Trigger 'on_auth_user_created' akan automatik create profile dalam table public.profiles.
  
  -- ADMIN: aizat@eastbox.com.my
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    admin_id, 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'aizat@eastbox.com.my', 
    crypt('#levis501lvC', gen_salt('bf')), -- Password Hash
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"name":"Admin Aizat", "role":"admin", "phone":"012-3456789"}', 
    now(), 
    now()
  );

  -- 4. Masukkan Kelas Contoh (Assign kepada Admin ini kerana tiada ustaz lain)
  INSERT INTO public.classes (id, title, description, schedule, price, google_meet_link, is_active, type, instructor_id, instructor_name)
  VALUES 
  (
    class_iqra_id,
    'Kelas Asas Iqra (Dewasa)', 
    'Sesuai untuk golongan dewasa yang ingin mula belajar membaca Al-Quran dari asas (Iqra 1-6). Kelas santai dan tidak menekan.', 
    'Setiap Isnin, 9:00 PM', 
    50, 
    'https://meet.google.com/abc-defg-hij', 
    true, 
    'monthly', 
    admin_id, 
    'Ustaz Aizat'
  ),
  (
    class_tajwid_id,
    'Kelas Talaqqi & Tajwid', 
    'Memperbaiki bacaan Al-Quran dengan hukum tajwid yang betul. Bacaan secara Talaqqi Musyafahah.', 
    'Setiap Rabu, 8:30 PM', 
    80, 
    'https://meet.google.com/xyz-woow-klm', 
    true, 
    'monthly', 
    admin_id, 
    'Ustaz Aizat'
  ),
  (
    class_taranum_id,
    'Bengkel Asas Tarannum', 
    'Bengkel sehari pengenalan kepada seni lagu Al-Quran (Bayyati & Nahawand).', 
    'Sabtu, 10:00 AM (25 Feb)', 
    30, 
    'https://meet.google.com/workshop-link', 
    true, 
    'single', 
    admin_id, 
    'Ustaz Aizat'
  )
  ON CONFLICT (id) DO NOTHING;

END $$;