/*
  # Create saves table for game save system

  1. New Tables
    - `saves`
      - `id` (uuid, primary key)
      - `slot` (integer, save slot number 1-3)
      - `user_id` (uuid, optional user reference)
      - `data` (jsonb, save game data)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `saves` table
    - Add policy for users to manage their own saves
    - Allow anonymous saves for single-player mode
*/

CREATE TABLE IF NOT EXISTS saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot integer NOT NULL CHECK (slot >= 1 AND slot <= 3),
  user_id uuid REFERENCES auth.users(id),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS saves_slot_idx ON saves(slot);
CREATE INDEX IF NOT EXISTS saves_user_id_idx ON saves(user_id);

ALTER TABLE saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own saves"
  ON saves
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saves"
  ON saves
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saves"
  ON saves
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saves"
  ON saves
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous can manage saves without user_id"
  ON saves
  FOR ALL
  TO anon
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);
