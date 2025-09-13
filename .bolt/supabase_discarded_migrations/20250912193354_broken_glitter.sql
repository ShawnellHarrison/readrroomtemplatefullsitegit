-- supabase/migrations/20250912_fix_owner_session_and_policies.sql
-- Purpose: make rooms & votes work for guests; fix missing owner_session_id; robust RLS.

-- 0) Ensure base tables/columns exist (light-touch; won't clobber data)
create table if not exists public.vote_rooms (
  id uuid primary key default gen_random_uuid(),
  title text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  ends_at timestamptz,
  updated_at timestamptz
);

-- Add the missing owner_session_id if not present
alter table public.vote_rooms
  add column if not exists owner_session_id text;

-- Helpful columns (optional)
alter table public.vote_rooms
  alter column is_active set default true;

create table if not exists public.vote_options (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.vote_rooms(id) on delete cascade,
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.vote_rooms(id) on delete cascade,
  session_id text not null,
  option_id uuid not null references public.vote_options(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- 1) Helper: get the caller's session id from header OR JWT claim (either works)
create or replace function public.current_client_session()
returns text
language plpgsql
stable
as $$
declare
  hdr text;
  jwt json;
  sid text;
begin
  -- Prefer custom header: X-Client-Session
  begin
    hdr := current_setting('request.headers.x-client-session', true);
  exception when others then
    hdr := null;
  end;

  if hdr is not null and length(hdr) > 0 then
    return hdr;
  end if;

  -- Fallback: JWT claim { "session_id": "..." }
  begin
    jwt := current_setting('request.jwt.claims', true)::json;
  exception when others then
    jwt := null;
  end;

  if jwt is not null then
    sid := jwt ->> 'session_id';
    if sid is not null and length(sid) > 0 then
      return sid;
    end if;
  end if;

  return null;
end
$$;

-- 2) Timestamps helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists trg_vote_rooms_updated_at on public.vote_rooms;
create trigger trg_vote_rooms_updated_at
before update on public.vote_rooms
for each row execute function public.set_updated_at();

drop trigger if exists trg_votes_updated_at on public.votes;
create trigger trg_votes_updated_at
before update on public.votes
for each row execute function public.set_updated_at();

-- 3) Uniqueness for UPSERT (one vote per room per session)
do $$
begin
  if not exists (
    select 1 from pg_indexes where schemaname='public' and indexname='votes_room_session_uniq'
  ) then
    create unique index votes_room_session_uniq on public.votes (room_id, session_id);
  end if;
end$$;

-- 4) RLS: (re)create policies using current_client_session()
alter table public.vote_rooms enable row level security;
alter table public.vote_options enable row level security;
alter table public.votes      enable row level security;

-- Clean old policies if they exist
drop policy if exists vr_select_active_or_owner on public.vote_rooms;
drop policy if exists vr_insert_owner_session   on public.vote_rooms;
drop policy if exists vr_update_by_owner        on public.vote_rooms;

drop policy if exists vo_select_cascade on public.vote_options;
drop policy if exists vo_insert_by_owner on public.vote_options;
drop policy if exists vo_update_by_owner on public.vote_options;

drop policy if exists v_select_cascade on public.votes;
drop policy if exists v_insert_by_session on public.votes;
drop policy if exists v_update_by_session on public.votes;

-- Rooms
create policy vr_select_active_or_owner
on public.vote_rooms for select
to anon, authenticated
using (
  is_active is true
  or owner_session_id = public.current_client_session()
);

create policy vr_insert_owner_session
on public.vote_rooms for insert
to anon, authenticated
with check (
  owner_session_id = public.current_client_session()
);

create policy vr_update_by_owner
on public.vote_rooms for update
to anon, authenticated
using (
  owner_session_id = public.current_client_session()
)
with check (
  owner_session_id = public.current_client_session()
);

-- Options (gate by readable room; write by room owner)
create policy vo_select_cascade
on public.vote_options for select
to anon, authenticated
using (
  exists (
    select 1 from public.vote_rooms r
    where r.id = vote_options.room_id
      and (r.is_active is true
           or r.owner_session_id = public.current_client_session())
  )
);

create policy vo_insert_by_owner
on public.vote_options for insert
to anon, authenticated
with check (
  exists (
    select 1 from public.vote_rooms r
    where r.id = vote_options.room_id
      and r.owner_session_id = public.current_client_session()
  )
);

create policy vo_update_by_owner
on public.vote_options for update
to anon, authenticated
using (
  exists (
    select 1 from public.vote_rooms r
    where r.id = vote_options.room_id
      and r.owner_session_id = public.current_client_session()
  )
)
with check (
  exists (
    select 1 from public.vote_rooms r
    where r.id = vote_options.room_id
      and r.owner_session_id = public.current_client_session()
  )
);

-- Votes (read if room readable; write only for caller's own session)
create policy v_select_cascade
on public.votes for select
to anon, authenticated
using (
  exists (
    select 1 from public.vote_rooms r
    where r.id = votes.room_id
      and (r.is_active is true
           or r.owner_session_id = public.current_client_session())
  )
);

create policy v_insert_by_session
on public.votes for insert
to anon, authenticated
with check (
  session_id = public.current_client_session()
);

create policy v_update_by_session
on public.votes for update
to anon, authenticated
using (
  session_id = public.current_client_session()
)
with check (
  session_id = public.current_client_session()
);

-- 5) Compat view for old /rest/v1/battles calls (optional)
drop view if exists public.battles cascade;
create view public.battles as
select id, title, is_active, created_at, ends_at from public.vote_rooms;

grant usage on schema public to anon, authenticated, service_role;
grant select on public.battles to anon, authenticated, service_role;

-- 6) Uniqueness constraint for upsert
do $$
begin
  if not exists (
    select 1 from pg_indexes where schemaname='public' and indexname='votes_room_session_uniq'
  ) then
    create unique index votes_room_session_uniq on public.votes (room_id, session_id);
  end if;
end$$;

-- 7) Optional: counter/validation helpers
create or replace function public.bump_battle_vote_count()
returns trigger language plpgsql as $$
begin
  -- Example: increment a counter if it exists
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='vote_rooms' and column_name='vote_count') then
    update public.vote_rooms
       set vote_count = coalesce(vote_count,0)+1
     where id = new.room_id;
  end if;
  return new;
end$$;

create or replace function public.validate_battle_vote_movie()
returns trigger language plpgsql as $$
begin
  -- Validate that option belongs to the room
  if not exists (
    select 1 from public.vote_options vo
    where vo.id = new.option_id and vo.room_id = new.room_id
  ) then
    raise exception 'Invalid vote: option does not belong to room';
  end if;
  return new;
end$$;

-- Wire triggers if votes table exists
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema='public' and table_name='votes') then
    drop trigger if exists trg_votes_increment on public.votes;
    create trigger trg_votes_increment
      after insert on public.votes
      for each row execute function public.bump_battle_vote_count();

    drop trigger if exists trg_votes_validate on public.votes;
    create trigger trg_votes_validate
      before insert on public.votes
      for each row execute function public.validate_battle_vote_movie();
  end if;
end$$;