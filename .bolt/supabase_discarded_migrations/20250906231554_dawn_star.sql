/*
  # Complete READ THE ROOM Database Schema
  
  1. New Tables
    - `user_profiles` - Extended user info beyond Supabase auth
    - `user_sessions` - Anonymous session tracking
    - `user_preferences` - User settings and preferences
    - `vote_rooms` - Generic voting sessions (yes/no, multiple-choice, scale, ranked-choice)
    - `votes` - Individual votes with JSONB flexibility
    - `movie_battles` - Movie showdown battles with TMDB integration
    - `battle_votes` - Movie battle voting
    - `battle_arguments` - Arguments supporting movies (≤280 chars)
    - `argument_likes` - Like system for arguments

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and anonymous voting
    - Secure user data access

  3. Features
    - Real-time subscriptions
    - Automatic vote counting
    - User statistics tracking
    - Content moderation
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE vote_room_type AS ENUM ('yes-no', 'multiple-choice', 'scale', 'ranked-choice');

-- Helper function for updating timestamps
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  avatar_url text,
  bio text,
  total_votes integer DEFAULT 0,
  total_battles_created integer DEFAULT 0,
  total_arguments integer DEFAULT 0,
  reputation_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles are viewable by owner or public"
  ON user_profiles
  FOR SELECT
  TO public
  USING (is_active = true OR id = auth.uid());

CREATE POLICY "profiles are insertable by owner"
  ON user_profiles
  FOR INSERT
  TO public
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles are updatable by owner"
  ON user_profiles
  FOR UPDATE
  TO public
  USING (id = auth.uid());

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  is_active boolean DEFAULT true
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_sessions: owners manage their sessions"
  ON user_sessions
  FOR ALL
  TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text DEFAULT 'dark',
  notifications_enabled boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  auto_share_votes boolean DEFAULT false,
  preferred_genres jsonb DEFAULT '[]'::jsonb,
  privacy_level text DEFAULT 'public',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_preferences: owners manage"
  ON user_preferences
  FOR ALL
  TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Vote Rooms Table
CREATE TABLE IF NOT EXISTS vote_rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  category text,
  type vote_room_type NOT NULL,
  items jsonb,
  scale_min integer,
  scale_max integer,
  deadline timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  created_by text,
  user_id uuid REFERENCES auth.users(id),
  CONSTRAINT vote_rooms_check CHECK (
    (type != 'scale') OR 
    (scale_min IS NOT NULL AND scale_max IS NOT NULL AND scale_min <= scale_max)
  )
);

ALTER TABLE vote_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vote_rooms: select active or mine"
  ON vote_rooms
  FOR SELECT
  TO public
  USING (is_active = true OR user_id = auth.uid());

CREATE POLICY "vote_rooms: authenticated can insert"
  ON vote_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "vote_rooms: owner can update"
  ON vote_rooms
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Votes Table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES vote_rooms(id) ON DELETE CASCADE,
  value jsonb NOT NULL,
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id_auth uuid REFERENCES auth.users(id)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "votes: anyone can insert"
  ON votes
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "votes: selectable via active room"
  ON votes
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM vote_rooms r 
      WHERE r.id = votes.room_id 
      AND (r.is_active = true OR r.user_id = auth.uid())
    )
  );

-- Movie Battles Table
CREATE TABLE IF NOT EXISTS movie_battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  movie_a_id integer NOT NULL,
  movie_a_data jsonb NOT NULL,
  movie_b_id integer NOT NULL,
  movie_b_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  ends_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_by text NOT NULL,
  total_votes integer DEFAULT 0,
  user_id uuid REFERENCES auth.users(id),
  CONSTRAINT movie_battles_check CHECK (movie_a_id != movie_b_id)
);

ALTER TABLE movie_battles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "movie_battles: select active or mine"
  ON movie_battles
  FOR SELECT
  TO public
  USING (is_active = true OR user_id = auth.uid());

CREATE POLICY "movie_battles: insert by authenticated"
  ON movie_battles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "movie_battles: update by owner"
  ON movie_battles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Battle Votes Table
CREATE TABLE IF NOT EXISTS battle_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES movie_battles(id) ON DELETE CASCADE,
  movie_id integer NOT NULL,
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id_auth uuid REFERENCES auth.users(id),
  UNIQUE(battle_id, session_id)
);

ALTER TABLE battle_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "battle_votes: anyone can insert"
  ON battle_votes
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "battle_votes: read by active battle or owner"
  ON battle_votes
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM movie_battles b 
      WHERE b.id = battle_votes.battle_id 
      AND (b.is_active = true OR b.user_id = auth.uid())
    )
  );

-- Battle Arguments Table
CREATE TABLE IF NOT EXISTS battle_arguments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES movie_battles(id) ON DELETE CASCADE,
  movie_id integer NOT NULL,
  user_id text NOT NULL,
  username text NOT NULL,
  content text NOT NULL CHECK (length(content) <= 280),
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  user_id_auth uuid REFERENCES auth.users(id)
);

ALTER TABLE battle_arguments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "battle_arguments: anyone can insert"
  ON battle_arguments
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "battle_arguments: select by active battle or owner"
  ON battle_arguments
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM movie_battles b 
      WHERE b.id = battle_arguments.battle_id 
      AND (b.is_active = true OR b.user_id = auth.uid())
    )
  );

-- Argument Likes Table
CREATE TABLE IF NOT EXISTS argument_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  argument_id uuid NOT NULL REFERENCES battle_arguments(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id_auth uuid REFERENCES auth.users(id),
  UNIQUE(argument_id, user_id)
);

ALTER TABLE argument_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "argument_likes: anyone can insert"
  ON argument_likes
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "argument_likes: select allowed for active battle"
  ON argument_likes
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM battle_arguments a
      JOIN movie_battles b ON b.id = a.battle_id
      WHERE a.id = argument_likes.argument_id 
      AND (b.is_active = true OR b.user_id = auth.uid())
    )
  );

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_vote_rooms_active ON vote_rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_vote_rooms_category ON vote_rooms(category);
CREATE INDEX IF NOT EXISTS idx_vote_rooms_type ON vote_rooms(type);
CREATE INDEX IF NOT EXISTS idx_vote_rooms_expires_at ON vote_rooms(expires_at);
CREATE INDEX IF NOT EXISTS idx_vote_rooms_items_gin ON vote_rooms USING gin(items jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_votes_room_gin ON votes USING gin(room_id);
CREATE INDEX IF NOT EXISTS idx_votes_room_time ON votes(room_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_battles_active_end ON movie_battles(is_active, ends_at);
CREATE INDEX IF NOT EXISTS idx_battles_created_by ON movie_battles(created_by);
CREATE INDEX IF NOT EXISTS idx_battles_user_id ON movie_battles(user_id);
CREATE INDEX IF NOT EXISTS idx_movie_battles_a_data_gin ON movie_battles USING gin(movie_a_data);
CREATE INDEX IF NOT EXISTS idx_movie_battles_b_data_gin ON movie_battles USING gin(movie_b_data);

CREATE INDEX IF NOT EXISTS idx_battle_votes_battle_time ON battle_votes(battle_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_battle_votes_user ON battle_votes(user_id_auth);

CREATE INDEX IF NOT EXISTS idx_battle_arguments_battle_time ON battle_arguments(battle_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_argument_likes_argument ON argument_likes(argument_id);

-- Create Triggers
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Function to validate battle vote movie
CREATE OR REPLACE FUNCTION validate_battle_vote_movie()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM movie_battles 
    WHERE id = NEW.battle_id 
    AND (movie_a_id = NEW.movie_id OR movie_b_id = NEW.movie_id)
  ) THEN
    RAISE EXCEPTION 'Invalid movie_id for this battle';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_battle_vote_movie
  BEFORE INSERT ON battle_votes
  FOR EACH ROW
  EXECUTE FUNCTION validate_battle_vote_movie();

-- Function to update battle vote count
CREATE OR REPLACE FUNCTION bump_battle_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE movie_battles 
    SET total_votes = total_votes + 1 
    WHERE id = NEW.battle_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE movie_battles 
    SET total_votes = GREATEST(0, total_votes - 1) 
    WHERE id = OLD.battle_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_battle_votes_tally
  AFTER INSERT OR DELETE ON battle_votes
  FOR EACH ROW
  EXECUTE FUNCTION bump_battle_vote_count();

-- Function to update user profile vote count
CREATE OR REPLACE FUNCTION bump_user_profile_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.user_id_auth IS NOT NULL THEN
    UPDATE user_profiles 
    SET total_votes = total_votes + 1 
    WHERE id = NEW.user_id_auth;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.user_id_auth IS NOT NULL THEN
    UPDATE user_profiles 
    SET total_votes = GREATEST(0, total_votes - 1) 
    WHERE id = OLD.user_id_auth;
    RETURN OLD;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_battle_votes_profile_tally
  AFTER INSERT OR DELETE ON battle_votes
  FOR EACH ROW
  EXECUTE FUNCTION bump_user_profile_vote_count();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create Views for Analytics
CREATE OR REPLACE VIEW v_room_vote_counts AS
SELECT 
  r.id as room_id,
  r.title,
  COUNT(v.id) as votes_count
FROM vote_rooms r
LEFT JOIN votes v ON v.room_id = r.id
GROUP BY r.id, r.title;

CREATE OR REPLACE VIEW v_battle_vote_breakdown AS
SELECT 
  b.id as battle_id,
  b.title,
  b.movie_a_id,
  b.movie_b_id,
  SUM(CASE WHEN v.movie_id = b.movie_a_id THEN 1 ELSE 0 END) as votes_a,
  SUM(CASE WHEN v.movie_id = b.movie_b_id THEN 1 ELSE 0 END) as votes_b,
  COUNT(*) as total_votes
FROM movie_battles b
LEFT JOIN battle_votes v ON v.battle_id = b.id
GROUP BY b.id, b.title, b.movie_a_id, b.movie_b_id;