begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(trim(display_name)) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  text_size text not null default 'standard' check (text_size in ('standard', 'large', 'extra-large')),
  high_contrast boolean not null default false,
  reduce_motion boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 200),
  address text not null check (char_length(trim(address)) between 1 and 1000),
  city text not null check (char_length(trim(city)) between 1 and 100),
  phone text check (phone is null or char_length(phone) <= 50),
  operating_hours text check (operating_hours is null or char_length(operating_hours) <= 1000),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  timezone text not null default 'Asia/Manila' check (timezone = 'Asia/Manila'),
  is_verified boolean not null default false,
  verified_at timestamptz,
  booking_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((latitude is null) = (longitude is null)),
  check (not is_verified or verified_at is not null)
);
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(trim(name)) between 1 and 150),
  description text check (description is null or char_length(description) <= 2000),
  synonyms text[] not null default '{}' check (cardinality(synonyms) <= 30),
  is_verified boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not is_verified or verified_at is not null)
);
create table public.facility_services (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  is_verified boolean not null default false,
  verified_at timestamptz,
  booking_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (facility_id, service_id),
  check (not is_verified or verified_at is not null)
);
create table public.appointment_slots (
  id uuid primary key default gen_random_uuid(),
  facility_service_id uuid not null references public.facility_services(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer not null default 1 check (capacity between 1 and 50),
  reserved_count integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (reserved_count between 0 and capacity),
  unique (facility_service_id, starts_at)
);
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  slot_id uuid not null references public.appointment_slots(id) on delete restrict,
  reference text not null unique default ('ALA-' || replace(gen_random_uuid()::text, '-', '')),
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,
  check ((status = 'cancelled') = (cancelled_at is not null))
);
create unique index appointments_one_active_per_resident_slot on public.appointments(user_id, slot_id) where status in ('pending', 'confirmed');
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  message text not null check (char_length(message) between 1 and 1000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.health_articles (
  id uuid primary key default gen_random_uuid(),
  category_id text not null check (category_id in ('c1','c2','c3','c4','c5','c6','c7','c8')),
  title text not null check (char_length(trim(title)) between 1 and 200),
  body text not null check (char_length(body) between 1 and 50000),
  source_url text check (source_url is null or source_url ~ '^https://'),
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (published_at is null or reviewed_at is not null)
);

create index facilities_verified_city on public.facilities(city) where is_verified;
create index facility_services_service on public.facility_services(service_id);
create index slots_service_start on public.appointment_slots(facility_service_id, starts_at);
create index appointments_owner_created on public.appointments(user_id, created_at desc);
create index appointments_slot on public.appointments(slot_id);
create index notifications_owner_created on public.notifications(user_id, created_at desc);
create index health_articles_category_published on public.health_articles(category_id, published_at desc);

create function private.notification_read_timestamp() returns trigger language plpgsql set search_path = '' as $$
begin new.read_at = case when new.read_at is null then null else now() end; return new; end;
$$;
revoke all on function private.notification_read_timestamp() from public, anon, authenticated;
create trigger notification_read_timestamp before update on public.notifications for each row execute function private.notification_read_timestamp();

create function private.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
revoke all on function private.touch_updated_at() from public, anon, authenticated;
do $$ declare target text; begin
  foreach target in array array['profiles','user_preferences','facilities','services','facility_services','appointment_slots','appointments','health_articles'] loop
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function private.touch_updated_at()', target);
  end loop;
end; $$;

create function private.bootstrap_resident() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id) values (new.id);
  insert into public.user_preferences(user_id) values (new.id);
  return new;
end;
$$;
revoke all on function private.bootstrap_resident() from public, anon, authenticated;
create trigger bootstrap_resident after insert on auth.users for each row execute function private.bootstrap_resident();
-- Backfill existing accounts without trusting user-editable auth metadata.
insert into public.profiles(id) select id from auth.users on conflict (id) do nothing;
insert into public.user_preferences(user_id) select id from auth.users on conflict (user_id) do nothing;

do $$ declare target text; begin
  foreach target in array array['profiles','user_preferences','facilities','services','facility_services','appointment_slots','appointments','notifications','health_articles'] loop
    execute format('alter table public.%I enable row level security', target);
    execute format('revoke all on public.%I from public, anon, authenticated', target);
  end loop;
end; $$;
grant usage on schema public to anon, authenticated;
grant select on public.facilities, public.services, public.facility_services, public.appointment_slots, public.health_articles to anon, authenticated;
grant select on public.profiles, public.user_preferences, public.appointments, public.notifications to authenticated;
grant update(display_name) on public.profiles to authenticated;
grant update(text_size, high_contrast, reduce_motion) on public.user_preferences to authenticated;
grant update(read_at) on public.notifications to authenticated;

create policy profiles_read_own on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy preferences_read_own on public.user_preferences for select to authenticated using (user_id = (select auth.uid()));
create policy preferences_update_own on public.user_preferences for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy appointments_read_own on public.appointments for select to authenticated using (user_id = (select auth.uid()));
create policy notifications_read_own on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy notifications_update_own on public.notifications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy facilities_verified_read on public.facilities for select to anon, authenticated using (is_verified);
create policy services_verified_read on public.services for select to anon, authenticated using (is_verified);
create policy facility_services_verified_read on public.facility_services for select to anon, authenticated using (
  is_verified and exists(select 1 from public.facilities f where f.id = facility_id and f.is_verified)
  and exists(select 1 from public.services s where s.id = service_id and s.is_verified)
);
create policy slots_verified_read on public.appointment_slots for select to anon, authenticated using (
  is_published and starts_at > now() and exists (
    select 1 from public.facility_services fs join public.facilities f on f.id = fs.facility_id
    where fs.id = facility_service_id and fs.is_verified and fs.booking_enabled and f.is_verified and f.booking_enabled
  )
);
create policy articles_reviewed_read on public.health_articles for select to anon, authenticated using (
  reviewed_at is not null and published_at is not null and published_at <= now()
);

comment on table public.appointments is 'Direct resident writes are prohibited. Transactional booking and policy-controlled transitions will be implemented before booking is enabled.';
comment on column public.appointment_slots.reserved_count is 'Server-managed only; future booking operations must lock the slot and maintain this count in the same transaction.';
comment on table public.facility_services is 'Treat dialysis sessions, consultations, and related services as distinct verified service records.';
commit;
