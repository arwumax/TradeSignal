import { createClient } from 'npm:@supabase/supabase-js@2';
import { AIProviderManager } from './ai-providers.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const SR_ANALYSIS_PROMPT = `You are a professional stock trader, specializing in price action analysis.
Below is a structured JSON containing only the symbol and merged timeframes data for analyzing support and resistance zones. 

Significant levels have been calculated, including: cluster_price, current_role, failed_breakouts, with_ema, etc.
There is no need to calculate indicators manually. Use the provided fields only.

Please output the analysis according to the following criteria:
1. Support/Resistance Zone Analysis
Use the recent_close_price to determine current market position.
Scoring rules for each cluster_price (from timeframes.merged):
Base Score = number of tests
with_ema: +1 if overlapping with any daily EMA or weekly EMA (from with_ema field)
failed_breakouts: -1 if any failed_breakouts

2. Selection Rules (Based on how close the zone to recent_close_price and total Score: High → Low)
Identify 2 strongest support zones below the recent_close_price:
If timeframes.merged.significant_levels.challenging_direction is support, label as "Immediate Support".
Identify 2 strongest resistance zones above the recent_close_price:
If timeframes.merged.significant_levels.challenging_direction is resistance, label as "Immediate Resistance".

Price Band: cluster_price
Indicate the strength of the zone:
Strong: ≥ 7 points
Moderate: 3–6 points
Weak: < 2 points (do not list)
State resonant EMAs explicitly in your rationale (e.g., Week 20 EMA , Day 50 EMA), and mention the source timeframe.

Output Format Example(Write plain text, no tables, no emoji):

## {symbol} {Name of Company} Support & Resistance Analysis

### Support Zones:
**S1 ~$500 (Strong | Moderate | Immediate Support)**
Hugs the Week 20 EMA and Day 50 EMA
Tested 6 times, last on 2025-06-18, all bounces held
Formed by a prior swing-low that was broken on 2025-05-30 and has since flipped into support
**S2 ~$510 (Moderate)**
Sits just 1.8 % beneath current price, touched 3 times in June  
Coincides with Day 100 EMA  

Resistance Zones:
**R1 $530 (Strong | Moderate | Immediate Resistance)**
Marks the former swing-high of 2025-06-10, broken on 2025-06-24 and now acting as resistance
Overlaps Week 50 EMA
Saw one failed upside breakout on 2025-06-27
**R2 $535 (Moderate)**
Aligns with a gap-top from 2025-04-15, unfilled so far
Price rejected twice in May, latest rejection 2025-06-12

Write plain text in paragraphs or bullet points only — no tables, no emojis.

