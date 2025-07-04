import { createClient } from 'npm:@supabase/supabase-js@2';
import { AIProviderManager } from './ai-providers.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const STRATEGY_ANALYSIS_PROMPT = `You are a professional price-action trader. Using the trend analysis and the support / resistance analysis, design four short-term strategies for 15-minute to 1-hour charts.

Writing Requirements
Align strategies with the trend
Market is bullish: at least three long setups; 
Market is bearish: at least three short setups; 
Market is neutral: 2 long & 2 short setups.
If a counter-trend is included, give a clear reversal trigger and a minimum reward-to-risk (R:R) of 3. 

Each strategy should include:
**Strategy type:** e.g., pullback-entry, breakout-retest, false-break trap …)
**Entry plan:** price zone + 1–2 confirmation signals (Pin Bar, RSI, MACD signals)
**Exit plan:** First target price with reasons (e.g., next resistance), Extended target or trailing-stop rule.
**Stop-loss:** Reject the hypothetical trend
**Re-entry plan** (optional) 

Format: point form only; no tables or emojis; keep dollar signs and price figures.

Example template
**Strategy 1**: Bullish pullback
–Entry: price dips into S3 $591.8–593.8, 30-min bullish engulfing + RSI rebounds from 40
–Targets: first target R1 lower edge $604.2 (R:R ≈ 1 : 1.8); extended target R2 lower edge $610.4 (R:R ≈ 1 : 3).
–Stop: 30-min close below $590

Please provide four complete strategies in the above format.

Trend Analysis
{trend_analysis}

Support / Resistance Analysis
{support_resistance_analysis}`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('[STRATEGY-ANALYSIS] 🚀 Starting strategy analysis generation...');
    
    const { symbol, trendAnalysis, supportResistanceAnalysis } = await req.json();
    console.log(`[STRATEGY-ANALYSIS] 📝 Request parameters:`, { 
      symbol, 
      hasTrendAnalysis: !!trendAnalysis,
      hasSRAnalysis: !!supportResistanceAnalysis,
      trendAnalysisLength: trendAnalysis?.length || 0,
      srAnalysisLength: supportResistanceAnalysis?.length || 0
    });

    if (!symbol || !trendAnalysis || !supportResistanceAnalysis) {
      console.error('[STRATEGY-ANALYSIS] ❌ Missing required parameters');
      return new Response(
        JSON.stringify({ error: "Symbol, trendAnalysis, and supportResistanceAnalysis are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare the strategy analysis prompt with the provided analyses
    const strategyPrompt = STRATEGY_ANALYSIS_PROMPT
      .replace('{trend_analysis}', trendAnalysis)
      .replace('{support_resistance_analysis}', supportResistanceAnalysis);

    console.log('[STRATEGY-ANALYSIS] 📊 Prompt prepared, length:', strategyPrompt.length);

    // Generate strategy analysis using AI Provider Manager
    console.log('[STRATEGY-ANALYSIS] 🤖 Generating strategy analysis with AI providers...');
    const aiManager = new AIProviderManager();
    const strategyAnalysis = await aiManager.callAI(strategyPrompt);
    console.log('[STRATEGY-ANALYSIS] ✅ Strategy analysis generated, length:', strategyAnalysis.length);

    const result = {
      success: true,
      analysis: strategyAnalysis,
      symbol: symbol,
      analysisType: 'strategy'
    };

    console.log('[STRATEGY-ANALYSIS] 📤 Sending response:', {
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
    console.error("[STRATEGY-ANALYSIS] ❌ Error generating strategy analysis:", error);
    console.error("[STRATEGY-ANALYSIS] ❌ Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate strategy analysis",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});