create extension if not exists pgcrypto;

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  animal_group text,
  species text not null,
  specific_species text,
  subspecies_or_morph text,
  breed text,
  sex text,
  weight_kg numeric,
  weight_unit text,
  birth_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pets
  add column if not exists animal_group text;

alter table public.pets
  add column if not exists specific_species text;

alter table public.pets
  add column if not exists subspecies_or_morph text;

alter table public.pets
  add column if not exists sex text;

alter table public.pets
  add column if not exists weight_unit text;

create table if not exists public.treatments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  medication_name text not null,
  dose text not null,
  dose_unit text not null,
  frequency_hours integer not null check (frequency_hours > 0),
  start_at timestamptz not null,
  end_at timestamptz not null,
  instructions text,
  veterinarian_name text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint treatments_date_range_check check (end_at > start_at)
);

create table if not exists public.dose_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  treatment_id uuid not null references public.treatments(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  scheduled_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'applied', 'skipped', 'missed')),
  applied_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.pet_weight_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  weight_kg numeric not null check (weight_kg > 0),
  recorded_at date not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.pet_vaccines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  name text not null,
  applied_at date,
  next_due_at date,
  veterinarian_name text,
  clinic_name text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pets_user_id_idx
  on public.pets(user_id);

create index if not exists treatments_user_id_idx
  on public.treatments(user_id);

create index if not exists treatments_pet_id_idx
  on public.treatments(pet_id);

create index if not exists dose_schedules_user_scheduled_idx
  on public.dose_schedules(user_id, scheduled_at);

create index if not exists dose_schedules_treatment_id_idx
  on public.dose_schedules(treatment_id);

create index if not exists pet_weight_records_user_pet_date_idx
  on public.pet_weight_records(user_id, pet_id, recorded_at desc);

create index if not exists pet_vaccines_user_pet_due_idx
  on public.pet_vaccines(user_id, pet_id, next_due_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pets_set_updated_at on public.pets;
create trigger pets_set_updated_at
before update on public.pets
for each row execute function public.set_updated_at();

drop trigger if exists treatments_set_updated_at on public.treatments;
create trigger treatments_set_updated_at
before update on public.treatments
for each row execute function public.set_updated_at();

drop trigger if exists pet_vaccines_set_updated_at on public.pet_vaccines;
create trigger pet_vaccines_set_updated_at
before update on public.pet_vaccines
for each row execute function public.set_updated_at();

alter table public.pets enable row level security;
alter table public.treatments enable row level security;
alter table public.dose_schedules enable row level security;
alter table public.pet_weight_records enable row level security;
alter table public.pet_vaccines enable row level security;

drop policy if exists "Users can select own pets" on public.pets;
create policy "Users can select own pets"
on public.pets for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own pets" on public.pets;
create policy "Users can insert own pets"
on public.pets for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own pets" on public.pets;
create policy "Users can update own pets"
on public.pets for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own pets" on public.pets;
create policy "Users can delete own pets"
on public.pets for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can select own treatments" on public.treatments;
create policy "Users can select own treatments"
on public.treatments for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own treatments" on public.treatments;
create policy "Users can insert own treatments"
on public.treatments for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own treatments" on public.treatments;
create policy "Users can update own treatments"
on public.treatments for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own treatments" on public.treatments;
create policy "Users can delete own treatments"
on public.treatments for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can select own dose schedules" on public.dose_schedules;
create policy "Users can select own dose schedules"
on public.dose_schedules for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own dose schedules" on public.dose_schedules;
create policy "Users can insert own dose schedules"
on public.dose_schedules for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own dose schedules" on public.dose_schedules;
create policy "Users can update own dose schedules"
on public.dose_schedules for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own dose schedules" on public.dose_schedules;
create policy "Users can delete own dose schedules"
on public.dose_schedules for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can select own pet weights" on public.pet_weight_records;
create policy "Users can select own pet weights"
on public.pet_weight_records for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own pet weights" on public.pet_weight_records;
create policy "Users can insert own pet weights"
on public.pet_weight_records for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own pet weights" on public.pet_weight_records;
create policy "Users can update own pet weights"
on public.pet_weight_records for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own pet weights" on public.pet_weight_records;
create policy "Users can delete own pet weights"
on public.pet_weight_records for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can select own pet vaccines" on public.pet_vaccines;
create policy "Users can select own pet vaccines"
on public.pet_vaccines for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own pet vaccines" on public.pet_vaccines;
create policy "Users can insert own pet vaccines"
on public.pet_vaccines for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own pet vaccines" on public.pet_vaccines;
create policy "Users can update own pet vaccines"
on public.pet_vaccines for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own pet vaccines" on public.pet_vaccines;
create policy "Users can delete own pet vaccines"
on public.pet_vaccines for delete
to authenticated
using (auth.uid() = user_id);

notify pgrst, 'reload schema';
