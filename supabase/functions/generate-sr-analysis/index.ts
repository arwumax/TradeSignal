import { createClient } from 'npm:@supabase/supabase-js@2';
import { AIProviderManager } from './ai-providers.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const SR_ANALYSIS_PROMPT = `You are a professional technical analyst specializing in support and resistance levels. Using the historical stock data provided below, identify and analyze key support and resistance levels across multiple timeframes.

Historical Data Analysis:
{historical_data_summary}

Support & Resistance Levels:
{support_resistance_levels}

Please provide a comprehensive analysis that includes:

1. **Key Support Levels**: Identify the most significant support levels with price ranges and strength indicators
2. **Key Resistance Levels**: Identify the most significant resistance levels with price ranges and strength indicators  
3. **Multi-Timeframe Analysis**: How these levels align across weekly, daily, and intraday timeframes
4. **Volume Confirmation**: Areas where volume supports the significance of these levels
5. **Trading Implications**: How traders can use these levels for entries, exits, and risk management

Format your response in clear sections with specific price levels and actionable insights. Use markdown formatting for better readability.`;

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

// Function to create historical data summary
const createHistoricalDataSummary = (historicalData: any) => {
  const data = historicalData.data || historicalData;
  
  const summary = {
    weeklyBars: data.week?.bars?.length || 0,
    dailyBars: data.day?.bars?.length || 0,
    thirtyMinBars: data['30min']?.bars?.length || 0,
    priceRange: {
      weekly: data.week?.bars ? {
        high: Math.max(...data.week.bars.map((bar: any) => bar.h)),
        low: Math.min(...data.week.bars.map((bar: any) => bar.l)),
        latest: data.week.bars[data.week.bars.length - 1]?.c
      } : null,
      daily: data.day?.bars ? {
        high: Math.max(...data.day.bars.map((bar: any) => bar.h)),
        low: Math.min(...data.day.bars.map((bar: any) => bar.l)),
        latest: data.day.bars[data.day.bars.length - 1]?.c
      } : null
    }
  };

  return `
Weekly Data: ${summary.weeklyBars} bars, Price Range: $${summary.priceRange.weekly?.low?.toFixed(2)} - $${summary.priceRange.weekly?.high?.toFixed(2)}, Current: $${summary.priceRange.weekly?.latest?.toFixed(2)}
Daily Data: ${summary.dailyBars} bars, Price Range: $${summary.priceRange.daily?.low?.toFixed(2)} - $${summary.priceRange.daily?.high?.toFixed(2)}, Current: $${summary.priceRange.daily?.latest?.toFixed(2)}
Intraday Data: ${summary.thirtyMinBars} bars (30-minute intervals)
  `;
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

    // Create historical data summary
    const historicalDataSummary = createHistoricalDataSummary(historicalData);

    // Format filtered S&R levels for the prompt
    const srLevelsText = JSON.stringify(filteredSRLevels, null, 2);

    // Prepare the S&R analysis prompt
    const srPrompt = SR_ANALYSIS_PROMPT
      .replace('{historical_data_summary}', historicalDataSummary)
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