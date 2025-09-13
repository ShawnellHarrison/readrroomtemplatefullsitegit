-- ============================================================
-- READ THE ROOM — Minimal seed data for local development
-- Safe to re-run; uses ON CONFLICT to avoid duplicate issues
-- ============================================================

-- ---------- Optional demo user profile ----------
-- Create an auth user first in Supabase Studio (Auth -> Add user) with email demo@example.com
-- This block then adds the profile & preferences if that user exists.
insert into public.user_profiles (id, username, display_name, bio)
select u.id, 'demo_user', 'Demo User', 'Just here to vote'
from auth.users u
where u.email = 'demo@example.com'
on conflict (id) do nothing;

insert into public.user_preferences (id, user_id, theme, notifications_enabled, email_notifications, auto_share_votes, preferred_genres, privacy_level)
select gen_random_uuid(), u.id, 'dark', true, true, false, '["sci-fi","action"]'::jsonb, 'public'
from auth.users u
where u.email = 'demo@example.com'
on conflict (user_id) do nothing;

-- ============================================================
-- VOTE ROOMS (one per type)
-- ============================================================

-- YES/NO
insert into public.vote_rooms (id, title, description, category, type, items, is_active, created_by, deadline)
values (
  gen_random_uuid(),
  'Pizza Night',
  'Should we order pizza tonight?',
  'food',
  'yes-no',
  '["Yes","No"]'::jsonb,
  true,
  'seed-session',
  now() + interval '1 day'
)
on conflict do nothing;

-- MULTIPLE CHOICE
insert into public.vote_rooms (id, title, description, category, type, items, is_active, created_by, deadline)
values (
  gen_random_uuid(),
  'What should we eat?',
  'Pick your favorites (multi-select allowed)',
  'food',
  'multiple-choice',
  '["Tacos","Pizza","Sushi","Burgers"]'::jsonb,
  true,
  'seed-session',
  now() + interval '2 days'
)
on conflict do nothing;

-- SCALE (1-5)
insert into public.vote_rooms (id, title, description, category, type, items, scale_min, scale_max, is_active, created_by, deadline)
values (
  gen_random_uuid(),
  'Team Vibes Check',
  'Rate the current team vibe 1-5',
  'retrospective',
  'scale',
  '[]'::jsonb,
  1, 5,
  true,
  'seed-session',
  now() + interval '12 hours'
)
on conflict do nothing;

-- RANKED CHOICE
insert into public.vote_rooms (id, title, description, category, type, items, is_active, created_by, deadline)
values (
  gen_random_uuid(),
  'Weekend Activity',
  'Rank the options from most to least preferred',
  'social',
  'ranked-choice',
  '["Hiking","Bowling","Trivia Night","Movie Marathon"]'::jsonb,
  true,
  'seed-session',
  now() + interval '2 days'
)
on conflict do nothing;

-- ============================================================
-- SAMPLE VOTES for each room type
-- ============================================================

-- YES/NO votes
with r as (
  select id as room_id from public.vote_rooms where title='Pizza Night' limit 1
)
insert into public.votes (room_id, value, session_id, user_id_auth)
select room_id, '{"choice":"Yes"}'::jsonb, 'sess-aaa', null from r
union all
select room_id, '{"choice":"No"}'::jsonb,  'sess-bbb', null from r
union all
select room_id, '{"choice":"Yes"}'::jsonb, 'sess-ccc', null from r
on conflict do nothing;

-- MULTIPLE-CHOICE votes
with r as (
  select id as room_id from public.vote_rooms where title='What should we eat?' limit 1
)
insert into public.votes (room_id, value, session_id, user_id_auth)
select room_id, '{"choices":["Pizza","Sushi"]}'::jsonb, 'sess-111', null from r
union all
select room_id, '{"choices":["Tacos"]}'::jsonb,         'sess-222', null from r
union all
select room_id, '{"choices":["Pizza","Burgers"]}'::jsonb,'sess-333', null from r
on conflict do nothing;

