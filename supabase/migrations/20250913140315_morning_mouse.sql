-- =====================================================================
-- READ THE ROOM — Supabase Schema (ONE FILE, SAFE TO RE-RUN)
-- Purpose: overwrite/standardize your schema, policies, triggers, and
--          provide a back-compat view `public.vote_rooms` over `battles`.
-- How to use: Paste into Supabase Studio -> SQL -> Run.
-- This script is idempotent (uses IF NOT EXISTS / DROP+CREATE where needed).
-- =====================================================================

-------------------------
-- 0) EXTENSIONS
-------------------------
create extension if not exists "pgcrypto";

-------------------------
-- 1) TABLES (CREATE/ALIGN)
-------------------------

-- 1.1 user_profiles (extends Supabase auth.users)
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  total_votes int default 0,
  reputation_score int default 0,
  created_at timestamptz default now()
);

-- In case existing table is missing any column (make additive fixes)
alter table public.user_profiles
  add column if not exists username text,
  add column if not exists display_name text,
  add column if not exists total_votes int default 0,
  add column if not exists reputation_score int default 0,
  add column if not exists created_at timestamptz default now();

-- 1.2 battles (universal battles table)
create table if not exists public.battles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  battle_type text not null,          -- will apply a check constraint below
  item_a jsonb not null,              -- full item data
  item_b jsonb not null,
  ends_at timestamptz,
  created_at timestamptz default now(),
  is_active boolean default true,
  total_votes int default 0
);

-- Add any missing columns if the table already existed
alter table public.battles
  add column if not exists description text,
  add column if not exists ends_at timestamptz,
  add column if not exists created_at timestamptz default now(),
  add column if not exists is_active boolean default true,
  add column if not exists total_votes int default 0,
  add column if not exists item_a jsonb,
  add column if not exists item_b jsonb,
  add column if not exists battle_type text;

-- Ensure our named CHECK constraint for battle_type
alter table public.battles drop constraint if exists battles_battle_type_check;
alter table public.battles drop constraint if exists battles_battle_type_chk;
alter table public.battles
  add constraint battles_battle_type_chk
  check (battle_type in ('movie','book','game','music','food'));

-- 1.3 battle_votes (unique per session per battle)
create table if not exists public.battle_votes (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  item_choice text not null,     -- 'A' or 'B'
  session_id text not null,
  created_at timestamptz default now(),
  unique (battle_id, session_id)
);

-- Add any missing columns
alter table public.battle_votes
  add column if not exists battle_id uuid,
  add column if not exists item_choice text,
  add column if not exists session_id text,
  add column if not exists created_at timestamptz default now();

-- Ensure item_choice check
alter table public.battle_votes drop constraint if exists battle_votes_item_choice_chk;
alter table public.battle_votes
  add constraint battle_votes_item_choice_chk check (item_choice in ('A','B'));

-- 1.4 battle_arguments (short arguments attached to a battle + side)
create table if not exists public.battle_arguments (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  item_choice text not null,     -- 'A' or 'B'
  content text not null check (length(content) <= 280),
  author text default 'Anonymous',
  likes int default 0,
  created_at timestamptz default now()
);

alter table public.battle_arguments
  add column if not exists battle_id uuid,
  add column if not exists item_choice text,
  add column if not exists content text,
  add column if not exists author text default 'Anonymous',
  add column if not exists likes int default 0,
  add column if not exists created_at timestamptz default now();

alter table public.battle_arguments drop constraint if exists battle_arguments_item_choice_chk;
alter table public.battle_arguments
  add constraint battle_arguments_item_choice_chk check (item_choice in ('A','B'));

alter table public.battle_arguments drop constraint if exists battle_arguments_content_chk;
alter table public.battle_arguments
  add constraint battle_arguments_content_chk check (length(content) <= 280);

-------------------------
-- 2) INDEXES (CREATE IF ABSENT)
-------------------------
create index if not exists idx_battles_type_active_created
  on public.battles (battle_type, is_active, created_at desc);

create index if not exists idx_votes_battle_created
  on public.battle_votes (battle_id, created_at desc);

create index if not exists idx_args_battle_created
  on public.battle_arguments (battle_id, created_at desc);

-------------------------
-- 3) RLS (ENABLE + OVERWRITE POLICIES)
-------------------------
alter table public.user_profiles enable row level security;
alter table public.battles enable row level security;
alter table public.battle_votes enable row level security;
alter table public.battle_arguments enable row level security;

-- Drop existing policies to overwrite cleanly
drop policy if exists "profiles_read_own_or_public" on public.user_profiles;
drop policy if exists "profiles_insert_self" on public.user_profiles;
drop policy if exists "profiles_update_self" on public.user_profiles;
drop policy if exists "profiles_delete_self" on public.user_profiles;

drop policy if exists "battles_public_select" on public.battles;
drop policy if exists "battles_anyone_create" on public.battles;
drop policy if exists "battles_service_update_delete" on public.battles;
drop policy if exists "battles_service_delete" on public.battles;

