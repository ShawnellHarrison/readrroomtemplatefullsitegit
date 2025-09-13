/*
  # Sample Data for READ THE ROOM
  
  This migration adds realistic sample data to demonstrate all features:
  - Vote rooms (all 4 types)
  - Movie battles with TMDB data
  - Sample votes and arguments
  - User interactions
*/

-- Sample Vote Rooms
INSERT INTO vote_rooms (id, title, description, category, type, items, scale_min, scale_max, deadline, created_by, is_active) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Pizza Night Tonight?',
  'Should we order pizza for dinner tonight?',
  'food',
  'yes-no',
  NULL,
  NULL,
  NULL,
  now() + interval '1 day',
  'demo-session-1',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'What should we eat?',
  'Choose your preferred dinner options (multiple selections allowed)',
  'food',
  'multiple-choice',
  '["Pizza", "Sushi", "Burgers", "Thai Food", "Mexican"]'::jsonb,
  NULL,
  NULL,
  now() + interval '2 days',
  'demo-session-2',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Team Vibes Check',
  'How are you feeling about our current project progress?',
  'team',
  'scale',
  '["Overall Project Progress"]'::jsonb,
  1,
  5,
  now() + interval '12 hours',
  'demo-session-3',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  'Weekend Activity Ranking',
  'Rank these weekend activities in order of preference',
  'entertainment',
  'ranked-choice',
  '["Movie Theater", "Hiking", "Beach Day", "Museum Visit", "Game Night"]'::jsonb,
  NULL,
  NULL,
  now() + interval '2 days',
  'demo-session-4',
  true
);

-- Sample Votes for Yes/No Room
INSERT INTO votes (room_id, value, session_id, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '{"choice": "Yes"}', 'voter-1', now() - interval '2 hours'),
('550e8400-e29b-41d4-a716-446655440001', '{"choice": "Yes"}', 'voter-2', now() - interval '1 hour'),
('550e8400-e29b-41d4-a716-446655440001', '{"choice": "No"}', 'voter-3', now() - interval '30 minutes');

