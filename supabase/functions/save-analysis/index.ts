import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SaveAnalysisRequest {
  symbol: string;
  analysisType: 'historical' | 'support_resistance' | 'combined' | 'trend_and_sr';
  analysisText: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { symbol, analysisType, analysisText }: SaveAnalysisRequest = await req.json();

    if (!symbol || !analysisType || !analysisText) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: symbol, analysisType, and analysisText' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate analysis type
    const validTypes = ['historical', 'support_resistance', 'combined', 'trend_and_sr'];
    if (!validTypes.includes(analysisType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid analysis type' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert the analysis into the database
    const { data, error } = await supabase
      .from('stock_analyses')
      .insert({
        symbol: symbol.toUpperCase(),
        analysis_type: analysisType,
        analysis_text: analysisText,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save analysis',
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        id: data.id,
        message: 'Analysis saved successfully',
        data: {
          id: data.id,
          symbol: data.symbol,
          analysisType: data.analysis_type,
          createdAt: data.created_at
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in save-analysis function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});