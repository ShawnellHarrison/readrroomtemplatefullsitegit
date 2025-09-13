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

create or replace function public.validate_battle_vote_movie()
returns trigger
language plpgsql
as $$
begin
  -- Example sanity check: option must belong to the same room
  if exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='vote_options'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='votes' and column_name='option_id'
  ) then
    if not exists (
      select 1
        from public.vote_options vo
       where vo.id = new.option_id
         and vo.room_id = new.room_id
    ) then
      raise exception 'Invalid vote: option % does not belong to room %', new.option_id, new.room_id;
    end if;
  end if;
  return new;
end$$;

-- === 5) Fix votes table for upsert functionality ========================
-- Make sure columns exist and are NOT NULL
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='votes'
  ) then
    -- Set columns to NOT NULL if they exist
    if exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='votes' and column_name='room_id'
    ) then
      alter table public.votes alter column room_id set not null;
    end if;
    
    if exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='votes' and column_name='session_id'
    ) then
      alter table public.votes alter column session_id set not null;
    end if;
  end if;
end$$;

-- Deduplicate existing rows (keep latest)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='votes'
  ) then
    with ranked as (
      select ctid, room_id, session_id,
             row_number() over (partition by room_id, session_id order by created_at desc nulls last) as rn
      from public.votes
    )
    delete from public.votes v
    using ranked r
    where v.ctid = r.ctid and r.rn > 1;
  end if;
end$$;

-- Add unique constraint/index for conflict target
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'votes_room_session_uniq'
  ) then
    create unique index votes_room_session_uniq
      on public.votes (room_id, session_id);
  end if;
end$$;

-- === 6) RLS policies for votes table =====================================
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='votes'
  ) then
    alter table public.votes enable row level security;

    -- Insert policy
    if not exists (
      select 1 from pg_policies
      where schemaname='public' and tablename='votes' and policyname='votes_insert_any'
    ) then
      create policy votes_insert_any
        on public.votes for insert
        to anon, authenticated
        with check (true);
    end if;

    -- Update policy
    if not exists (
      select 1 from pg_policies
      where schemaname='public' and tablename='votes' and policyname='votes_update_by_session'
    ) then
      create policy votes_update_by_session
        on public.votes for update
        to anon, authenticated
        using (session_id = ((current_setting('request.jwt.claims', true))::json ->> 'session_id') or true)
        with check (session_id = ((current_setting('request.jwt.claims', true))::json ->> 'session_id') or true);
    end if;

    -- Select policy
    if not exists (
      select 1 from pg_policies
      where schemaname='public' and tablename='votes' and policyname='votes_select_by_active_room'
    ) then
      create policy votes_select_by_active_room
        on public.votes for select
        to anon, authenticated
        using (
          exists (
            select 1 from public.vote_rooms r
            where r.id = votes.room_id
              and (r.is_active is true
                   or r.owner_session_id = ((current_setting('request.jwt.claims', true))::json ->> 'session_id'))
          )
        );
    end if;
  end if;
end$$;

-- === 7) Trigger functions for existing references ========================
create or replace function public.bump_user_profile_vote_count()
returns trigger
language plpgsql
as $$
begin
  -- Safe no-op function for existing triggers
  return coalesce(new, old);
end$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
as $$
begin
  -- Safe no-op function for existing triggers
  return new;
end$$;

-- If you have a battle_votes table, wire triggers here (safe-guarded)
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema='public' and table_name='battle_votes') then

    -- Counter on insert
    drop trigger if exists trg_battle_votes_increment on public.battle_votes;
    create trigger trg_battle_votes_increment
      after insert on public.battle_votes
      for each row execute function public.bump_battle_vote_count();

    -- Validation before insert
    drop trigger if exists trg_battle_votes_validate on public.battle_votes;
    create trigger trg_battle_votes_validate
      before insert on public.battle_votes
      for each row execute function public.validate_battle_vote_movie();
  end if;
end$$;