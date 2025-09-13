/*
  # Fix vote_rooms policy

  1. Policy Fix
    - Drop existing policy that references wrong column
    - Recreate policy with correct column reference

  2. Changes
    - Uses `active = true` instead of `is_active = true`
    - Maintains same security permissions
*/

DROP POLICY "Anyone can read active rooms" ON vote_rooms;

CREATE POLICY "Anyone can read active rooms"
ON vote_rooms
FOR SELECT
USING (active = true);