import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface HistoricalDataRequest {
  symbol: string;
  requests: Array<{
    interval: string;
    recent_bar_no: number;
    indicators: {
      ema?: number[];
      rsi?: { length: number };
      macd?: { fast: number; slow: number; signal: number };
      dmi?: { length: number };
      atr?: { length: number };
    };
  }>;
  include_extended_hours: boolean;
  output_format: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('[FETCH-HISTORICAL-STORE] 🚀 Starting historical data fetch and store...');
    
    const { symbol } = await req.json();
    console.log(`[FETCH-HISTORICAL-STORE] 📝 Request for symbol: ${symbol}`);

    if (!symbol) {
      console.error("[FETCH-HISTORICAL-STORE] ❌ No symbol provided");
      return new Response(
        JSON.stringify({ error: "Symbol is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get API key from environment variables
    const historicalDataApiKey = Deno.env.get('HISTORICAL_DATA_API_KEY');
    if (!historicalDataApiKey) {
      console.error("[FETCH-HISTORICAL-STORE] ❌ HISTORICAL_DATA_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Historical data API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare the request payload for comprehensive historical data
    const requestPayload: HistoricalDataRequest = {
      symbol: symbol,
      requests: [
        {
          interval: "week",
          recent_bar_no: 150,
          indicators: {
            ema: [20, 30, 40],
            rsi: { length: 14 },
            macd: { fast: 12, slow: 26, signal: 9 },
            dmi: { length: 14 },
            atr: { length: 14 }
          }
        },
        {
          interval: "day",
          recent_bar_no: 250,
          indicators: {
            ema: [20, 50, 100, 200],
            rsi: { length: 14 },
            macd: { fast: 12, slow: 26, signal: 9 },
            dmi: { length: 14 },
            atr: { length: 14 }
          }
        },
        {
          interval: "30min",
          recent_bar_no: 200,
          indicators: {
            rsi: { length: 14 },
            macd: { fast: 12, slow: 26, signal: 9 },
            dmi: { length: 14 },
            atr: { length: 14 }
          }
        }
      ],
      include_extended_hours: false,
      output_format: "compact-json"
    };

    console.log("[FETCH-HISTORICAL-STORE] 📤 Calling historical data API...");

    // Call the historical data API with environment variable API key
    const response = await fetch("https://stock-historical-data-downloader.maxwu.work/api/v1/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": historicalDataApiKey,
      },
      body: JSON.stringify(requestPayload),
    });

    console.log(`[FETCH-HISTORICAL-STORE] 📡 API Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[FETCH-HISTORICAL-STORE] ❌ API Error Response: ${errorText}`);
      throw new Error(`Historical data API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("[FETCH-HISTORICAL-STORE] 📊 Historical data structure:", {
      hasData: !!data,
      keys: data ? Object.keys(data) : [],
      dataKeys: data?.data ? Object.keys(data.data) : [],
      weekBarsCount: data?.data?.week?.bars?.length || 0,
      dayBarsCount: data?.data?.day?.bars?.length || 0,
      thirtyMinBarsCount: data?.data?.['30min']?.bars?.length || 0
    });

    // Store the data in Supabase
    console.log("[FETCH-HISTORICAL-STORE] 💾 Storing data in cache...");
    const { data: insertedData, error: insertError } = await supabase
      .from('historical_data_cache')
      .insert({
        symbol: symbol.toUpperCase(),
        data: data,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[FETCH-HISTORICAL-STORE] ❌ Database error:', insertError);
      throw new Error(`Failed to store historical data: ${insertError.message}`);
    }

    console.log(`[FETCH-HISTORICAL-STORE] ✅ Data stored successfully with ID: ${insertedData.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        historicalDataId: insertedData.id,
        symbol: symbol,
        dataStructure: {
          weekBarsCount: data?.data?.week?.bars?.length || 0,
          dayBarsCount: data?.data?.day?.bars?.length || 0,
          thirtyMinBarsCount: data?.data?.['30min']?.bars?.length || 0
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("[FETCH-HISTORICAL-STORE] ❌ Error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch and store historical data",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});