/*
  # Add battles and votes tables for voting system

  1. New Tables
    - `battles`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, optional)
      - `type` (text, voting type)
      - `options` (jsonb, voting options)
      - `created_by` (uuid, creator)
      - `ends_at` (timestamptz, deadline)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now())
    
    - `votes`
      - `id` (uuid, primary key)
      - `battle_id` (uuid, references battles)
      - `choice` (text, vote choice)
      - `voter_id` (uuid, nullable for anonymous)
      - `voter_token` (text, nullable for anonymous)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on both tables
    - Public can read votes for tallies
    - Authenticated users can insert their own votes
    - Anonymous users can vote with tokens

  3. Constraints
    - One vote per signed-in user per battle
    - One vote per anonymous token per battle
*/

-- Create battles table
CREATE TABLE IF NOT EXISTS public.battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'multiple-choice',
  options jsonb,
  created_by uuid REFERENCES auth.users(id),
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  choice text NOT NULL,
  voter_id uuid REFERENCES auth.users(id),
  voter_token text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (battle_id, voter_id),
  UNIQUE (battle_id, voter_token)
);

-- Enable RLS
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Battles policies
CREATE POLICY "Public can read active battles"
  ON public.battles
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated can create battles"
  ON public.battles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their battles"
  ON public.battles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Votes policies
CREATE POLICY "Public can read votes"
  ON public.votes
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Signed-in can insert their vote"
  ON public.votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Anonymous can insert with token"
  ON public.votes
  FOR INSERT
  TO anon
  WITH CHECK (voter_token IS NOT NULL AND voter_id IS NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_battles_active ON public.battles(is_active);
CREATE INDEX IF NOT EXISTS idx_battles_created_by ON public.battles(created_by);
CREATE INDEX IF NOT EXISTS idx_battles_ends_at ON public.battles(ends_at);
CREATE INDEX IF NOT EXISTS idx_votes_battle_id ON public.votes(battle_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON public.votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_token ON public.votes(voter_token);

-- Create view for vote tallies
CREATE OR REPLACE VIEW public.v_vote_tallies AS
SELECT 
  b.id as battle_id,
  b.title,
  b.type,
  v.choice,
  COUNT(*) as vote_count,
  ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY b.id)), 2) as percentage
FROM public.battles b
LEFT JOIN public.votes v ON v.battle_id = b.id
WHERE b.is_active = true
GROUP BY b.id, b.title, b.type, v.choice
ORDER BY b.created_at DESC, vote_count DESC;