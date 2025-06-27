/*
  # Create historical data cache table

  1. New Tables
    - `historical_data_cache`
      - `id` (uuid, primary key)
      - `symbol` (text, stock symbol)
      - `data` (jsonb, raw historical data)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `historical_data_cache` table
    - Add policies for public access (demo purposes)

  3. Indexes
    - Index on symbol for faster lookups
    - Index on created_at for cleanup operations
*/

CREATE TABLE IF NOT EXISTS historical_data_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_historical_data_cache_symbol ON historical_data_cache(symbol);
CREATE INDEX IF NOT EXISTS idx_historical_data_cache_created_at ON historical_data_cache(created_at DESC);

-- Enable RLS
ALTER TABLE historical_data_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access for demo purposes
CREATE POLICY "Allow public read access"
  ON historical_data_cache
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow public insert for demo purposes
CREATE POLICY "Allow public insert"
  ON historical_data_cache
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Optional: Add cleanup policy to remove old data (older than 24 hours)
-- This can be run as a scheduled job
CREATE OR REPLACE FUNCTION cleanup_old_historical_data()
RETURNS void AS $$
BEGIN
  DELETE FROM historical_data_cache 
  WHERE created_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql;