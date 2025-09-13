-- READ THE ROOM — initial schema, triggers, indexes, and RLS
-- Run with: supabase db reset  (or) supabase migration up

-- =========
-- Extensions
-- =========
create extension if not exists pgcrypto;        -- gen_random_uuid()
create extension if not exists "uuid-ossp";     -- uuid_generate_v4()
create extension if not exists pg_trgm;         -- trigram (optional, useful for search)
create extension if not exists btree_gin;       -- GIN on btree ops

-- =========
-- Types / Enums
-- =========
do $$
begin
  if not exists (select 1 from pg_type where typname = 'vote_room_type') then
    create type vote_room_type as enum ('yes-no', 'multiple-choice', 'scale', 'ranked-choice');
  end if;
end$$;

-- =========
-- Utility functions
-- =========
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

-- Keep movie_battles.total_votes in sync
create or replace function public.bump_battle_vote_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update public.movie_battles
      set total_votes = coalesce(total_votes,0) + 1
      where id = new.battle_id;
  elsif TG_OP = 'DELETE' then
    update public.movie_battles
      set total_votes = greatest(coalesce(total_votes,0) - 1, 0)
      where id = old.battle_id;
  end if;
  return null;
end$$;

-- Optionally bump user_profiles.total_votes when an authenticated user votes
create or replace function public.bump_user_profile_vote_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' and new.user_id_auth is not null then
    update public.user_profiles
      set total_votes = coalesce(total_votes,0) + 1
      where id = new.user_id_auth;
  elsif TG_OP = 'DELETE' and old.user_id_auth is not null then
    update public.user_profiles
      set total_votes = greatest(coalesce(total_votes,0) - 1, 0)
      where id = old.user_id_auth;
  end if;
  return null;
end$$;

-- =========
-- Tables
-- =========

-- Users (profile extends auth.users)
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  total_votes integer default 0,
  total_battles_created integer default 0,
  total_arguments integer default 0,
  reputation_score integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  is_active boolean default true
);

create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row execute procedure public.set_updated_at();

-- Anonymous/user sessions (optional helper)
create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_token text unique not null,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '30 days'),
  is_active boolean default true
);

-- User preferences
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  theme text default 'dark',
  notifications_enabled boolean default true,
  email_notifications boolean default true,
  auto_share_votes boolean default false,
  preferred_genres jsonb default '[]'::jsonb,
  privacy_level text default 'public',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

create trigger trg_user_preferences_updated_at
before update on public.user_preferences
for each row execute procedure public.set_updated_at();

-- Voting rooms/sessions
create table if not exists public.vote_rooms (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  category text,
  type vote_room_type not null,
  items jsonb,                      -- voting options
  scale_min integer,
  scale_max integer,
  deadline timestamptz,
  is_active boolean default true,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '30 days'),
  -- Ownership (either anonymous 'created_by' string or authenticated 'user_id')
  created_by text,                  -- e.g., a session token or opaque id
  user_id uuid references auth.users(id),
  check (
    (type <> 'scale') or (scale_min is not null and scale_max is not null and scale_min <= scale_max)
  )
);

-- Individual generic votes (for yes-no / multiple-choice / scale / ranked-choice)
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.vote_rooms(id) on delete cascade,
  value jsonb not null,             -- shape varies by room type
  session_id text not null,         -- anonymous session tracking (or can store user_id as string)
  created_at timestamptz default now(),
  -- Optional linkage if the voter was authenticated
  user_id_auth uuid references auth.users(id)
);

-- Movie battles
create table if not exists public.movie_battles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  movie_a_id integer not null,      -- TMDB id
  movie_a_data jsonb not null,      -- cached data
  movie_b_id integer not null,
  movie_b_data jsonb not null,
  created_at timestamptz default now(),
  ends_at timestamptz not null,
  is_active boolean default true,
  created_by text not null,         -- session or user id (string)
  total_votes integer default 0,
  user_id uuid references auth.users(id),
  check (movie_a_id <> movie_b_id)
);

-- Battle votes (one vote per session per battle)
create table if not exists public.battle_votes (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.movie_battles(id) on delete cascade,
  movie_id integer not null,        -- movie_a_id or movie_b_id
  session_id text not null,
  created_at timestamptz default now(),
  user_id_auth uuid references auth.users(id),
  unique (battle_id, session_id)
);

-- Battle arguments/comments (short)
create table if not exists public.battle_arguments (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.movie_battles(id) on delete cascade,
  movie_id integer not null,
  user_id text not null,            -- session id (string)
  username text not null,
  content text not null check (length(content) <= 280),
  likes integer default 0,
  created_at timestamptz default now(),
  user_id_auth uuid references auth.users(id)
);

-- Argument likes
create table if not exists public.argument_likes (
  id uuid primary key default gen_random_uuid(),
  argument_id uuid not null references public.battle_arguments(id) on delete cascade,
  user_id text not null,            -- session id (string)
  created_at timestamptz default now(),
  user_id_auth uuid references auth.users(id),
  unique(argument_id, user_id)
);

-- =========
-- Indexes
-- =========
create index if not exists idx_vote_rooms_active on public.vote_rooms (is_active);
create index if not exists idx_vote_rooms_category on public.vote_rooms (category);
create index if not exists idx_vote_rooms_type on public.vote_rooms (type);
create index if not exists idx_vote_rooms_expires_at on public.vote_rooms (expires_at);

