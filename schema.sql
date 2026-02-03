
-- 1. Create Profiles Table (Extends default auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  name text,
  phone text,
  role text check (role in ('student', 'admin', 'ustaz')) default 'student',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Classes Table
create table public.classes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  price numeric not null,
  google_meet_link text,
  is_active boolean default true,
  type text check (type in ('single', 'monthly')) default 'monthly',
  instructor_id uuid references public.profiles(id),
  instructor_name text, -- De-normalized for easier display
  sessions jsonb, -- Storing dates array as JSON
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Enrollments Table
create table public.enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  class_id uuid references public.classes(id) not null,
  status text check (status in ('Unpaid', 'Paid')) default 'Unpaid',
  transaction_id text,
  bill_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.enrollments enable row level security;

-- 5. Policies (Security Rules)

-- Profiles: Public can read basic info (for instructors), Users update own.
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Classes: Everyone can view active classes. Only Admin/Ustaz can insert/update.
create policy "Classes are viewable by everyone" on classes for select using (true);
create policy "Instructors/Admins can insert classes" on classes for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'ustaz'))
);

-- Enrollments: Users view own enrollments.
create policy "Users view own enrollments" on enrollments for select using (auth.uid() = user_id);
create policy "Instructors view enrollments for their classes" on enrollments for select using (
  exists (select 1 from classes where id = enrollments.class_id and instructor_id = auth.uid())
);
create policy "Users can enroll themselves" on enrollments for insert with check (auth.uid() = user_id);

-- 6. Trigger to auto-create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'name', coalesce(new.raw_user_meta_data->>'role', 'student'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