-- SCALE votes
with r as (
  select id as room_id from public.vote_rooms where title='Team Vibes Check' limit 1
)
insert into public.votes (room_id, value, session_id, user_id_auth)
select room_id, '{"score":4}'::jsonb, 'sess-x1', null from r
union all
select room_id, '{"score":5}'::jsonb, 'sess-x2', null from r
union all
select room_id, '{"score":3}'::jsonb, 'sess-x3', null from r
on conflict do nothing;

-- RANKED-CHOICE votes (store full ranking)
with r as (
  select id as room_id from public.vote_rooms where title='Weekend Activity' limit 1
)
insert into public.votes (room_id, value, session_id, user_id_auth)
select room_id, '{"ranking":["Movie Marathon","Hiking","Trivia Night","Bowling"]}'::jsonb, 'sess-r1', null from r
union all
select room_id, '{"ranking":["Hiking","Trivia Night","Movie Marathon","Bowling"]}'::jsonb,  'sess-r2', null from r
union all
select room_id, '{"ranking":["Trivia Night","Bowling","Movie Marathon","Hiking"]}'::jsonb,  'sess-r3', null from r
on conflict do nothing;

-- ============================================================
-- MOVIE BATTLES + votes, arguments, likes
-- ============================================================

-- Sample battle #1
insert into public.movie_battles
  (id, title, description, movie_a_id, movie_a_data, movie_b_id, movie_b_data, ends_at, is_active, created_by, total_votes)
values
  (
    gen_random_uuid(),
    'Inception vs Interstellar',
    'Nolan showdown!',
    27205,  '{"id":27205,"title":"Inception"}',
    157336, '{"id":157336,"title":"Interstellar"}',
    now() + interval '3 days',
    true,
    'seed-session',
    0
  )
on conflict do nothing;

-- Votes for battle #1 (trigger will tally movie_battles.total_votes)
with b as (
  select id as battle_id, movie_a_id, movie_b_id
  from public.movie_battles
  where title='Inception vs Interstellar'
  limit 1
)
insert into public.battle_votes (battle_id, movie_id, session_id, user_id_auth)
select battle_id, movie_a_id, 'bv-s1', null from b
union all
select battle_id, movie_b_id, 'bv-s2', null from b
union all
select battle_id, movie_a_id, 'bv-s3', null from b
on conflict do nothing;

-- Arguments for battle #1
with b as (
  select id as battle_id, movie_a_id, movie_b_id
  from public.movie_battles
  where title='Inception vs Interstellar'
  limit 1
)
insert into public.battle_arguments (battle_id, movie_id, user_id, username, content, likes, user_id_auth)
select battle_id, movie_a_id, 'sess-arg1', 'Ariadne', 'Inception bends reality with tighter pacing.', 2, null from b
union all
select battle_id, movie_b_id, 'sess-arg2', 'Cooper',  'Interstellar has the emotional core and an unreal score.', 3, null from b
on conflict do nothing;

-- Likes on arguments (2 likes each)
with a as (
  select id from public.battle_arguments where username in ('Ariadne','Cooper')
)
insert into public.argument_likes (argument_id, user_id, user_id_auth)
select id, 'sess-like-1', null from a
union all
select id, 'sess-like-2', null from a
on conflict do nothing;

-- Sample battle #2
insert into public.movie_battles
  (id, title, description, movie_a_id, movie_a_data, movie_b_id, movie_b_data, ends_at, is_active, created_by, total_votes)
values
  (
    gen_random_uuid(),
    'Popular vs Trending',
    'Which feed wins?',
    603692, '{"id":603692,"title":"John Wick: Chapter 4"}',
    447277, '{"id":447277,"title":"The Little Mermaid (2023)"}',
    now() + interval '1 day',
    true,
    'seed-session',
    0
  )
on conflict do nothing;

-- Votes for battle #2
with b as (
  select id as battle_id, movie_a_id, movie_b_id
  from public.movie_battles
  where title='Popular vs Trending'
  limit 1
)
insert into public.battle_votes (battle_id, movie_id, session_id)
select battle_id, movie_a_id, 'bv-pp-1' from b
union all
select battle_id, movie_b_id, 'bv-pp-2' from b
on conflict do nothing;