-- =============================================================================
-- Sistema de usuarios multi-rol con RLS
-- Roles: superusuario | tutor | cliente | alumno | afiliado
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Esquema privado para funciones auxiliares (no expuesto al Data API)
-- -----------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- 1. Tipos
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum (
      'superusuario', 'tutor', 'cliente', 'alumno', 'afiliado'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'referral_status') then
    create type public.referral_status as enum ('pendiente', 'aprobado', 'pagado', 'anulado');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'enrollment_status') then
    create type public.enrollment_status as enum ('activo', 'completado', 'cancelado');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'service_status') then
    create type public.service_status as enum ('activo', 'finalizado', 'cancelado');
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- 2. Tablas
-- -----------------------------------------------------------------------------

-- 2.1 Perfiles (1:1 con auth.users)
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  full_name     text,
  avatar_url    text,
  phone         text,
  role          public.user_role not null default 'cliente',
  referral_code text not null unique,
  referred_by   uuid references public.profiles (id) on delete set null,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint profiles_referral_code_format check (referral_code ~ '^[A-Z0-9]{6,12}$'),
  constraint profiles_no_self_referral check (referred_by is distinct from id)
);

create index if not exists profiles_role_idx        on public.profiles (role);
create index if not exists profiles_referred_by_idx on public.profiles (referred_by);
create index if not exists profiles_email_idx       on public.profiles (lower(email));

-- 2.2 Catálogo de servicios
create table if not exists public.services (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  description     text,
  price           numeric(12, 2) not null default 0 check (price >= 0),
  currency        text not null default 'COP',
  commission_rate numeric(5, 4) not null default 0.10 check (commission_rate between 0 and 1),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 2.3 Catálogo de cursos
create table if not exists public.courses (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  description     text,
  cover_url       text,
  price           numeric(12, 2) not null default 0 check (price >= 0),
  currency        text not null default 'COP',
  commission_rate numeric(5, 4) not null default 0.10 check (commission_rate between 0 and 1),
  tutor_id        uuid references public.profiles (id) on delete set null,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists courses_tutor_id_idx on public.courses (tutor_id);

-- 2.4 Servicios adquiridos por clientes
create table if not exists public.client_services (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.profiles (id) on delete cascade,
  service_id  uuid not null references public.services (id) on delete restrict,
  status      public.service_status not null default 'activo',
  amount      numeric(12, 2) not null default 0 check (amount >= 0),
  currency    text not null default 'COP',
  starts_at   timestamptz not null default now(),
  ends_at     timestamptz,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists client_services_client_id_idx  on public.client_services (client_id);
create index if not exists client_services_service_id_idx on public.client_services (service_id);

-- 2.5 Inscripciones de alumnos a cursos
create table if not exists public.enrollments (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.profiles (id) on delete cascade,
  course_id    uuid not null references public.courses (id) on delete restrict,
  status       public.enrollment_status not null default 'activo',
  progress     smallint not null default 0 check (progress between 0 and 100),
  amount       numeric(12, 2) not null default 0 check (amount >= 0),
  currency     text not null default 'COP',
  enrolled_at  timestamptz not null default now(),
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (student_id, course_id)
);

create index if not exists enrollments_student_id_idx on public.enrollments (student_id);
create index if not exists enrollments_course_id_idx  on public.enrollments (course_id);

-- 2.6 Comisiones generadas por el sistema de referidos
create table if not exists public.referral_earnings (
  id           uuid primary key default gen_random_uuid(),
  referrer_id  uuid not null references public.profiles (id) on delete cascade,
  referred_id  uuid not null references public.profiles (id) on delete cascade,
  source_type  text not null check (source_type in ('servicio', 'curso')),
  source_id    uuid,
  base_amount  numeric(12, 2) not null default 0 check (base_amount >= 0),
  rate         numeric(5, 4) not null default 0.10 check (rate between 0 and 1),
  amount       numeric(12, 2) not null default 0 check (amount >= 0),
  currency     text not null default 'COP',
  status       public.referral_status not null default 'pendiente',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint referral_earnings_no_self check (referrer_id <> referred_id)
);

create index if not exists referral_earnings_referrer_id_idx on public.referral_earnings (referrer_id);
create index if not exists referral_earnings_referred_id_idx on public.referral_earnings (referred_id);
create index if not exists referral_earnings_status_idx      on public.referral_earnings (status);

