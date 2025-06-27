/*
  # Add trend_and_sr analysis type

  1. Changes
    - Add 'trend_and_sr' to the analysis_type constraint
    - This allows storing combined trend and support/resistance analyses

  2. Security
    - No changes to existing RLS policies
    - Maintains existing security model
*/

ALTER TABLE stock_analyses 
DROP CONSTRAINT IF EXISTS stock_analyses_analysis_type_check;

ALTER TABLE stock_analyses 
ADD CONSTRAINT stock_analyses_analysis_type_check 
CHECK ((analysis_type = ANY (ARRAY['historical'::text, 'support_resistance'::text, 'combined'::text, 'trend_and_sr'::text])));