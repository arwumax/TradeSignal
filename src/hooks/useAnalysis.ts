import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  AnalysisResponse, 
  SaveAnalysisResponse, 
  LoadingStep,
  HistoricalDataResponse,
  TrendAnalysisResponse,
  SRAnalysisResponse,
  StrategyAnalysisResponse,
  Analysis
} from '../types/analysis';
import { getETInfo, getTradingPeriodDescription } from '../utils/tradingHours';

export const useAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([
    { id: 'check_cache', label: 'Checking for recent analysis', status: 'pending' },
    { id: 'fetch_historical', label: 'Fetching historical data (est. 10s)', status: 'pending' },
    { id: 'generate_trend', label: 'Generating trend analysis (est. 1min)', status: 'pending' },
    { id: 'generate_sr', label: 'Analyzing support & resistance (est. 1min)', status: 'pending' },
    { id: 'generate_strategy', label: 'Generating trading strategies (est. 1min)', status: 'pending' },
    { id: 'saving', label: 'Saving results', status: 'pending' },
  ]);

  const updateStepStatus = (
    stepId: string, 
    status: LoadingStep['status'], 
    error?: string
  ) => {
    setLoadingSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, error } : step
    ));
  };

  const resetSteps = () => {
    setLoadingSteps([
      { id: 'check_cache', label: 'Checking for recent analysis', status: 'pending' },
      { id: 'fetch_historical', label: 'Fetching historical data (est. 10s)', status: 'pending' },
      { id: 'generate_trend', label: 'Generating trend analysis (est. 1min)', status: 'pending' },
      { id: 'generate_sr', label: 'Analyzing support & resistance (est. 1min)', status: 'pending' },
      { id: 'generate_strategy', label: 'Generating trading strategies (est. 1min)', status: 'pending' },
      { id: 'saving', label: 'Saving results', status: 'pending' },
    ]);
  };

  // Enhanced check for recent analysis with trading hours logic
  const checkForRecentAnalysis = async (symbol: string): Promise<Analysis | null> => {
    console.log(`[FRONTEND] 🔍 Checking for recent analysis for ${symbol} with trading hours logic`);
    
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const isPlaceholderUrl = !supabaseUrl || supabaseUrl.includes('your_supabase_project_url_here');
      const isPlaceholderKey = !supabaseAnonKey || supabaseAnonKey.includes('your_supabase_anon_key_here');
      
      if (isPlaceholderUrl || isPlaceholderKey) {
        console.log('[FRONTEND] ⚠️ Supabase not configured - skipping cache check');
        return null;
      }
      
      // Get current trading period information
      const currentTime = new Date();
      const tradingInfo = getETInfo(currentTime);
      
      console.log(`[FRONTEND] 📅 Current trading period info:`, {
        currentPeriodType: tradingInfo.currentPeriodType,
        isCurrentlyTradingHours: tradingInfo.isCurrentlyTradingHours,
        periodStartUTC: tradingInfo.periodStartUTC.toISOString(),
        periodEndUTC: tradingInfo.periodEndUTC.toISOString(),
        description: getTradingPeriodDescription(currentTime)
      });
      
      // Look for analyses created within the current trading period
      console.log(`[FRONTEND] 📅 Looking for analyses created after: ${tradingInfo.periodStartUTC.toISOString()}`);
      
      const { data, error } = await supabase
        .from('stock_analyses')
        .select('*')
        .eq('symbol', symbol.toUpperCase())
        .gte('created_at', tradingInfo.periodStartUTC.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('[FRONTEND] ❌ Error checking for recent analysis:', error);
        throw error;
      }

      if (data && data.length > 0) {
        const existingAnalysis = data[0];
        const analysisCreatedAt = new Date(existingAnalysis.created_at);
        
        console.log(`[FRONTEND] ✅ Found analysis within current trading period for ${symbol}:`, {
          id: existingAnalysis.id,
          created_at: existingAnalysis.created_at,
          analysis_type: existingAnalysis.analysis_type,
          createdInCurrentPeriod: analysisCreatedAt >= tradingInfo.periodStartUTC
        });
        
        // Verify the analysis was indeed created in the current period
        if (analysisCreatedAt >= tradingInfo.periodStartUTC) {
          console.log(`[FRONTEND] 🚫 Analysis already exists for current ${tradingInfo.currentPeriodType} period`);
          return existingAnalysis;
        }
      }

      console.log(`[FRONTEND] 📭 No analysis found for current ${tradingInfo.currentPeriodType} period for ${symbol}`);
      return null;
    } catch (error) {
      console.error('[FRONTEND] ❌ Error in checkForRecentAnalysis:', error);
      // Don't throw the error - just return null and proceed with new analysis
      return null;
    }
  };

  // Validate environment variables with enhanced error messages
  const validateEnvironment = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('[FRONTEND] 🔧 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseAnonKey: !!supabaseAnonKey,
      supabaseUrlFormat: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing'
    });
    
    // Check for placeholder values first
    const isPlaceholderUrl = !supabaseUrl || supabaseUrl.includes('your_supabase_project_url_here');
    const isPlaceholderKey = !supabaseAnonKey || supabaseAnonKey.includes('your_supabase_anon_key_here');
    
    if (isPlaceholderUrl || isPlaceholderKey) {
      throw new Error(`🔧 Supabase Configuration Required

To use this application, you need to configure your Supabase credentials:

1. 📋 Click the "Connect to Supabase" button in the top right corner
   OR
2. 🔑 Manually update your .env file with your actual Supabase credentials:
   - Go to your Supabase project dashboard
   - Navigate to Project Settings → API
   - Copy your Project URL and anon/public key
   - Update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file

3. 🔄 Restart the development server after updating the .env file

Current status:
- VITE_SUPABASE_URL: ${isPlaceholderUrl ? '❌ Not configured (placeholder value)' : '✅ Configured'}
- VITE_SUPABASE_ANON_KEY: ${isPlaceholderKey ? '❌ Not configured (placeholder value)' : '✅ Configured'}`);
    }
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(`🔧 Missing Supabase Environment Variables

Please check your .env file and ensure both variables are set:
- VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Present' : '❌ Missing'}
- VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Present' : '❌ Missing'}

You can find these values in your Supabase project settings under "API".`);
    }

    // Validate URL format
    if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
      throw new Error(`🔧 Invalid Supabase URL Format

Expected format: https://your-project-id.supabase.co
Current value: ${supabaseUrl}

Please check your VITE_SUPABASE_URL in the .env file.`);
    }

    return { supabaseUrl, supabaseAnonKey };
  };

  // Step 1: Fetch and store historical data
  const fetchHistoricalData = async (symbol: string): Promise<HistoricalDataResponse> => {
    console.log(`[FRONTEND] 📊 Step 1: Fetching historical data for ${symbol}`);
    updateStepStatus('fetch_historical', 'loading');
    
    try {
      const { supabaseUrl, supabaseAnonKey } = validateEnvironment();
      const functionUrl = `${supabaseUrl}/functions/v1/fetch-historical-data-and-store`;
      
      console.log('[FRONTEND] 📤 Calling fetch-historical-data-and-store function:', functionUrl);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol }),
      });

      console.log('[FRONTEND] 📡 Historical data response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[FRONTEND] ❌ Historical data error response:', errorText);
        
        // Enhanced error handling for specific HTTP status codes
        if (response.status === 404) {
          throw new Error('📡 Edge Function Not Found\n\nThe fetch-historical-data-and-store function is not deployed to your Supabase project. Please ensure all Edge Functions are properly deployed.');
        } else if (response.status === 401) {
          throw new Error('🔐 Authentication Failed\n\nYour Supabase API key appears to be invalid. Please check your VITE_SUPABASE_ANON_KEY in the .env file.');
        } else if (response.status === 403) {
          throw new Error('🚫 Access Forbidden\n\nPlease verify your Supabase project permissions and API key configuration.');
        } else if (response.status >= 500) {
          throw new Error(`🔧 Server Error (${response.status})\n\nThe Supabase Edge Function is experiencing issues. Please try again later.`);
        }
        
        // Try to parse the error response for better error handling
        let errorDetails = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error && errorJson.details) {
            throw new Error(`${errorJson.error}: ${errorJson.details}`);
          } else if (errorJson.error) {
            throw new Error(errorJson.error);
          }
        } catch (parseError) {
          // If JSON parsing fails, use the original error text
        }
        
        throw new Error(`📡 Historical Data Fetch Failed (${response.status})\n\n${errorDetails}`);
      }

      const result = await response.json();
      console.log('[FRONTEND] 📊 Historical data result:', {
        success: result.success,
        historicalDataId: result.historicalDataId,
        symbol: result.symbol,
        dataStructure: result.dataStructure
      });
      
      if (!result.success) {
        const errorMessage = result.details || result.error || 'Failed to fetch historical data';
        throw new Error(errorMessage);
      }
      
      updateStepStatus('fetch_historical', 'completed');
      return result;
    } catch (error) {
      console.error('[FRONTEND] ❌ Fetch historical data error:', error);
      
      // Enhanced error handling for network issues
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const enhancedError = new Error(`🌐 Connection Failed

Unable to connect to Supabase Edge Functions. This could be due to:

1. 🔧 Supabase Configuration Issues:
   - Check your .env file for correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   - Ensure your Supabase project is active and accessible

2. 📡 Edge Function Deployment:
   - Verify that the fetch-historical-data-and-store function is deployed to your Supabase project
   - Check your Supabase dashboard for function deployment status

3. 🌐 Network Issues:
   - Check your internet connection
   - Try refreshing the page

Please verify your Supabase configuration and try again.`);
        updateStepStatus('fetch_historical', 'error', enhancedError.message);
        throw enhancedError;
      }
      
      updateStepStatus('fetch_historical', 'error', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  };

  // Step 2: Generate trend analysis
  const generateTrendAnalysis = async (symbol: string, historicalDataId: string): Promise<TrendAnalysisResponse> => {
    console.log(`[FRONTEND] 📈 Step 2: Generating trend analysis for ${symbol}`);
    updateStepStatus('generate_trend', 'loading');
    
    try {
      const { supabaseUrl, supabaseAnonKey } = validateEnvironment();
      const functionUrl = `${supabaseUrl}/functions/v1/generate-trend-analysis`;
      
      console.log('[FRONTEND] 📤 Calling generate-trend-analysis function:', functionUrl);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol, historicalDataId }),
      });

      console.log('[FRONTEND] 📡 Trend analysis response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[FRONTEND] ❌ Trend analysis error response:', errorText);
        
        if (response.status === 404) {
          throw new Error('📡 Edge Function Not Found\n\nThe generate-trend-analysis function is not deployed to your Supabase project. Please ensure all Edge Functions are properly deployed.');
        } else if (response.status === 401) {
          throw new Error('🔐 Authentication Failed\n\nYour Supabase API key appears to be invalid. Please check your VITE_SUPABASE_ANON_KEY in the .env file.');
        } else if (response.status === 403) {
          throw new Error('🚫 Access Forbidden\n\nPlease verify your Supabase project permissions and API key configuration.');
        } else if (response.status >= 500) {
          throw new Error(`🔧 Server Error (${response.status})\n\nThe Supabase Edge Function is experiencing issues. Please try again later.`);
        }
        
        throw new Error(`📈 Trend Analysis Failed (${response.status})\n\n${errorText}`);
      }

      const result = await response.json();
      console.log('[FRONTEND] 📊 Trend analysis result:', {
        success: result.success,
        hasAnalysis: !!result.analysis,
        analysisLength: result.analysis?.length || 0,
        symbol: result.symbol
      });
      
      if (!result.success) {
        throw new Error(result.details || 'Failed to generate trend analysis');
      }
      
      updateStepStatus('generate_trend', 'completed');
      return result;
    } catch (error) {
      console.error('[FRONTEND] ❌ Generate trend analysis error:', error);
      
      // Enhanced error handling for network issues
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const enhancedError = new Error(`🌐 Connection Failed

Unable to connect to the trend analysis function. This could be due to:

1. 🔧 Supabase Configuration Issues:
   - Check your .env file for correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   - Ensure your Supabase project is active and accessible

2. 📡 Edge Function Deployment:
   - Verify that the generate-trend-analysis function is deployed to your Supabase project
   - Check your Supabase dashboard for function deployment status

3. 🌐 Network Issues:
   - Check your internet connection
   - Try refreshing the page

Please verify your Supabase configuration and try again.`);
        updateStepStatus('generate_trend', 'error', enhancedError.message);
        throw enhancedError;
      }
      
      updateStepStatus('generate_trend', 'error', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  };

  // Step 3: Generate S&R analysis with enhanced error handling
  const generateSRAnalysis = async (symbol: string, historicalDataId: string): Promise<SRAnalysisResponse> => {
    console.log(`[FRONTEND] 🎯 Step 3: Generating S&R analysis for ${symbol}`);
    updateStepStatus('generate_sr', 'loading');
    
    try {
      const { supabaseUrl, supabaseAnonKey } = validateEnvironment();
      const functionUrl = `${supabaseUrl}/functions/v1/generate-sr-analysis`;
      
      console.log('[FRONTEND] 📤 Calling generate-sr-analysis function:', functionUrl);
      
      // Add timeout and better error handling for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol, historicalDataId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('[FRONTEND] 📡 S&R analysis response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[FRONTEND] ❌ S&R analysis error response:', errorText);
        
        // Enhanced error handling for specific HTTP status codes
        if (response.status === 404) {
          throw new Error('📡 Edge Function Not Found\n\nThe generate-sr-analysis function is not deployed to your Supabase project. Please ensure all Edge Functions are properly deployed.');
        } else if (response.status === 401) {
          throw new Error('🔐 Authentication Failed\n\nYour Supabase API key appears to be invalid. Please check your VITE_SUPABASE_ANON_KEY in the .env file.');
        } else if (response.status === 403) {
          throw new Error('🚫 Access Forbidden\n\nPlease verify your Supabase project permissions and API key configuration.');
        } else if (response.status >= 500) {
          throw new Error(`🔧 Server Error (${response.status})\n\nThe Supabase Edge Function is experiencing issues. Please try again later.`);
        } else {
          throw new Error(`🎯 S&R Analysis Failed (${response.status})\n\n${errorText}`);
        }
      }

      const result = await response.json();
      console.log('[FRONTEND] 📊 S&R analysis result:', {
        success: result.success,
        hasAnalysis: !!result.analysis,
        analysisLength: result.analysis?.length || 0,
        symbol: result.symbol
      });
      
      if (!result.success) {
        throw new Error(result.details || 'Failed to generate S&R analysis');
      }
      
      updateStepStatus('generate_sr', 'completed');
      return result;
    } catch (error) {
      console.error('[FRONTEND] ❌ Generate S&R analysis error:', error);
      
      // Enhanced error message for specific error types
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = '⏱️ Request Timeout\n\nThe S&R analysis request timed out. Please try again.';
        } else if (error.message === 'Failed to fetch') {
          errorMessage = `🌐 Connection Failed

Unable to connect to the S&R analysis function. This could be due to:

1. 🔧 Supabase Configuration Issues:
   - Check your .env file for correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   - Ensure your Supabase project is active and accessible

2. 📡 Edge Function Deployment:
   - Verify that the generate-sr-analysis function is deployed to your Supabase project
   - Check your Supabase dashboard for function deployment status

3. 🌐 Network Issues:
   - Check your internet connection
   - Try refreshing the page

Please verify your Supabase configuration and try again.`;
        } else {
          errorMessage = error.message;
        }
      }
      
      updateStepStatus('generate_sr', 'error', errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Step 4: Generate strategy analysis
  const generateStrategyAnalysis = async (symbol: string, trendAnalysis: string, supportResistanceAnalysis: string): Promise<StrategyAnalysisResponse> => {
    console.log(`[FRONTEND] 🎯 Step 4: Generating strategy analysis for ${symbol}`);
    updateStepStatus('generate_strategy', 'loading');
    
    try {
      const { supabaseUrl, supabaseAnonKey } = validateEnvironment();
      const functionUrl = `${supabaseUrl}/functions/v1/generate-strategy-analysis`;
      
      console.log('[FRONTEND] 📤 Calling generate-strategy-analysis function:', functionUrl);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol, trendAnalysis, supportResistanceAnalysis }),
      });

      console.log('[FRONTEND] 📡 Strategy analysis response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[FRONTEND] ❌ Strategy analysis error response:', errorText);
        
        if (response.status === 404) {
          throw new Error('📡 Edge Function Not Found\n\nThe generate-strategy-analysis function is not deployed to your Supabase project. Please ensure all Edge Functions are properly deployed.');
        } else if (response.status === 401) {
          throw new Error('🔐 Authentication Failed\n\nYour Supabase API key appears to be invalid. Please check your VITE_SUPABASE_ANON_KEY in the .env file.');
        } else if (response.status === 403) {
          throw new Error('🚫 Access Forbidden\n\nPlease verify your Supabase project permissions and API key configuration.');
        } else if (response.status >= 500) {
          throw new Error(`🔧 Server Error (${response.status})\n\nThe Supabase Edge Function is experiencing issues. Please try again later.`);
        }
        
        throw new Error(`🎯 Strategy Analysis Failed (${response.status})\n\n${errorText}`);
      }

      const result = await response.json();
      console.log('[FRONTEND] 📊 Strategy analysis result:', {
        success: result.success,
        hasAnalysis: !!result.analysis,
        analysisLength: result.analysis?.length || 0,
        symbol: result.symbol
      });
      
      if (!result.success) {
        throw new Error(result.details || 'Failed to generate strategy analysis');
      }
      
      updateStepStatus('generate_strategy', 'completed');
      return result;
    } catch (error) {
      console.error('[FRONTEND] ❌ Generate strategy analysis error:', error);
      
      // Enhanced error handling for network issues
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const enhancedError = new Error(`🌐 Connection Failed

Unable to connect to the strategy analysis function. This could be due to:

1. 🔧 Supabase Configuration Issues:
   - Check your .env file for correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   - Ensure your Supabase project is active and accessible

2. 📡 Edge Function Deployment:
   - Verify that the generate-strategy-analysis function is deployed to your Supabase project
   - Check your Supabase dashboard for function deployment status

3. 🌐 Network Issues:
   - Check your internet connection
   - Try refreshing the page

Please verify your Supabase configuration and try again.`);
        updateStepStatus('generate_strategy', 'error', enhancedError.message);
        throw enhancedError;
      }
      
      updateStepStatus('generate_strategy', 'error', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  };

  // Main orchestration function with improved error handling
  const generateAnalysis = async (symbol: string): Promise<AnalysisResponse> => {
    console.log(`[FRONTEND] 🚀 Starting comprehensive analysis generation for ${symbol}`);
    
    try {
      // Step 0: Check for recent analysis with trading hours logic
      console.log(`[FRONTEND] 🔍 Step 0: Checking for recent analysis for ${symbol} with trading hours restriction`);
      updateStepStatus('check_cache', 'loading');
      
      const recentAnalysis = await checkForRecentAnalysis(symbol);
      
      if (recentAnalysis) {
        const tradingInfo = getETInfo();
        console.log(`[FRONTEND] ✅ Found recent analysis for current ${tradingInfo.currentPeriodType} period, using existing data`);
        updateStepStatus('check_cache', 'completed');
        
        // Mark all other steps as completed since we're using cached data
        updateStepStatus('fetch_historical', 'completed');
        updateStepStatus('generate_trend', 'completed');
        updateStepStatus('generate_sr', 'completed');
        updateStepStatus('generate_strategy', 'completed');
        updateStepStatus('saving', 'completed');
        
        return {
          success: true,
          analysis: recentAnalysis.analysis_text,
          symbol: recentAnalysis.symbol,
          analysisType: recentAnalysis.analysis_type,
          existingAnalysisId: recentAnalysis.id
        };
      }
      
      const tradingInfo = getETInfo();
      console.log(`[FRONTEND] 📭 No analysis found for current ${tradingInfo.currentPeriodType} period, proceeding with new generation`);
      updateStepStatus('check_cache', 'completed');
      
      // Step 1: Fetch historical data
      const historicalResult = await fetchHistoricalData(symbol);
      
      // Step 2: Generate trend analysis
      const trendResult = await generateTrendAnalysis(symbol, historicalResult.historicalDataId!);
      
      // Step 3: Generate S&R analysis with enhanced error handling
      let srResult: SRAnalysisResponse;
      try {
        srResult = await generateSRAnalysis(symbol, historicalResult.historicalDataId!);
      } catch (srError) {
        console.error('[FRONTEND] ❌ S&R analysis failed, using fallback:', srError);
        
        // Create a more informative fallback message
        let fallbackMessage = 'Support & Resistance analysis could not be completed';
        if (srError instanceof Error) {
          if (srError.message.includes('not found') || srError.message.includes('deployed')) {
            fallbackMessage += ' because the S&R analysis function is not deployed to your Supabase project. Please deploy the generate-sr-analysis Edge Function.';
          } else if (srError.message.includes('timeout')) {
            fallbackMessage += ' due to a timeout. Please try again later.';
          } else if (srError.message.includes('connect')) {
            fallbackMessage += ' due to connection issues. Please check your internet connection and try again.';
          } else {
            fallbackMessage += ` due to: ${srError.message}`;
          }
        } else {
          fallbackMessage += ' due to technical difficulties. Please try again later.';
        }
        
        srResult = {
          success: true,
          analysis: `\n\n## Support & Resistance Analysis\n\n*${fallbackMessage}*`,
          symbol: symbol,
          analysisType: 'support_resistance'
        };
        updateStepStatus('generate_sr', 'completed');
      }
      
      // Step 4: Generate strategy analysis (with error handling)
      let strategyResult: StrategyAnalysisResponse;
      try {
        strategyResult = await generateStrategyAnalysis(symbol, trendResult.analysis!, srResult.analysis!);
      } catch (strategyError) {
        console.error('[FRONTEND] ❌ Strategy analysis failed, using fallback:', strategyError);
        strategyResult = {
          success: true,
          analysis: `\n\n## Trading Strategies\n\n*Trading strategy analysis could not be completed due to ${strategyError instanceof Error ? strategyError.message : 'technical difficulties'}. Please try again later.*`,
          symbol: symbol,
          analysisType: 'strategy'
        };
        updateStepStatus('generate_strategy', 'completed');
      }
      
      // Combine all analyses with separators and headings
      const combinedAnalysis = [
        trendResult.analysis,
        '---', // Separator between Trend and S&R
        srResult.analysis,
        '---', // Separator between S&R and Strategy
        '## Trading Strategies', // Heading before Strategy Analysis
        strategyResult.analysis
      ].join('\n\n');
      
      console.log('[FRONTEND] ✅ Comprehensive analysis generation completed successfully');
      console.log('[FRONTEND] 📊 Final combined analysis length:', combinedAnalysis.length);
      
      return {
        success: true,
        analysis: combinedAnalysis,
        symbol: symbol,
        analysisType: 'trend_and_sr'
      };
      
    } catch (error) {
      console.error('[FRONTEND] ❌ Comprehensive analysis generation failed:', error);
      throw error;
    }
  };

  const saveAnalysis = async (
    symbol: string, 
    analysisText: string
  ): Promise<SaveAnalysisResponse> => {
    console.log(`[FRONTEND] 💾 Starting save analysis for ${symbol}`);
    updateStepStatus('saving', 'loading');
    
    try {
      const { supabaseUrl, supabaseAnonKey } = validateEnvironment();
      const functionUrl = `${supabaseUrl}/functions/v1/save-analysis`;
      
      console.log('[FRONTEND] 📤 Calling save-analysis function:', functionUrl);
      
      const requestPayload = {
        symbol,
        analysisType: 'trend_and_sr',
        analysisText,
      };
      
      console.log('[FRONTEND] 📝 Save request payload:', {
        symbol: requestPayload.symbol,
        analysisType: requestPayload.analysisType,
        analysisTextLength: requestPayload.analysisText.length
      });
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      console.log('[FRONTEND] 📡 Save response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[FRONTEND] ❌ Save function error response:', errorText);
        
        if (response.status === 404) {
          throw new Error('📡 Edge Function Not Found\n\nThe save-analysis function is not deployed to your Supabase project. Please ensure all Edge Functions are properly deployed.');
        } else if (response.status === 401) {
          throw new Error('🔐 Authentication Failed\n\nYour Supabase API key appears to be invalid. Please check your VITE_SUPABASE_ANON_KEY in the .env file.');
        } else if (response.status === 403) {
          throw new Error('🚫 Access Forbidden\n\nPlease verify your Supabase project permissions and API key configuration.');
        } else {
          throw new Error(`💾 Save Failed (${response.status})\n\n${errorText}`);
        }
      }

      const result = await response.json();
      console.log('[FRONTEND] 📊 Save function result:', {
        success: result.success,
        id: result.id,
        message: result.message
      });
      
      if (!result.success) {
        console.error('[FRONTEND] ❌ Save analysis failed:', result.message);
        throw new Error(result.message || 'Failed to save analysis');
      }
      
      console.log('[FRONTEND] ✅ Analysis saved successfully');
      updateStepStatus('saving', 'completed');
      return result;
    } catch (error) {
      console.error('[FRONTEND] ❌ Save analysis error:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const enhancedError = new Error(`🌐 Connection Failed

Unable to connect to the save analysis function. This could be due to:

1. 🔧 Supabase Configuration Issues:
   - Check your .env file for correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   - Ensure your Supabase project is active and accessible

2. 📡 Edge Function Deployment:
   - Verify that the save-analysis function is deployed to your Supabase project
   - Check your Supabase dashboard for function deployment status

3. 🌐 Network Issues:
   - Check your internet connection
   - Try refreshing the page

Please verify your Supabase configuration and try again.`);
        updateStepStatus('saving', 'error', enhancedError.message);
        throw enhancedError;
      }
      
      updateStepStatus('saving', 'error', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  };

  return {
    isAnalyzing,
    setIsAnalyzing,
    loadingSteps,
    updateStepStatus,
    resetSteps,
    checkForRecentAnalysis,
    generateAnalysis,
    saveAnalysis,
  };
};