-- Sample Votes for Multiple Choice Room
INSERT INTO votes (room_id, value, session_id, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440002', '{"choices": ["Pizza", "Sushi"]}', 'voter-4', now() - interval '3 hours'),
('550e8400-e29b-41d4-a716-446655440002', '{"choices": ["Thai Food"]}', 'voter-5', now() - interval '2 hours'),
('550e8400-e29b-41d4-a716-446655440002', '{"choices": ["Pizza", "Mexican"]}', 'voter-6', now() - interval '1 hour'),
('550e8400-e29b-41d4-a716-446655440002', '{"choices": ["Burgers"]}', 'voter-7', now() - interval '45 minutes');

-- Sample Votes for Scale Room
INSERT INTO votes (room_id, value, session_id, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440003', '{"score": 4}', 'voter-8', now() - interval '4 hours'),
('550e8400-e29b-41d4-a716-446655440003', '{"score": 3}', 'voter-9', now() - interval '3 hours'),
('550e8400-e29b-41d4-a716-446655440003', '{"score": 5}', 'voter-10', now() - interval '2 hours'),
('550e8400-e29b-41d4-a716-446655440003', '{"score": 4}', 'voter-11', now() - interval '1 hour');

-- Sample Votes for Ranked Choice Room
INSERT INTO votes (room_id, value, session_id, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440004', '{"ranking": ["Movie Theater", "Game Night", "Beach Day", "Hiking", "Museum Visit"]}', 'voter-12', now() - interval '5 hours'),
('550e8400-e29b-41d4-a716-446655440004', '{"ranking": ["Beach Day", "Hiking", "Movie Theater", "Game Night", "Museum Visit"]}', 'voter-13', now() - interval '4 hours'),
('550e8400-e29b-41d4-a716-446655440004', '{"ranking": ["Game Night", "Movie Theater", "Museum Visit", "Beach Day", "Hiking"]}', 'voter-14', now() - interval '3 hours');

-- Sample Movie Battles
INSERT INTO movie_battles (id, title, description, movie_a_id, movie_a_data, movie_b_id, movie_b_data, ends_at, created_by, is_active, total_votes) VALUES
(
  '660e8400-e29b-41d4-a716-446655440001',
  'Christopher Nolan Showdown',
  'Which Nolan masterpiece should we watch this weekend?',
  27205,
  '{"id": 27205, "title": "Inception", "poster_path": "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", "release_date": "2010-07-16", "vote_average": 8.4, "overview": "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: inception, the implantation of another person''s idea into a target''s subconscious."}'::jsonb,
  157336,
  '{"id": 157336, "title": "Interstellar", "poster_path": "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", "release_date": "2014-11-07", "vote_average": 8.4, "overview": "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage."}'::jsonb,
  now() + interval '3 days',
  'battle-creator-1',
  true,
  8
),
(
  '660e8400-e29b-41d4-a716-446655440002',
  'Action vs Animation',
  'Friday night movie battle: High-octane action or Disney magic?',
  245891,
  '{"id": 245891, "title": "John Wick", "poster_path": "/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg", "release_date": "2014-10-22", "vote_average": 7.4, "overview": "Ex-hitman John Wick comes out of retirement to track down the gangsters that took everything from him."}'::jsonb,
  447365,
  '{"id": 447365, "title": "The Little Mermaid", "poster_path": "/ym1dxyOk4jFcSl4Q2zmRrA5BEEN.jpg", "release_date": "2023-05-18", "vote_average": 6.4, "overview": "The youngest of King Triton''s daughters, and the most defiant, Ariel longs to find out more about the world beyond the sea, and while visiting the surface, falls for the dashing Prince Eric."}'::jsonb,
  now() + interval '1 day',
  'battle-creator-2',
  true,
  5
);

-- Sample Battle Votes
INSERT INTO battle_votes (battle_id, movie_id, session_id, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 27205, 'battle-voter-1', now() - interval '6 hours'),
('660e8400-e29b-41d4-a716-446655440001', 157336, 'battle-voter-2', now() - interval '5 hours'),
('660e8400-e29b-41d4-a716-446655440001', 27205, 'battle-voter-3', now() - interval '4 hours'),
('660e8400-e29b-41d4-a716-446655440001', 157336, 'battle-voter-4', now() - interval '3 hours'),
('660e8400-e29b-41d4-a716-446655440001', 27205, 'battle-voter-5', now() - interval '2 hours'),
('660e8400-e29b-41d4-a716-446655440001', 157336, 'battle-voter-6', now() - interval '1 hour'),
('660e8400-e29b-41d4-a716-446655440001', 27205, 'battle-voter-7', now() - interval '30 minutes'),
('660e8400-e29b-41d4-a716-446655440001', 27205, 'battle-voter-8', now() - interval '15 minutes'),

('660e8400-e29b-41d4-a716-446655440002', 245891, 'battle-voter-9', now() - interval '4 hours'),
('660e8400-e29b-41d4-a716-446655440002', 447365, 'battle-voter-10', now() - interval '3 hours'),
('660e8400-e29b-41d4-a716-446655440002', 245891, 'battle-voter-11', now() - interval '2 hours'),
('660e8400-e29b-41d4-a716-446655440002', 245891, 'battle-voter-12', now() - interval '1 hour'),
('660e8400-e29b-41d4-a716-446655440002', 447365, 'battle-voter-13', now() - interval '30 minutes');

-- Sample Battle Arguments
INSERT INTO battle_arguments (battle_id, movie_id, user_id, username, content, likes, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 27205, 'arg-user-1', 'MovieBuff2024', 'Inception has the most mind-bending plot ever created. The layers of dreams within dreams is pure genius!', 12, now() - interval '5 hours'),
('660e8400-e29b-41d4-a716-446655440001', 157336, 'arg-user-2', 'SpaceExplorer', 'Interstellar combines hard science with emotional storytelling. The black hole visuals alone are worth it!', 8, now() - interval '4 hours'),
('660e8400-e29b-41d4-a716-446655440001', 27205, 'arg-user-3', 'DreamWeaver', 'The practical effects in Inception are incredible. That rotating hallway fight scene is legendary.', 6, now() - interval '3 hours'),
('660e8400-e29b-41d4-a716-446655440001', 157336, 'arg-user-4', 'CosmicThinker', 'Hans Zimmer''s score in Interstellar gives me chills every time. Plus, the father-daughter story hits different.', 9, now() - interval '2 hours'),

('660e8400-e29b-41d4-a716-446655440002', 245891, 'arg-user-5', 'ActionFan', 'John Wick redefined action movies. The choreography is like a deadly ballet!', 5, now() - interval '3 hours'),
('660e8400-e29b-41d4-a716-446655440002', 447365, 'arg-user-6', 'DisneyMagic', 'The Little Mermaid has amazing songs and Halle Bailey''s voice is absolutely stunning!', 4, now() - interval '2 hours'),
('660e8400-e29b-41d4-a716-446655440002', 245891, 'arg-user-7', 'FilmCritic', 'Keanu Reeves at his finest. Simple story, perfect execution. Sometimes less is more.', 3, now() - interval '1 hour');

-- Sample Argument Likes
INSERT INTO argument_likes (argument_id, user_id, created_at) 
SELECT 
  ba.id,
  'like-user-' || generate_series(1, ba.likes),
  now() - interval '1 hour' * random()
FROM battle_arguments ba;