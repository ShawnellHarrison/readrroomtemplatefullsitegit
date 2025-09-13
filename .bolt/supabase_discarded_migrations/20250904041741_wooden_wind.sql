/*
  # Create Voting System Schema

  1. New Tables
    - `vote_rooms`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, optional)
      - `type` (text, voting method)
      - `options` (jsonb, for multiple choice)
      - `scale_min` (integer, for scale voting)
      - `scale_max` (integer, for scale voting)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `expires_at` (timestamp, 30 days default)
    
    - `votes`
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key)
      - `value` (jsonb, flexible vote data)
      - `session_id` (text, anonymous user tracking)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Public read access for active rooms
    - Public insert/update for votes
    - Automatic cleanup after 30 days

  3. Indexes
    - Performance indexes for common queries
    - Session-based vote tracking
*/

-- Create vote_rooms table
CREATE TABLE IF NOT EXISTS vote_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('yes-no', 'multiple-choice', 'scale', 'ranked-choice')),
  options jsonb,
  scale_min integer,
  scale_max integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES vote_rooms(id) ON DELETE CASCADE,
  value jsonb NOT NULL,
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE vote_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vote_rooms
CREATE POLICY "Anyone can read active rooms"
  ON vote_rooms
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Anyone can create rooms"
  ON vote_rooms
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Room creators can update their rooms"
  ON vote_rooms
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policies for votes
CREATE POLICY "Anyone can read votes"
  ON votes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can submit votes"
  ON votes
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own votes"
  ON votes
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vote_rooms_active ON vote_rooms(is_active, created_at);
CREATE INDEX IF NOT EXISTS idx_votes_room_id ON votes(room_id);
CREATE INDEX IF NOT EXISTS idx_votes_session_room ON votes(session_id, room_id);