Filtered S&R data:
{support_resistance_levels}`;

// Function to fetch support and resistance levels from external API
const fetchSupportResistanceLevels = async (symbol: string, historicalData: any) => {
  try {
    console.log(`[GENERATE-SR-ANALYSIS] Fetching S&R levels for ${symbol}`);

    // Get API key from environment variables
    const srApiKey = Deno.env.get('SUPPORT_RESISTANCE_API_KEY') || 'default-api-key';
    
    // Extract data from historical API response
    const data = historicalData.data || historicalData;

    // Prepare the payload for stock-level-tracker API with updated parameters
    const payload = {
      symbol: symbol,
      tolerance_pct: 0.3,
      atr_multiplier: 0.3,
      confirm_window: 4,
      merge_timeframes: true,
      bars: {
        week: data.week?.bars || [],
        day: data.day?.bars || []
        // Removed 30min timeframe as requested
      }
    };

    console.log(`[GENERATE-SR-ANALYSIS] S&R API Payload structure:`, {
      symbol: payload.symbol,
      tolerance_pct: payload.tolerance_pct,
      atr_multiplier: payload.atr_multiplier,
      confirm_window: payload.confirm_window,
      merge_timeframes: payload.merge_timeframes,
      weekBarsCount: payload.bars.week.length,
      dayBarsCount: payload.bars.day.length
    });

    const response = await fetch("https://stock-level-tracker.replit.app/api/v1/analysis/levels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": srApiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[GENERATE-SR-ANALYSIS] S&R API Error Response: ${errorText}`);
      throw new Error(`Support/Resistance API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[GENERATE-SR-ANALYSIS] Error fetching S&R levels:', error);
    throw error;
  }
};

// Function to filter S&R levels data to include only symbol and timeframes.merged
const filterSRLevelsForPrompt = (srLevels: any) => {
  console.log('[GENERATE-SR-ANALYSIS] 🔍 Filtering S&R levels data for prompt...');
  
  const filteredData = {
    symbol: srLevels.symbol,
    timeframes: {
      merged: srLevels.timeframes?.merged
    }
  };
  
  console.log('[GENERATE-SR-ANALYSIS] ✅ Filtered S&R data structure:', {
    hasSymbol: !!filteredData.symbol,
    hasMerged: !!filteredData.timeframes?.merged,
    mergedLevelsCount: filteredData.timeframes?.merged?.significant_levels?.length || 0
  });
  
  return filteredData;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('[GENERATE-SR-ANALYSIS] 🚀 Starting S&R analysis generation...');
    
    const { symbol, historicalDataId } = await req.json();
    console.log(`[GENERATE-SR-ANALYSIS] 📝 Request parameters:`, { symbol, historicalDataId });

    if (!symbol || !historicalDataId) {
      console.error('[GENERATE-SR-ANALYSIS] ❌ Missing required parameters');
      return new Response(
        JSON.stringify({ error: "Symbol and historicalDataId are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch historical data from cache
    console.log('[GENERATE-SR-ANALYSIS] 📊 Fetching historical data from cache...');
    const { data: cachedData, error: fetchError } = await supabase
      .from('historical_data_cache')
      .select('data')
      .eq('id', historicalDataId)
      .single();

    if (fetchError || !cachedData) {
      console.error('[GENERATE-SR-ANALYSIS] ❌ Failed to fetch historical data:', fetchError);
      throw new Error('Failed to fetch historical data from cache');
    }

    const historicalData = cachedData.data;
    console.log('[GENERATE-SR-ANALYSIS] ✅ Historical data retrieved from cache');

    // Fetch support and resistance levels
    console.log('[GENERATE-SR-ANALYSIS] 🎯 Fetching support & resistance levels...');
    const srLevels = await fetchSupportResistanceLevels(symbol, historicalData);
    console.log('[GENERATE-SR-ANALYSIS] ✅ S&R levels fetched successfully');

    // Filter S&R levels to include only symbol and timeframes.merged
    const filteredSRLevels = filterSRLevelsForPrompt(srLevels);

    // Format filtered S&R levels for the prompt
    const srLevelsText = JSON.stringify(filteredSRLevels, null, 2);

    // Prepare the S&R analysis prompt (removed historical_data_summary)
    const srPrompt = SR_ANALYSIS_PROMPT
      .replace('{support_resistance_levels}', srLevelsText);

    console.log('[GENERATE-SR-ANALYSIS] 📊 Prompt prepared with filtered data, length:', srPrompt.length);

    // Generate S&R analysis using AI Provider Manager
    console.log('[GENERATE-SR-ANALYSIS] 🤖 Generating S&R analysis with AI providers...');
    const aiManager = new AIProviderManager();
    const srAnalysis = await aiManager.callAI(srPrompt);
    console.log('[GENERATE-SR-ANALYSIS] ✅ S&R analysis generated, length:', srAnalysis.length);

    const result = {
      success: true,
      analysis: srAnalysis,
      symbol: symbol,
      analysisType: 'support_resistance'
    };

    console.log('[GENERATE-SR-ANALYSIS] 📤 Sending response:', {
      success: result.success,
      hasAnalysis: !!result.analysis,
      analysisLength: result.analysis?.length || 0,
      symbol: result.symbol
    });

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("[GENERATE-SR-ANALYSIS] ❌ Error generating S&R analysis:", error);
    console.error("[GENERATE-SR-ANALYSIS] ❌ Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate support & resistance analysis",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});