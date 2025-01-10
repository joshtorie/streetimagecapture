/*
  # Add RLS policies for anonymous uploads

  1. Security
    - Enable RLS on user_added_art table
    - Add policy to allow anonymous inserts
    - Add policy to allow public reads
*/

-- Enable RLS
ALTER TABLE user_added_art ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts"
ON user_added_art
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow public reads
CREATE POLICY "Allow public reads"
ON user_added_art
FOR SELECT
TO anon
USING (true);

-- Allow storage uploads for anonymous users
CREATE POLICY "Allow anonymous uploads"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'user_added_images');

-- Allow public reads from storage
CREATE POLICY "Allow public reads from storage"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'user_added_images');