drop policy if exists "votes_public_select" on public.battle_votes;
drop policy if exists "votes_create_if_battle_active" on public.battle_votes;
drop policy if exists "votes_no_updates" on public.battle_votes;
drop policy if exists "votes_no_deletes_public" on public.battle_votes;

drop policy if exists "arguments_public_select" on public.battle_arguments;
drop policy if exists "arguments_create_if_battle_exists" on public.battle_arguments;
drop policy if exists "arguments_like_updates_service_only" on public.battle_arguments;
drop policy if exists "arguments_delete_service_only" on public.battle_arguments;

-- Recreate policies

-- user_profiles
create policy "profiles_read_own_or_public"
  on public.user_profiles
  for select
  to anon, authenticated
  using (true);

create policy "profiles_insert_self"
  on public.user_profiles
  for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles_update_self"
  on public.user_profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_delete_self"
  on public.user_profiles
  for delete
  to authenticated
  using (id = auth.uid());

-- battles
create policy "battles_public_select"
  on public.battles
  for select
  to anon, authenticated
  using (true);

create policy "battles_anyone_create"
  on public.battles
  for insert
  to anon, authenticated
  with check (true);

-- service-role only for updates/deletes (use server key if you need admin ops)
create policy "battles_service_update_delete"
  on public.battles
  for update
  to service_role
  using (true)
  with check (true);

create policy "battles_service_delete"
  on public.battles
  for delete
  to service_role
  using (true);

-- battle_votes
create policy "votes_public_select"
  on public.battle_votes
  for select
  to anon, authenticated
  using (true);

create policy "votes_create_if_battle_active"
  on public.battle_votes
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.battles b
      where b.id = battle_id
        and b.is_active is true
        and (b.ends_at is null or b.ends_at > now())
    )
  );

-- updates/deletes restricted to service role
create policy "votes_no_updates"
  on public.battle_votes
  for update
  to service_role
  using (true)
  with check (true);

create policy "votes_no_deletes_public"
  on public.battle_votes
  for delete
  to service_role
  using (true);

-- battle_arguments
create policy "arguments_public_select"
  on public.battle_arguments
  for select
  to anon, authenticated
  using (true);

create policy "arguments_create_if_battle_exists"
  on public.battle_arguments
  for insert
  to anon, authenticated
  with check (exists (select 1 from public.battles b where b.id = battle_id));

create policy "arguments_like_updates_service_only"
  on public.battle_arguments
  for update
  to service_role
  using (true)
  with check (true);

create policy "arguments_delete_service_only"
  on public.battle_arguments
  for delete
  to service_role
  using (true);

-------------------------
-- 4) FUNCTION + TRIGGERS (VOTE COUNTER)
-------------------------
create or replace function public.bump_battle_vote_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.battles
       set total_votes = coalesce(total_votes, 0) + 1
     where id = new.battle_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.battles
       set total_votes = greatest(coalesce(total_votes, 0) - 1, 0)
     where id = old.battle_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_votes_inc on public.battle_votes;
create trigger trg_votes_inc
  after insert on public.battle_votes
  for each row execute function public.bump_battle_vote_count();

drop trigger if exists trg_votes_dec on public.battle_votes;
create trigger trg_votes_dec
  after delete on public.battle_votes
  for each row execute function public.bump_battle_vote_count();

-------------------------
-- 5) BACK-COMPAT VIEW (KEEP OLD ENDPOINTS WORKING)
-------------------------
-- Your frontend currently calls /rest/v1/vote_rooms?...
-- Provide a compatibility view mapping to the new `battles` table.
drop view if exists public.vote_rooms;

create view public.vote_rooms
as
select
  b.id,
  b.title,
  b.description,
  (b.battle_type || '_battle')::text as type,  -- matches old filter values like 'food_battle'
  b.is_active,
  b.created_at,
  b.ends_at as expires_at,  -- map ends_at to expires_at for compatibility
  b.total_votes,
  array[b.item_a, b.item_b] as items,  -- convert jsonb items to array format
  null::text as category,
  null::int as scale_min,
  null::int as scale_max,
  null::timestamptz as deadline,
  null::text as created_by,
  null::uuid as user_id
from public.battles b;

comment on view public.vote_rooms is
  'Back-compat view mapping old vote_rooms API to new battles schema. `type` = battle_type||_battle';

-------------------------
-- 6) OPTIONAL COMMENTS
-------------------------
comment on table public.battles is 'Universal battle container for A/B showdowns';
comment on table public.battle_votes is 'Votes tied to battles (unique by battle_id + session_id)';
comment on table public.battle_arguments is 'Short arguments (<=280 chars) linked to a battle and choice';
comment on table public.user_profiles is 'Extended profile linked to auth.users';

-- =====================================================================
-- DONE. Re-run is safe. This "overwrites" policies/triggers/view and
-- aligns existing tables without dropping your data.
-- =====================================================================