/*
  # Fix vote_rooms policy

  1. Policy Fix
    - Drop existing policy safely with IF EXISTS
    - Recreate policy with correct column reference (active = true)
*/

DROP POLICY IF EXISTS "Anyone can read active rooms" ON vote_rooms;
CREATE POLICY "Anyone can read active rooms" ON vote_rooms FOR SELECT USING (active = true);