-- Type R Garage Portugal: MVP de membros, carros e fotografias.
-- Executar uma vez no SQL Editor de um projeto Supabase novo.

create extension if not exists pgcrypto;

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
  status text not null default 'draft' check (status in ('draft', 'published')),
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

alter table public.cars enable row level security;
alter table public.car_photos enable row level security;

drop policy if exists "Public can view published cars" on public.cars;
create policy "Public can view published cars" on public.cars
for select to anon, authenticated using (status = 'published');

drop policy if exists "Members can view own cars" on public.cars;
create policy "Members can view own cars" on public.cars
for select to authenticated using ((select auth.uid()) = owner_id);

drop policy if exists "Members can create own cars" on public.cars;
create policy "Members can create own cars" on public.cars
for insert to authenticated with check ((select auth.uid()) = owner_id);

drop policy if exists "Members can update own cars" on public.cars;
create policy "Members can update own cars" on public.cars
for update to authenticated using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists "Members can delete own cars" on public.cars;
create policy "Members can delete own cars" on public.cars
for delete to authenticated using ((select auth.uid()) = owner_id);

drop policy if exists "Public can view photos of published cars" on public.car_photos;
create policy "Public can view photos of published cars" on public.car_photos
for select to anon, authenticated using (
  exists (select 1 from public.cars where cars.id = car_photos.car_id and cars.status = 'published')
);

drop policy if exists "Members can view own photos" on public.car_photos;
create policy "Members can view own photos" on public.car_photos
for select to authenticated using ((select auth.uid()) = owner_id);

drop policy if exists "Members can create own photos" on public.car_photos;
create policy "Members can create own photos" on public.car_photos
for insert to authenticated with check (
  (select auth.uid()) = owner_id and
  exists (select 1 from public.cars where cars.id = car_photos.car_id and cars.owner_id = (select auth.uid()))
);

drop policy if exists "Members can delete own photos" on public.car_photos;
create policy "Members can delete own photos" on public.car_photos
for delete to authenticated using ((select auth.uid()) = owner_id);

grant select on public.cars, public.car_photos to anon;
grant select, insert, update, delete on public.cars, public.car_photos to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('car-photos', 'car-photos', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view car photos" on storage.objects;
create policy "Public can view car photos" on storage.objects
for select to anon, authenticated using (bucket_id = 'car-photos');

drop policy if exists "Members can upload own car photos" on storage.objects;
create policy "Members can upload own car photos" on storage.objects
for insert to authenticated with check (
  bucket_id = 'car-photos' and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Members can delete own car photos" on storage.objects;
create policy "Members can delete own car photos" on storage.objects
for delete to authenticated using (
  bucket_id = 'car-photos' and owner_id = (select auth.uid()::text)
);
