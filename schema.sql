-- 1. Create User Roles Type
create type public.user_role as enum ('admin', 'ustaz', 'student');

-- 2. Create Profiles Table
-- This table will store user data. It's linked to the auth.users table.
create table public.profiles (
  id uuid references auth.users not null primary key,
  name text not null,
  email text not null,
  phone text,
  role public.user_role not null default 'student'
);

-- 3. Set up Row Level Security (RLS) for Profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile."
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile."
  on public.profiles for update
  using ( auth.uid() = id );
  
-- This function is called when a new user signs up.
-- It creates a corresponding row in the public.profiles table.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (new.id, new.raw_user_meta_data->>'name', new.email, (new.raw_user_meta_data->>'role')::user_role);
  return new;
end;
$$;

-- This trigger calls the function when a new user is created.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 4. Create Classes Table
create table public.classes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  schedule text,
  price numeric not null,
  google_meet_link text,
  is_active boolean default true not null,
  type text default 'monthly' not null,
  instructor_id uuid references public.profiles(id),
  instructor_name text
);

-- 5. Set up RLS for Classes
alter table public.classes enable row level security;

create policy "Anyone can view active classes."
  on public.classes for select
  using ( is_active = true );

create policy "Admins can do anything with classes."
  on public.classes for all
  using ( (select role from profiles where id = auth.uid()) = 'admin' )
  with check ( (select role from profiles where id = auth.uid()) = 'admin' );
  
-- 6. Create Enrollments Table
create table public.enrollments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id) not null,
  class_id uuid references public.classes(id) not null,
  status text default 'Unpaid' not null -- Unpaid, Paid
);

-- 7. Set up RLS for Enrollments
alter table public.enrollments enable row level security;

create policy "Users can view their own enrollments."
  on public.enrollments for select
  using ( auth.uid() = user_id );
  
create policy "Users can create their own enrollments."
  on public.enrollments for insert
  with check ( auth.uid() = user_id );

create policy "Admins can do anything with enrollments."
  on public.enrollments for all
  using ( (select role from profiles where id = auth.uid()) = 'admin' )
  with check ( (select role from profiles where id = auth.uid()) = 'admin' );

-- 8. Seed Default Ustaz and Admin Roles (Optional, run after you register them)
-- First, register 'admin@test.com' and 'ustaz@test.com' through the app UI.
-- Then, run these UPDATE queries in the SQL editor to change their roles.
-- Replace the emails with the actual emails you registered.

-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'admin@test.com';

-- UPDATE public.profiles
-- SET role = 'ustaz'
-- WHERE email = 'ustaz@test.com';
