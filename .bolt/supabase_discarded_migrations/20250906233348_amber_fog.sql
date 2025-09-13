-- Seed data for Read the Room / Movie Battle Arena

-- Sample Cards
INSERT INTO public.cards (name, description, type, image_url) VALUES
('Popcorn Power', 'Doubles your vote weight for this battle', 'power', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200'),
('Director''s Cut', 'Reveals behind-the-scenes info about movies', 'info', 'https://images.unsplash.com/photo-1489599735734-79b4169c2a78?w=200'),
('Critic''s Choice', 'Shows professional ratings and reviews', 'info', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=200'),
('Audience Favorite', 'Shows audience scores and reactions', 'info', 'https://images.unsplash.com/photo-1489599735734-79b4169c2a78?w=200'),
('Wild Card', 'Adds a random third option to the battle', 'chaos', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=200');

-- Note: Sample battles and votes will be created through the app interface
-- This ensures proper user authentication and relationships