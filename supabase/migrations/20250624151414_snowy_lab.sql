/*
  # Create stock analyses table

  1. New Tables
    - `stock_analyses`
      - `id` (uuid, primary key)
      - `symbol` (text, stock symbol)
      - `analysis_type` (text, type of analysis)
      - `analysis_text` (text, the analysis content)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `stock_analyses` table
    - Add policy for public read access (since this is a demo app)
*/

CREATE TABLE IF NOT EXISTS stock_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  analysis_type text NOT NULL CHECK (analysis_type IN ('historical', 'support_resistance', 'combined')),
  analysis_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_stock_analyses_symbol ON stock_analyses(symbol);
CREATE INDEX IF NOT EXISTS idx_stock_analyses_created_at ON stock_analyses(created_at DESC);

-- Enable RLS
ALTER TABLE stock_analyses ENABLE ROW LEVEL SECURITY;

-- Allow public read access for demo purposes
CREATE POLICY "Allow public read access"
  ON stock_analyses
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow public insert for demo purposes
CREATE POLICY "Allow public insert"
  ON stock_analyses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stock_analyses_updated_at
  BEFORE UPDATE ON stock_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();