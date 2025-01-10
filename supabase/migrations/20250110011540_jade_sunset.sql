/*
  # Modify user_added_art table for anonymous uploads

  1. Changes
    - Drop the foreign key constraint on user_id
    - Make user_id nullable to support anonymous uploads
*/

-- Drop the foreign key constraint
ALTER TABLE user_added_art
DROP CONSTRAINT user_added_art_user_id_fkey;

-- Make user_id nullable
ALTER TABLE user_added_art
ALTER COLUMN user_id DROP NOT NULL;