-- Pastikan pgcrypto aktif
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. BERSIHKAN DATA LAMA (CLEANUP)
-- Kita perlu memadam mengikut urutan foreign key untuk mengelakkan ralat constraint
DELETE FROM public.enrollments WHERE user_id IN (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', -- ali
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- admin
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', -- adam
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33'  -- sarah
);

DELETE FROM public.classes WHERE instructor_id IN (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', -- adam
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33'  -- sarah
);

DELETE FROM public.profiles WHERE id IN (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44'
);

DELETE FROM auth.users WHERE id IN (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44'
);

-- 2. Define UUIDs tetap
DO $$
DECLARE
  admin_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  ustaz_adam_id uuid := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22';
  ustaz_sarah_id uuid := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33';
  student_ali_id uuid := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44';
  class_iqra_id uuid := '11111111-1111-1111-1111-111111111111';
  class_tajwid_id uuid := '22222222-2222-2222-2222-222222222222';
  class_taranum_id uuid := '33333333-3333-3333-3333-333333333333';
BEGIN

  -- 3. Masukkan Users Baru
  -- Nota: Trigger 'on_auth_user_created' akan automatik create profile.
  
  -- ADMIN
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    admin_id, 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'admin@demo.com', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"name":"Admin CelikKalam", "role":"admin"}', 
    now(), 
    now()
  );

  -- USTAZ ADAM
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    ustaz_adam_id, 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'adam@ustaz.com', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"name":"Ustaz Adam", "role":"ustaz", "phone":"012-3456789"}', 
    now(), 
    now()
  );

  -- USTAZAH SARAH
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    ustaz_sarah_id, 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'sarah@ustaz.com', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"name":"Ustazah Sarah", "role":"ustaz", "phone":"019-8765432"}', 
    now(), 
    now()
  );

  -- STUDENT ALI
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    student_ali_id, 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'ali@student.com', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"name":"Ali Bin Abu", "role":"student", "phone":"011-22334455"}', 
    now(), 
    now()
  );

  -- 4. Masukkan Kelas (Classes)
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
    ustaz_adam_id, 
    'Ustaz Adam'
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
    ustaz_sarah_id, 
    'Ustazah Sarah'
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
    ustaz_adam_id, 
    'Ustaz Adam'
  )
  ON CONFLICT (id) DO NOTHING;

  -- 5. Masukkan Pendaftaran (Enrollments)
  -- Ali daftar kelas Iqra (Belum Bayar)
  INSERT INTO public.enrollments (user_id, class_id, status)
  VALUES (student_ali_id, class_iqra_id, 'Unpaid')
  ON CONFLICT DO NOTHING;

  -- Ali daftar kelas Tajwid (Dah Bayar)
  INSERT INTO public.enrollments (user_id, class_id, status)
  VALUES (student_ali_id, class_tajwid_id, 'Paid')
  ON CONFLICT DO NOTHING;

END $$;