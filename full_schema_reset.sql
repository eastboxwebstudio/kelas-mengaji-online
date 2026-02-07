-- SKRIP PEMULIHAN PENUH DATABASE (FULL RESET)
-- Amaran: Skrip ini akan memadam SEMUA data sedia ada dan membina semula struktur dari awal.

-- 1. BERSIHKAN DATABASE (DROP ALL)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.enrollments;
DROP TABLE IF EXISTS public.classes;
DROP TABLE IF EXISTS public.profiles;
DROP TYPE IF EXISTS public.user_role;

-- Bersihkan user auth (Hati-hati: memadam semua user login)
DELETE FROM auth.users;

-- 2. BINA SEMULA SCHEMA (CREATE SCHEMA)

-- Create User Roles Type
CREATE TYPE public.user_role AS ENUM ('admin', 'ustaz', 'student');

-- Create Profiles Table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  role public.user_role NOT NULL DEFAULT 'student'
);

-- RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user signup automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', 'User'), 
    new.email, 
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN new;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create Classes Table
CREATE TABLE public.classes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  title text NOT NULL,
  description text,
  schedule text,
  price numeric NOT NULL,
  google_meet_link text,
  is_active boolean DEFAULT true NOT NULL,
  type text DEFAULT 'monthly' NOT NULL,
  instructor_id uuid REFERENCES public.profiles(id),
  instructor_name text
);

-- RLS for Classes
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active classes." ON public.classes FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can do anything with classes." ON public.classes FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create Enrollments Table
CREATE TABLE public.enrollments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  class_id uuid REFERENCES public.classes(id) NOT NULL,
  status text DEFAULT 'Unpaid' NOT NULL
);

-- RLS for Enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own enrollments." ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own enrollments." ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can do anything with enrollments." ON public.enrollments FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Grant permissions (Fix for 'Database error querying schema')
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 3. MASUKKAN DATA (SEED DATA)

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  admin_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
BEGIN
  -- Insert Admin User (Trigger will create Profile automatically)
  INSERT INTO auth.users (
    id, 
    instance_id, 
    aud, 
    role, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    raw_app_meta_data, 
    raw_user_meta_data, 
    created_at, 
    updated_at,
    confirmation_token,
    recovery_token
  )
  VALUES (
    admin_id, 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'aizat@eastbox.com.my', 
    crypt('#levis501lvC', gen_salt('bf')), -- Password
    now(), -- Auto confirm email
    '{"provider":"email","providers":["email"]}', 
    '{"name":"Admin Aizat", "role":"admin", "phone":"012-3456789"}', 
    now(), 
    now(),
    '',
    ''
  );

  -- Insert Classes
  INSERT INTO public.classes (title, description, schedule, price, google_meet_link, is_active, type, instructor_id, instructor_name)
  VALUES 
  (
    'Kelas Asas Iqra (Dewasa)', 
    'Sesuai untuk golongan dewasa yang ingin mula belajar membaca Al-Quran dari asas.', 
    'Setiap Isnin, 9:00 PM', 
    50, 
    'https://meet.google.com/abc-defg-hij', 
    true, 
    'monthly', 
    admin_id, 
    'Ustaz Aizat'
  ),
  (
    'Kelas Talaqqi & Tajwid', 
    'Memperbaiki bacaan Al-Quran dengan hukum tajwid yang betul.', 
    'Setiap Rabu, 8:30 PM', 
    80, 
    'https://meet.google.com/xyz-woow-klm', 
    true, 
    'monthly', 
    admin_id, 
    'Ustaz Aizat'
  );

END $$;