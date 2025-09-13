-- supabase/migrations/20250912_fix_battles_view.sql
-- PURPOSE: Make legacy /rest/v1/battles calls work by mapping to vote_rooms.
-- Also provide safe stubs for missing trigger functions and basic RLS.

-- === 0) Safety / prerequisites ============================================
create schema if not exists public;

-- === 1) Core view to back-compat "battles" ================================
drop view if exists public.battles cascade;

-- Adjust the selected/aliased columns to match your real vote_rooms schema.
create view public.battles as
select
  vr.id,
  vr.title,
  vr.is_active,
  vr.created_at,
  vr.expires_at as ends_at        -- rename/alias if your column name differs
from public.vote_rooms vr;

-- Make sure the API roles can read the view
grant usage on schema public to anon, authenticated, service_role;
grant select on public.battles to anon, authenticated, service_role;

-- === 2) RLS on base table (views inherit base-table RLS) ==================
-- Enable RLS if not already
alter table if exists public.vote_rooms enable row level security;

-- Create a permissive read policy for active rooms (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'vote_rooms'
      and policyname = 'read_active_rooms'
  ) then
    create policy "read_active_rooms"
      on public.vote_rooms
      for select
      to anon, authenticated
      using (is_active is true);
  end if;
end$$;

-- === 3) Timestamp trigger helper (optional but handy) =====================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end$$;

-- Attach if the column exists
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='vote_rooms' and column_name='updated_at'
  ) then
    drop trigger if exists trg_vote_rooms_updated_at on public.vote_rooms;
    create trigger trg_vote_rooms_updated_at
      before update on public.vote_rooms
      for each row execute function public.set_updated_at();
  end if;
end$$;

-- === 4) Counter/validation stubs for your earlier missing functions =======
-- Adjust foreign keys/column names if your schema differs.

create or replace function public.bump_battle_vote_count()
returns trigger
language plpgsql
as $$
begin
  -- Example: increment a counter on vote_rooms when a vote is inserted
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='vote_rooms' and column_name='vote_count'
  ) then
    update public.vote_rooms
       set vote_count = coalesce(vote_count, 0) + 1
     where id = new.room_id; -- assumes new.room_id references vote_rooms.id
  end if;
  return new;
end$$;

create or replace function public.bump_user_profile_vote_count()
returns trigger
language plpgsql
as $$
begin
  -- Example: increment user vote count when authenticated user votes
  if new.user_id_auth is not null then
    update public.user_profiles
       set total_votes = coalesce(total_votes, 0) + 1
     where id = new.user_id_auth;
  end if;
  return new;
end$$;

create or replace function public.validate_battle_vote_movie()
returns trigger
language plpgsql
as $$
begin
  -- Validate that the movie_id belongs to the battle
  if not exists (
    select 1 from public.movie_battles mb
    where mb.id = new.battle_id
      and (mb.movie_a_id = new.movie_id or mb.movie_b_id = new.movie_id)
  ) then
    raise exception 'Invalid vote: movie % does not belong to battle %', new.movie_id, new.battle_id;
  end if;
  return new;
end$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
as $$
begin
  -- Create user profile when new user signs up
  insert into public.user_profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end$$;

-- Wire up the auth trigger if users table exists
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema='auth' and table_name='users') then
    drop trigger if exists on_auth_user_created on auth.users;
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end$$;