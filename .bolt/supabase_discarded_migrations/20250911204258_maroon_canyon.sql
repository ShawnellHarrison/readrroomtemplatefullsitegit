/*
  # Create votes table for battle voting

  1. New Tables
    - `votes`
      - `id` (uuid, primary key)
      - `battle_id` (uuid, references battles)
      - `choice` (text, the selected option)
      - `voter_id` (uuid, references auth.users, nullable for anonymous)
      - `voter_token` (text, for anonymous voting sessions)
      - `created_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `votes` table
    - Public read access for vote tallies
    - Authenticated users can insert votes with their ID
    - Anonymous users can insert votes with session tokens

  3. Constraints
    - One vote per authenticated user per battle
    - One vote per anonymous token per battle
*/

CREATE TABLE IF NOT EXISTS public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  choice text NOT NULL,            -- for multiple-choice
  voter_id uuid,                   -- null if anonymous
  voter_token text,                -- nullable; for anon one-time tokens
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (battle_id, voter_id),    -- one vote per signed-in user per battle
  UNIQUE (battle_id, voter_token)  -- one vote per anon token per battle
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Read: everyone can read tallies
DROP POLICY IF EXISTS "Public can read votes" ON public.votes;
CREATE POLICY "Public can read votes"
ON public.votes FOR SELECT
TO anon, authenticated
USING (true);

-- Insert (signed-in): one vote per user, enforced by unique constraint
DROP POLICY IF EXISTS "Signed-in can insert their vote" ON public.votes;
CREATE POLICY "Signed-in can insert their vote"
ON public.votes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = voter_id);

-- Insert (anonymous): allow anonymous voting with tokens
DROP POLICY IF EXISTS "Anonymous can insert with token" ON public.votes;
CREATE POLICY "Anonymous can insert with token"
ON public.votes FOR INSERT
TO anon
WITH CHECK (voter_token IS NOT NULL AND voter_id IS NULL);

-- Update: users can update their own votes
DROP POLICY IF EXISTS "Users can update their votes" ON public.votes;
CREATE POLICY "Users can update their votes"
ON public.votes FOR UPDATE
TO authenticated
USING (auth.uid() = voter_id)
WITH CHECK (auth.uid() = voter_id);

-- Update: anonymous can update their token votes
DROP POLICY IF EXISTS "Anonymous can update token votes" ON public.votes;
CREATE POLICY "Anonymous can update token votes"
ON public.votes FOR UPDATE
TO anon
USING (voter_token IS NOT NULL AND voter_id IS NULL)
WITH CHECK (voter_token IS NOT NULL AND voter_id IS NULL);