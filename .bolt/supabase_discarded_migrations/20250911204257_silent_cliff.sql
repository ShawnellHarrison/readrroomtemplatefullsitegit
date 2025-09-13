/*
  # Create battles table for voting system

  1. New Tables
    - `battles`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `options` (text array, minimum 2 options)
      - `ends_at` (timestamptz, optional deadline)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now)
      - `created_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on `battles` table
    - Public read access for all battles
    - Authenticated users can insert their own battles
    - Creators can update/delete their battles

  3. Indexes
    - Index on `is_active` for filtering active battles
    - Index on `created_at` for chronological ordering
*/

-- Create table if missing
CREATE TABLE IF NOT EXISTS public.battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  options text[] NOT NULL CHECK (cardinality(options) >= 2),
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS battles_is_active_idx ON public.battles (is_active);
CREATE INDEX IF NOT EXISTS battles_created_at_idx ON public.battles (created_at DESC);

-- RLS + public read so your client can select
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read battles" ON public.battles;
CREATE POLICY "Public can read battles"
ON public.battles FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated can insert battles" ON public.battles;
CREATE POLICY "Authenticated can insert battles"
ON public.battles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- (optional) creator can update/delete
DROP POLICY IF EXISTS "Creators can update battles" ON public.battles;
CREATE POLICY "Creators can update battles"
ON public.battles FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creators can delete battles" ON public.battles;
CREATE POLICY "Creators can delete battles"
ON public.battles FOR DELETE
TO authenticated
USING (auth.uid() = created_by);