create index if not exists idx_votes_room_time on public.votes (room_id, created_at desc);
create index if not exists idx_votes_room_gin on public.votes using gin (room_id);

create index if not exists idx_battles_active_end on public.movie_battles (is_active, ends_at);
create index if not exists idx_battles_created_by on public.movie_battles (created_by);
create index if not exists idx_battles_user_id on public.movie_battles (user_id);

create index if not exists idx_battle_votes_battle_time on public.battle_votes (battle_id, created_at desc);
create index if not exists idx_battle_votes_user on public.battle_votes (user_id_auth);

create index if not exists idx_battle_arguments_battle_time on public.battle_arguments (battle_id, created_at desc);
create index if not exists idx_argument_likes_argument on public.argument_likes (argument_id);

-- JSONB helper indexes
create index if not exists idx_vote_rooms_items_gin on public.vote_rooms using gin (items jsonb_path_ops);
create index if not exists idx_movie_battles_a_data_gin on public.movie_battles using gin (movie_a_data);
create index if not exists idx_movie_battles_b_data_gin on public.movie_battles using gin (movie_b_data);

-- =========
-- Triggers
-- =========
create trigger trg_battle_votes_tally
after insert or delete on public.battle_votes
for each row execute procedure public.bump_battle_vote_count();

create trigger trg_battle_votes_profile_tally
after insert or delete on public.battle_votes
for each row execute procedure public.bump_user_profile_vote_count();

-- =========
-- RLS
-- =========
alter table public.user_profiles enable row level security;
alter table public.user_sessions enable row level security;
alter table public.user_preferences enable row level security;

alter table public.vote_rooms enable row level security;
alter table public.votes enable row level security;

alter table public.movie_battles enable row level security;
alter table public.battle_votes enable row level security;
alter table public.battle_arguments enable row level security;
alter table public.argument_likes enable row level security;

-- ----------
-- user_profiles
-- ----------
create policy "profiles are viewable by owner or public"
on public.user_profiles
for select
using (
  is_active = true
  or id = auth.uid()
);

create policy "profiles are updatable by owner"
on public.user_profiles
for update
using (id = auth.uid());

create policy "profiles are insertable by owner"
on public.user_profiles
for insert
with check (id = auth.uid());

-- ----------
-- user_sessions
-- ----------
create policy "user_sessions: owners manage their sessions"
on public.user_sessions
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ----------
-- user_preferences
-- ----------
create policy "user_preferences: owners manage"
on public.user_preferences
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ----------
-- vote_rooms
-- ----------
create policy "vote_rooms: select active or mine"
on public.vote_rooms
for select
using (
  is_active = true
  or user_id = auth.uid()
);

create policy "vote_rooms: authenticated can insert"
on public.vote_rooms
for insert
to authenticated
with check (user_id = auth.uid());

create policy "vote_rooms: owner can update"
on public.vote_rooms
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ----------
-- votes (generic room votes)
-- ----------
create policy "votes: anyone can insert"
on public.votes
for insert
with check (true);

create policy "votes: selectable via active room"
on public.votes
for select
using (exists (
  select 1 from public.vote_rooms r
  where r.id = votes.room_id
    and (r.is_active = true or r.user_id = auth.uid())
));

-- ----------
-- movie_battles
-- ----------
create policy "movie_battles: select active or mine"
on public.movie_battles
for select
using (
  is_active = true
  or user_id = auth.uid()
);

create policy "movie_battles: insert by authenticated"
on public.movie_battles
for insert
to authenticated
with check (user_id = auth.uid());

create policy "movie_battles: update by owner"
on public.movie_battles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ----------
-- battle_votes
-- ----------
create policy "battle_votes: anyone can insert"
on public.battle_votes
for insert
with check (true);

create policy "battle_votes: read by active battle or owner"
on public.battle_votes
for select
using (exists (
  select 1 from public.movie_battles b
  where b.id = battle_votes.battle_id
    and (b.is_active = true or b.user_id = auth.uid())
));

-- ----------
-- battle_arguments
-- ----------
create policy "battle_arguments: anyone can insert"
on public.battle_arguments
for insert
with check (true);

create policy "battle_arguments: select by active battle or owner"
on public.battle_arguments
for select
using (exists (
  select 1 from public.movie_battles b
  where b.id = battle_arguments.battle_id
    and (b.is_active = true or b.user_id = auth.uid())
));

-- ----------
-- argument_likes
-- ----------
create policy "argument_likes: anyone can insert"
on public.argument_likes
for insert
with check (true);

create policy "argument_likes: select allowed for active battle"
on public.argument_likes
for select
using (exists (
  select 1
  from public.battle_arguments a
  join public.movie_battles b on b.id = a.battle_id
  where a.id = argument_likes.argument_id
    and (b.is_active = true or b.user_id = auth.uid())
));

-- =========
-- Helpful constraints
-- =========
-- Ensure battle_votes.movie_id references one of the two movies (runtime check)
create or replace function public.validate_battle_vote_movie()
returns trigger language plpgsql as $$
declare
  a int;
  b int;
begin
  select movie_a_id, movie_b_id into a, b from public.movie_battles where id = new.battle_id;
  if not (new.movie_id = a or new.movie_id = b) then
    raise exception 'Invalid movie_id for this battle';
  end if;
  return new;
end$$;

drop trigger if exists trg_validate_battle_vote_movie on public.battle_votes;
create trigger trg_validate_battle_vote_movie
before insert on public.battle_votes
for each row execute procedure public.validate_battle_vote_movie();