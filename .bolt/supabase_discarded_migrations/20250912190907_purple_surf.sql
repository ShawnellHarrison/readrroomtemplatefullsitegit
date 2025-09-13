/*
  # Add movie_battle to vote_room_type enum

  1. Schema Changes
    - Add 'movie_battle' as a valid value to the vote_room_type enum
    - This allows movie battles to be stored as special vote rooms

  2. Background
    - The application code expects 'movie_battle' as a valid room type
    - Current enum only has: yes-no, multiple-choice, scale, ranked-choice
    - Adding movie_battle enables the movie battle functionality
*/

-- Add 'movie_battle' to the existing vote_room_type enum
ALTER TYPE vote_room_type ADD VALUE 'movie_battle';