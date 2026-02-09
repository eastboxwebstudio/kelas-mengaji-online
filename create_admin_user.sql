-- Skrip untuk mencipta User Admin baru tanpa memadam database
-- Jalankan ini di Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  -- Tetapan Admin Baru
  new_email text := 'admin@celikkalam.com';
  new_password text := 'password123';
  new_name text := 'Super Admin';
  
  -- Variables internal
  existing_user_id uuid;
  new_user_id uuid := gen_random_uuid();
BEGIN

  -- 1. Check if email exists in auth.users
  SELECT id INTO existing_user_id FROM auth.users WHERE email = new_email;

  IF existing_user_id IS NOT NULL THEN
    -- UPDATE existing user
    UPDATE auth.users
    SET encrypted_password = crypt(new_password, gen_salt('bf')),
        raw_user_meta_data = jsonb_build_object('name', new_name, 'role', 'admin'),
        updated_at = now()
    WHERE id = existing_user_id;
    
    -- Update profile role
    UPDATE public.profiles
    SET role = 'admin', name = new_name
    WHERE id = existing_user_id;
    
    RAISE NOTICE 'Admin user updated: %', new_email;
  ELSE
    -- INSERT new user
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    VALUES (
      new_user_id, 
      '00000000-0000-0000-0000-000000000000', 
      'authenticated', 
      'authenticated', 
      new_email, 
      crypt(new_password, gen_salt('bf')), 
      now(), 
      '{"provider":"email","providers":["email"]}', 
      jsonb_build_object('name', new_name, 'role', 'admin'), 
      now(), 
      now()
    );
    
    -- Profile creation is handled by the trigger 'on_auth_user_created' in schema.sql
    -- But purely to be safe in case trigger fails or doesn't exist:
    INSERT INTO public.profiles (id, name, email, role)
    VALUES (new_user_id, new_name, new_email, 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
    
    RAISE NOTICE 'Admin user created: %', new_email;
  END IF;

END $$;