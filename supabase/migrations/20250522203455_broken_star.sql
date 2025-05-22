/*
  # User playlists and preferences schema

  1. New Tables
    - `user_playlists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `playlist_items`
      - `id` (uuid, primary key)
      - `playlist_id` (uuid, references user_playlists)
      - `video_id` (text)
      - `title` (text)
      - `channel_title` (text)
      - `thumbnail_url` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own playlists
*/

-- Create user_playlists table
CREATE TABLE IF NOT EXISTS user_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create playlist_items table
CREATE TABLE IF NOT EXISTS playlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES user_playlists ON DELETE CASCADE NOT NULL,
  video_id text NOT NULL,
  title text NOT NULL,
  channel_title text NOT NULL,
  thumbnail_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;

-- Policies for user_playlists
CREATE POLICY "Users can view their own playlists"
  ON user_playlists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists"
  ON user_playlists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
  ON user_playlists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
  ON user_playlists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for playlist_items
CREATE POLICY "Users can view items in their playlists"
  ON playlist_items
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_playlists
    WHERE id = playlist_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can add items to their playlists"
  ON playlist_items
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_playlists
    WHERE id = playlist_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can remove items from their playlists"
  ON playlist_items
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_playlists
    WHERE id = playlist_id
    AND user_id = auth.uid()
  ));