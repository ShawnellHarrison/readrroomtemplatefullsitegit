-- Minimal seed data for local dev

insert into public.user_profiles (id, username, display_name, bio)
values
  (gen_random_uuid(), 'demo_user', 'Demo User', 'Just here to vote')
on conflict do nothing;

-- A sample yes/no room
insert into public.vote_rooms (title, description, category, type, items, is_active)
values (
  'Pizza Night',
  'Should we order pizza tonight?',
  'food',
  'yes-no',
  '["Yes","No"]'::jsonb,
  true
);

-- A sample movie battle
insert into public.movie_battles (title, description, movie_a_id, movie_a_data, movie_b_id, movie_b_data, ends_at, is_active, created_by)
values (
  'Inception vs Interstellar',
  'Nolan showdown!',
  27205, '{"title":"Inception"}',
  157336, '{"title":"Interstellar"}',
  (now() + interval '3 days'),
  true,
  'seed-session'
);