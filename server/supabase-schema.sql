-- AI Resume Builder — Supabase (PostgreSQL) schema
-- Case study: Kano State Polytechnic
--
-- Run once in: Supabase dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run: every statement is "if not exists" / "or replace".
--
-- Column names are snake_case. Nested data (education, experience, skills, …) is
-- stored as jsonb, matching the shape the React frontend already sends.

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at current on every UPDATE
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- users: students (identified by email, no password) and admins (bcrypt password)
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  email           text not null unique check (email = lower(email)),
  password        text,                                   -- bcrypt hash; null for students
  role            text not null default 'student' check (role in ('student', 'admin')),
  personal_info   jsonb not null default '{}'::jsonb      check (jsonb_typeof(personal_info) = 'object'),
  education       jsonb not null default '[]'::jsonb      check (jsonb_typeof(education) = 'array'),
  experience      jsonb not null default '[]'::jsonb      check (jsonb_typeof(experience) = 'array'),
  skills          jsonb not null default '[]'::jsonb      check (jsonb_typeof(skills) = 'array'),
  student_profile jsonb not null default '{"institution": "Kano State Polytechnic"}'::jsonb
                                                          check (jsonb_typeof(student_profile) = 'object'),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists users_role_idx on public.users (role);

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- resumes: one row per CV; a student can own many
-- ---------------------------------------------------------------------------
create table if not exists public.resumes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users (id) on delete cascade,
  resume_id    text not null,                             -- client-side id (uuid or demo slug)
  title        text not null default 'Untitled Resume',
  theme_color  text,
  template     text not null default 'classic' check (template in ('classic', 'modern')),
  first_name   text,
  last_name    text,
  job_title    text,
  address      text,
  phone        text,
  email        text,
  summery      text,                                      -- spelling kept to match the frontend field
  experience   jsonb not null default '[]'::jsonb check (jsonb_typeof(experience) = 'array'),
  education    jsonb not null default '[]'::jsonb check (jsonb_typeof(education) = 'array'),
  skills       jsonb not null default '[]'::jsonb check (jsonb_typeof(skills) = 'array'),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint resumes_user_resume_id_key unique (user_id, resume_id)
);

-- "latest CV for a student" and "list my CVs, newest first"
create index if not exists resumes_user_updated_idx on public.resumes (user_id, updated_at desc);

drop trigger if exists resumes_set_updated_at on public.resumes;
create trigger resumes_set_updated_at
  before update on public.resumes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- job_vacancies: posted by admins, matched against student CVs
-- ---------------------------------------------------------------------------
create table if not exists public.job_vacancies (
  id               uuid primary key default gen_random_uuid(),
  job_title        text not null,
  company          text not null,
  description      text not null,
  required_skills  jsonb not null default '[]'::jsonb check (jsonb_typeof(required_skills) = 'array'),
  posted_date      timestamptz not null default now(),
  posted_by        uuid references public.users (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists job_vacancies_posted_date_idx on public.job_vacancies (posted_date desc);
create index if not exists job_vacancies_title_company_idx on public.job_vacancies (job_title, company);
create index if not exists job_vacancies_posted_by_idx on public.job_vacancies (posted_by);

drop trigger if exists job_vacancies_set_updated_at on public.job_vacancies;
create trigger job_vacancies_set_updated_at
  before update on public.job_vacancies
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Security: Row Level Security on, with no policies.
-- The public anon key can read/write nothing; only the Express API (service role key,
-- which bypasses RLS) can access these tables.
-- ---------------------------------------------------------------------------
alter table public.users         enable row level security;
alter table public.resumes       enable row level security;
alter table public.job_vacancies enable row level security;
