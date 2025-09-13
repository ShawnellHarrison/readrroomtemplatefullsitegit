/*
  # Core Schema for Read the Room / Movie Battle Arena

  1. New Tables
    - `user_profiles` - Extended user profiles beyond Supabase auth
    - `battles` - Main battle/voting sessions
    - `battle_options` - Options/choices for each battle
    - `votes` - Individual votes cast by users
    - `cards` - Game cards/items that can be used
    - `player_cards` - Cards assigned to players in battles
    - `arguments` - User arguments/comments for battles

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Proper foreign key relationships

  3. Features
    - UUID primary keys with auto-generation
    - Proper timestamping
    - Cascade deletes for related data
    - Unique constraints to prevent duplicate votes
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Battles Table
CREATE TABLE IF NOT EXISTS public.battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES public.user_profiles(id),
  title text NOT NULL,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;

-- Battle Options Table
CREATE TABLE IF NOT EXISTS public.battle_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid REFERENCES public.battles(id) ON DELETE CASCADE,
  label text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.battle_options ENABLE ROW LEVEL SECURITY;

-- Votes Table
CREATE TABLE IF NOT EXISTS public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid REFERENCES public.battles(id) ON DELETE CASCADE,
  option_id uuid REFERENCES public.battle_options(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.user_profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(battle_id, user_id)
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Cards Table
CREATE TABLE IF NOT EXISTS public.cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text,
  image_url text
);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Player Cards Table
CREATE TABLE IF NOT EXISTS public.player_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid REFERENCES public.battles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.user_profiles(id),
  card_id uuid REFERENCES public.cards(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.player_cards ENABLE ROW LEVEL SECURITY;

-- Arguments Table
CREATE TABLE IF NOT EXISTS public.arguments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid REFERENCES public.battles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.user_profiles(id),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.arguments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User Profiles Policies
CREATE POLICY "Users can view all profiles" ON public.user_profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Battles Policies
CREATE POLICY "Anyone can view active battles" ON public.battles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create battles" ON public.battles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Battle creators can update their battles" ON public.battles
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- Battle Options Policies
CREATE POLICY "Anyone can view battle options" ON public.battle_options
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Battle creators can manage options" ON public.battle_options
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.battles 
      WHERE battles.id = battle_options.battle_id 
      AND battles.created_by = auth.uid()
    )
  );

-- Votes Policies
CREATE POLICY "Users can view votes for battles they can see" ON public.votes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can vote" ON public.votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON public.votes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Cards Policies
CREATE POLICY "Anyone can view cards" ON public.cards
  FOR SELECT TO authenticated USING (true);

-- Player Cards Policies
CREATE POLICY "Users can view player cards" ON public.player_cards
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their own cards" ON public.player_cards
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Arguments Policies
CREATE POLICY "Anyone can view arguments" ON public.arguments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create arguments" ON public.arguments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own arguments" ON public.arguments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_battles_created_by ON public.battles(created_by);
CREATE INDEX IF NOT EXISTS idx_battles_ends_at ON public.battles(ends_at);
CREATE INDEX IF NOT EXISTS idx_battle_options_battle_id ON public.battle_options(battle_id);
CREATE INDEX IF NOT EXISTS idx_votes_battle_id ON public.votes(battle_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_player_cards_battle_id ON public.player_cards(battle_id);
CREATE INDEX IF NOT EXISTS idx_player_cards_user_id ON public.player_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_arguments_battle_id ON public.arguments(battle_id);
CREATE INDEX IF NOT EXISTS idx_arguments_user_id ON public.arguments(user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();