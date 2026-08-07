-- Type R Garage Portugal: MVP de membros, carros e fotografias.
-- Executar uma vez no SQL Editor de um projeto Supabase novo.

create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- A opção "automatic RLS" cria esta função no schema público. Ela só deve ser
-- chamada pelo trigger interno do Supabase, nunca diretamente pela Data API.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;

create table if not exists public.member_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  whatsapp text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  owner_name text not null,
  model text not null,
  generation text not null,
  year integer not null check (year between 1997 and 2035),
  color text not null,
  power_cv integer not null check (power_cv > 0),
  torque_nm integer check (torque_nm is null or torque_nm > 0),
  transmission text not null default 'Manual de 6 velocidades',
  location text,
  description text,
  instagram text,
  facebook text,
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.car_photos (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  public_url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists cars_owner_id_idx on public.cars(owner_id);
create index if not exists cars_status_idx on public.cars(status);
create index if not exists car_photos_car_id_idx on public.car_photos(car_id);
create index if not exists car_photos_owner_id_idx on public.car_photos(owner_id);
create index if not exists member_profiles_status_idx on public.member_profiles(status);

alter table public.cars drop constraint if exists cars_status_check;
update public.cars set status = 'pending' where status = 'draft';
alter table public.cars add constraint cars_status_check check (status in ('pending', 'published', 'rejected'));
alter table public.cars alter column status set default 'pending';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cars_set_updated_at on public.cars;
create trigger cars_set_updated_at before update on public.cars
for each row execute function public.set_updated_at();

drop trigger if exists member_profiles_set_updated_at on public.member_profiles;
create trigger member_profiles_set_updated_at before update on public.member_profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.member_profiles (id, email, name, whatsapp, status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), 'Membro Type R'),
    coalesce(new.raw_user_meta_data ->> 'whatsapp', ''),
    case when new.raw_app_meta_data ->> 'role' = 'admin' then 'approved' else 'pending' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_member();

create or replace function public.unpublish_inactive_member_cars()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status <> 'approved' then
    update public.cars set status = 'pending' where owner_id = new.id and status = 'published';
  end if;
  return new;
end;
$$;

drop trigger if exists on_member_status_changed on public.member_profiles;
create trigger on_member_status_changed after update of status on public.member_profiles
for each row when (old.status is distinct from new.status)
execute function public.unpublish_inactive_member_cars();

insert into public.member_profiles (id, email, name, whatsapp, status)
select id, coalesce(email, ''),
  coalesce(nullif(raw_user_meta_data ->> 'name', ''), 'Membro Type R'),
  coalesce(raw_user_meta_data ->> 'whatsapp', ''),
  case when raw_app_meta_data ->> 'role' = 'admin' then 'approved' else 'pending' end
from auth.users
on conflict (id) do nothing;

alter table public.cars enable row level security;
alter table public.car_photos enable row level security;
alter table public.member_profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create or replace function private.is_approved_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.member_profiles
    where id = (select auth.uid()) and status = 'approved'
  );
$$;

drop policy if exists "Members can view own profile" on public.member_profiles;
create policy "Members can view own profile" on public.member_profiles
for select to authenticated using ((select auth.uid()) = id or (select public.is_admin()));

drop policy if exists "Admins can update member profiles" on public.member_profiles;
create policy "Admins can update member profiles" on public.member_profiles
for update to authenticated using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Public can view published cars" on public.cars;
create policy "Public can view published cars" on public.cars
for select to anon using (status = 'published');

drop policy if exists "Members can view own cars" on public.cars;
create policy "Members can view own cars" on public.cars
for select to authenticated using (
  status = 'published' or (select auth.uid()) = owner_id or (select public.is_admin())
);

drop policy if exists "Members can create own cars" on public.cars;
create policy "Members can create own cars" on public.cars
for insert to authenticated with check (
  (select public.is_admin()) or
  ((select private.is_approved_member()) and (select auth.uid()) = owner_id and status = 'pending')
);

drop policy if exists "Members can update own cars" on public.cars;
create policy "Members can update own cars" on public.cars
for update to authenticated using ((select auth.uid()) = owner_id or (select public.is_admin()))
with check (
  (select public.is_admin()) or
  ((select private.is_approved_member()) and (select auth.uid()) = owner_id and status = 'pending')
);

drop policy if exists "Members can delete own cars" on public.cars;
create policy "Members can delete own cars" on public.cars
for delete to authenticated using ((select auth.uid()) = owner_id or (select public.is_admin()));

drop policy if exists "Public can view photos of published cars" on public.car_photos;
create policy "Public can view photos of published cars" on public.car_photos
for select to anon using (
  exists (select 1 from public.cars where cars.id = car_photos.car_id and cars.status = 'published')
);

drop policy if exists "Members can view own photos" on public.car_photos;
create policy "Members can view own photos" on public.car_photos
for select to authenticated using (
  (select auth.uid()) = owner_id or (select public.is_admin()) or
  exists (select 1 from public.cars where cars.id = car_photos.car_id and cars.status = 'published')
);

drop policy if exists "Members can create own photos" on public.car_photos;
create policy "Members can create own photos" on public.car_photos
for insert to authenticated with check (
  (select public.is_admin()) or (
    (select private.is_approved_member()) and (select auth.uid()) = owner_id and
    exists (select 1 from public.cars where cars.id = car_photos.car_id and cars.owner_id = (select auth.uid()) and cars.status = 'pending')
  )
);

drop policy if exists "Members can delete own photos" on public.car_photos;
create policy "Members can delete own photos" on public.car_photos
for delete to authenticated using (
  (select public.is_admin()) or (
    (select auth.uid()) = owner_id and
    exists (select 1 from public.cars where cars.id = car_photos.car_id and cars.owner_id = (select auth.uid()) and cars.status = 'pending')
  )
);

drop policy if exists "Admins can update photo ownership" on public.car_photos;
create policy "Admins can update photo ownership" on public.car_photos
for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

grant select on public.cars, public.car_photos to anon;
grant select, insert, update, delete on public.cars, public.car_photos to authenticated;
grant select, update on public.member_profiles to authenticated;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function private.is_approved_member() from public, anon;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_member() from public, anon, authenticated;
revoke execute on function public.unpublish_inactive_member_cars() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function private.is_approved_member() to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('car-photos', 'car-photos', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view car photos" on storage.objects;
create policy "Public can view car photos" on storage.objects
for select to anon, authenticated using (bucket_id = 'car-photos');

drop policy if exists "Members can upload own car photos" on storage.objects;
create policy "Members can upload own car photos" on storage.objects
for insert to authenticated with check (
  bucket_id = 'car-photos' and (
    (select public.is_admin()) or
    ((select private.is_approved_member()) and (storage.foldername(name))[1] = (select auth.uid()::text))
  )
);

drop policy if exists "Members can delete own car photos" on storage.objects;
create policy "Members can delete own car photos" on storage.objects
for delete to authenticated using (
  bucket_id = 'car-photos' and (
    owner_id = (select auth.uid()::text) or
    (select public.is_admin()) or
    exists (
      select 1 from public.car_photos
      where car_photos.storage_path = storage.objects.name
        and car_photos.owner_id = (select auth.uid())
    )
  )
);
