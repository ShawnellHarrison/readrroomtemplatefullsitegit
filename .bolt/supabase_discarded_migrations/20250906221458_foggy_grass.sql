-- ============================================================
-- READ THE ROOM — Minimal seed data for local development
-- Safe to run multiple times (idempotent-ish with ON CONFLICT)
-- ============================================================

-- ---------- Optional demo user profile ----------
-- If you created an auth user like demo@example.com via CLI or Studio,
-- this will create a user_profile for them. If not, it no-ops.
insert into public.user_profiles (id, username, display_name, bio)
select u.id, 'demo_user', 'Demo User', 'Just here to vote'
from auth.users u
where u.email = 'demo@example.com'
on conflict (id) do nothing;

-- ---------- User preferences for that user (optional) ----------
insert into public.user_preferences (id, user_id, theme, notifications_enabled, email_notifications, auto_share_votes, preferred_genres, privacy_level)
select gen_random_uuid(), u.id, 'dark', true, true, false, '["sci-fi","action"]'::jsonb, 'public'
from auth.users u
where u.email = 'demo@example.com'
on conflict (user_id) do nothing;

-- ============================================================
-- VOTE ROOMS (one per type) + example votes
-- ============================================================

-- YES / NO
insert into public.vote_rooms (id, title, description, category, type, items, is_active, created_by)
values (
  gen_random_uuid(),
  'Pizza Night',
  'Should we order pizza tonight?',
  'food',
  'yes-no',
  '["Yes","No"]'::jsonb,
  true,
  'seed-session'
)
on conflict do nothing;

-- MULTIPLE CHOICE
insert into public.vote_rooms (id, title, description, category, type, items, is_active, created_by)
values (
  gen_random_uuid(),
  'What should we eat?',
  'Pick your favorites (multi-select allowed)',
  'food',
  'multiple-choice',
  '["Tacos","Pizza","Sushi","Burgers"]'::jsonb,
  true,
  'seed-session'
)
on conflict do nothing;

-- SCALE (1-5)
insert into public.vote_rooms (id, title, description, category, type, items, scale_min, scale_max, is_active, created_by)
values (
  gen_random_uuid(),
  'Team Vibes Check',
  'Rate the current team vibe 1-5',
  'retrospective',
  'scale',
  '[]'::jsonb,
  1, 5,
  true,
  'seed-session'
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

-- Capture the generated ids to use below
with rooms as (
  select
    (select id from public.vote_rooms where title='Pizza Night' limit 1) as yesno_id,
    (select id from public.vote_rooms where title='What should we eat?' limit 1) as multi_id,
    (select id from public.vote_rooms where title='Team Vibes Check' limit 1) as scale_id,
    (select id from public.vote_rooms where title='Weekend Activity' limit 1) as ranked_id
)
-- Insert a few sample votes for each room type
-- YES/NO votes
insert into public.votes (room_id, value, session_id, user_id_auth)
select yesno_id, '{"choice":"Yes"}'::jsonb, 'sess-aaa', null from rooms
union all
select yesno_id, '{"choice":"No"}'::jsonb, 'sess-bbb', null from rooms
union all
select yesno_id, '{"choice":"Yes"}'::jsonb, 'sess-ccc', null from rooms
on conflict do nothing;

with rooms as (
  select (select id from public.vote_rooms where title='What should we eat?' limit 1) as multi_id
)
-- MULTIPLE-CHOICE votes
insert into public.votes (room_id, value, session_id, user_id_auth)
select multi_id, '{"choices":["Pizza","Sushi"]}'::jsonb, 'sess-111', null from rooms
union all
select multi_id, '{"choices":["Tacos"]}'::jsonb, 'sess-222', null from rooms
union all
select multi_id, '{"choices":["Pizza","Burgers"]}'::jsonb, 'sess-333', null from rooms
on conflict do nothing;

with rooms as (
  select (select id from public.vote_rooms where title='Team Vibes Check' limit 1) as scale_id
)
-- SCALE votes
insert into public.votes (room_id, value, session_id, user_id_auth)
select scale_id, '{"score":4}'::jsonb, 'sess-x1', null from rooms
union all
select scale_id, '{"score":5}'::jsonb, 'sess-x2', null from rooms
union all
select scale_id, '{"score":3}'::jsonb, 'sess-x3', null from rooms
on conflict do nothing;

with rooms as (
  select (select id from public.vote_rooms where title='Weekend Activity' limit 1) as ranked_id
)
-- RANKED-CHOICE votes (store full ranking array)
insert into public.votes (room_id, value, session_id, user_id_auth)
select ranked_id, '{"ranking":["Movie Marathon","Hiking","Trivia Night","Bowling"]}'::jsonb, 'sess-r1', null from rooms
union all
select ranked_id, '{"ranking":["Hiking","Trivia Night","Movie Marathon","Bowling"]}'::jsonb, 'sess-r2', null from rooms
union all
select ranked_id, '{"ranking":["Trivia Night","Bowling","Movie Marathon","Hiking"]}'::jsonb, 'sess-r3', null from rooms
on conflict do nothing;

-- ============================================================
-- MOVIE BATTLES + votes, arguments, likes
-- ============================================================

-- One sample battle
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

-- IDs for inserts below
with b as (
  select id as battle_id, movie_a_id, movie_b_id from public.movie_battles where title='Inception vs Interstellar' limit 1
)
-- Battle votes: ensure movie_id matches battle (trigger validates)
insert into public.battle_votes (battle_id, movie_id, session_id, user_id_auth)
select battle_id, movie_a_id, 'bv-s1', null from b
union all
select battle_id, movie_b_id, 'bv-s2', null from b
union all
select battle_id, movie_a_id, 'bv-s3', null from b
on conflict do nothing;

-- Short arguments (<= 280 chars)
with b as (
  select id as battle_id, movie_a_id, movie_b_id from public.movie_battles where title='Inception vs Interstellar' limit 1
)
insert into public.battle_arguments (battle_id, movie_id, user_id, username, content, likes, user_id_auth)
select battle_id, movie_a_id, 'sess-arg1', 'Ariadne', 'Inception bends reality with tighter pacing.', 2, null from b
union all
select battle_id, movie_b_id, 'sess-arg2', 'Cooper', 'Interstellar has the emotional core and the score is unreal.', 3, null from b
on conflict do nothing;

-- Likes on arguments
with a as (
  select id from public.battle_arguments where username in ('Ariadne','Cooper')
)
insert into public.argument_likes (argument_id, user_id, user_id_auth)
select id, 'sess-like-1', null from a
union all
select id, 'sess-like-2', null from a
on conflict do nothing;

-- ============================================================
-- Extra: another quick battle (popular vs trending placeholder)
-- ============================================================
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

-- Two votes for that second battle
with b as (
  select id as battle_id, movie_a_id, movie_b_id from public.movie_battles where title='Popular vs Trending' limit 1
)
insert into public.battle_votes (battle_id, movie_id, session_id)
select battle_id, movie_a_id, 'bv-pp-1' from b
union all
select battle_id, movie_b_id, 'bv-pp-2' from b
on conflict do nothing;

-- ============================================================
-- Quick sanity checks (optional)
-- ============================================================
-- select * from public.vote_rooms order by created_at desc;
-- select * from public.votes order by created_at desc;
-- select * from public.movie_battles order by created_at desc;
-- select * from public.battle_votes order by created_at desc;
-- select * from public.battle_arguments order by created_at desc;
-- select * from public.argument_likes order by created_at desc;