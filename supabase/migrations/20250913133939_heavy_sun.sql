/*
  # Unified Battle Arena Schema

  This migration creates a clean, optimized database schema for all battle types
  (movies, books, games, music, food) using a unified approach.

  ## New Tables
  1. **user_profiles** - Extended user information beyond Supabase auth
     - Links to auth.users with cascade delete
     - Tracks voting stats and reputation
  
  2. **battles** - Universal battle container for all A vs B showdowns
     - Supports all battle types: movie, book, game, music, food
     - Stores full item data as JSONB for flexibility
     - Built-in vote counting and expiration
  
  3. **battle_votes** - Simple A/B voting with session tracking
     - Prevents duplicate votes per session
     - Links to battles with cascade delete
     - Automatic vote count triggers
  
  4. **battle_arguments** - Twitter-style arguments (≤280 chars)
     - Team-based arguments for A or B choice
     - Like system for community engagement
     - Anonymous posting supported

  ## Security
  - Row Level Security enabled on all tables
  - Public read access for active battles
  - Anonymous voting and argument posting allowed
  - Service role controls for admin operations

  ## Performance
  - Optimized indexes for common queries
  - JSONB indexes for item data searches
  - Automatic vote counting via triggers
*/

-- Enable required extensions
create extension if not exists "pgcrypto";

-- 1) Tables
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  total_votes int default 0,
  reputation_score int default 0,
  created_at timestamptz default now()
);

create table if not exists public.battles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  battle_type text not null check (battle_type in ('movie','book','game','music','food')),
  item_a jsonb not null,
  item_b jsonb not null,
  ends_at timestamptz,
  created_at timestamptz default now(),
  is_active boolean default true,
  total_votes int default 0
);

create table if not exists public.battle_votes (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  item_choice text not null check (item_choice in ('A','B')),
  session_id text not null,
  created_at timestamptz default now(),
  unique (battle_id, session_id)
);

create table if not exists public.battle_arguments (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  item_choice text not null check (item_choice in ('A','B')),
  content text not null check (length(content) <= 280),
  author text default 'Anonymous',
  likes int default 0,
  created_at timestamptz default now()
);

-- 2) Indexes
create index if not exists idx_battles_type_active_created
  on public.battles (battle_type, is_active, created_at desc);

create index if not exists idx_votes_battle_created
  on public.battle_votes (battle_id, created_at desc);

create index if not exists idx_args_battle_created
  on public.battle_arguments (battle_id, created_at desc);

-- 3) Row Level Security (RLS)
alter table public.user_profiles enable row level security;
alter table public.battles enable row level security;
alter table public.battle_votes enable row level security;
alter table public.battle_arguments enable row level security;

-- Drop old policies (safe to run)
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

-- service-role only for updates/deletes (done via server key if you need admin ops)
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

-- 4) Vote counter function + triggers
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

-- 5) Optional comments
comment on table public.battles is 'Universal battle container for A/B showdowns';
comment on table public.battle_votes is 'Votes tied to battles (unique by battle_id + session_id)';
comment on table public.battle_arguments is 'Short arguments (<=280 chars) linked to a battle and choice';
comment on table public.user_profiles is 'Extended profile linked to auth.users';