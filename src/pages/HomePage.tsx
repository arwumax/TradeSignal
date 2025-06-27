import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StockSearch } from '../components/StockSearch';
import { LoadingSteps } from '../components/LoadingSteps';
import { History, TrendingUp, Clock, Target, Brain, Shield, BarChart3, Zap } from 'lucide-react';
import { useAnalysis } from '../hooks/useAnalysis';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    isAnalyzing,
    setIsAnalyzing,
    loadingSteps,
    updateStepStatus,
    resetSteps,
    generateAnalysis,
    saveAnalysis,
  } = useAnalysis();

  const handleSearch = async (symbol: string) => {
    console.log(`[HOMEPAGE] 🎯 Starting analysis for symbol: ${symbol}`);
    setIsAnalyzing(true);
    resetSteps();
    
    try {
      console.log('[HOMEPAGE] 📈 Step 1: Generating analysis...');
      const analysisResult = await generateAnalysis(symbol);
      console.log('[HOMEPAGE] ✅ Step 1 complete: Analysis generated');
      
      // Check if we got an existing analysis
      if (analysisResult.existingAnalysisId) {
        console.log('[HOMEPAGE] 🔄 Using existing analysis, navigating directly...');
        setTimeout(() => {
          navigate(`/analysis/${symbol}/${analysisResult.existingAnalysisId}`);
        }, 1000);
        return;
      }
      
      console.log('[HOMEPAGE] 💾 Step 2: Saving analysis...');
      const saveResult = await saveAnalysis(symbol, analysisResult.analysis!);
      console.log('[HOMEPAGE] ✅ Step 2 complete: Analysis saved with ID:', saveResult.id);
      
      // Navigate to results page with symbol in URL
      console.log('[HOMEPAGE] 🚀 Navigating to analysis page...');
      setTimeout(() => {
        navigate(`/analysis/${symbol}/${saveResult.id}`);
      }, 1000);

    } catch (error) {
      console.error('[HOMEPAGE] ❌ Analysis failed:', error);
      console.error('[HOMEPAGE] ❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Update the current step with error
      const currentStep = loadingSteps.find(step => step.status === 'loading');
      if (currentStep) {
        console.log(`[HOMEPAGE] 🔄 Updating step ${currentStep.id} with error`);
        updateStepStatus(currentStep.id, 'error', errorMessage);
      } else {
        // If no step is currently loading, mark the first pending step as error
        const firstPendingStep = loadingSteps.find(step => step.status === 'pending');
        if (firstPendingStep) {
          console.log(`[HOMEPAGE] 🔄 Updating first pending step ${firstPendingStep.id} with error`);
          updateStepStatus(firstPendingStep.id, 'error', errorMessage);
        }
      }
      
      setIsAnalyzing(false);
    }
  };

  const handleRetry = () => {
    console.log('[HOMEPAGE] 🔄 Retrying analysis...');
    setIsAnalyzing(false);
    resetSteps();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with History Link */}
      <div className="absolute top-4 right-4 z-20">
        <Link
          to="/history"
          className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
        >
          <History className="h-4 w-4 mr-2" />
          View History
        </Link>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          {!isAnalyzing ? (
            <div className="w-full max-w-4xl">
              {/* Enhanced Hero Content */}
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-6">
                  <h1 className="text-5xl font-light text-gray-900">AI-Powered Stock Analysis</h1>
                </div>
                <p className="text-xl text-gray-600 mb-4">
                  Transform complex market data into actionable trading insights with advanced AI
                </p>
                <p className="text-lg text-gray-500">
                  Get comprehensive technical analysis, support & resistance levels, and trading strategies in seconds
                </p>
              </div>

              {/* Stock Search Component */}
              <StockSearch onSearch={handleSearch} />
            </div>
          ) : (
            <LoadingSteps steps={loadingSteps} onRetry={handleRetry} />
          )}
        </div>
      </div>

      {/* Content Sections - Only show when not analyzing */}
      {!isAnalyzing && (
        <>
          {/* Section 1: The Problem */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">The Challenge of Technical Analysis</h2>
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <Clock className="h-8 w-8 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Time-Consuming Process</h3>
                    <p className="text-gray-600">
                      Manual technical analysis requires hours of chart study, indicator calculation, and pattern recognition across multiple timeframes.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <Brain className="h-8 w-8 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Complex Expertise Required</h3>
                    <p className="text-gray-600">
                      Understanding market trends, support/resistance levels, and technical indicators demands years of experience and deep market knowledge.
                    </p>
                  </div>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Traditional analysis is prone to human error, emotional bias, and information overload. 
                  Traders often miss critical signals or make decisions based on incomplete data, leading to suboptimal trading outcomes.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Why it Matters */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Accurate Analysis is Crucial</h2>
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <Target className="h-8 w-8 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Better Entry & Exit Points</h3>
                    <p className="text-gray-600">
                      Precise analysis helps identify optimal timing for trades, maximizing profits and minimizing losses.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <Shield className="h-8 w-8 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Risk Management</h3>
                    <p className="text-gray-600">
                      Understanding support and resistance levels enables better stop-loss placement and position sizing.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <BarChart3 className="h-8 w-8 text-purple-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Consistent Performance</h3>
                    <p className="text-gray-600">
                      Objective analysis removes emotional decision-making, leading to more consistent trading results.
                    </p>
                  </div>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  In today's fast-moving markets, the difference between profit and loss often comes down to the quality and speed of your analysis. 
                  Missing key signals or misinterpreting market conditions can result in significant financial losses and missed opportunities.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Our Solution */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Introducing AI-Powered Stock Analysis</h2>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg mb-8">
                  <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your AI Trading Assistant</h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Our advanced AI system processes vast amounts of market data in seconds, delivering comprehensive technical analysis 
                    that would take hours to complete manually. Get objective, data-driven insights without the emotional bias that 
                    often clouds human judgment.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-left">
                    <h4 className="text-xl font-semibold text-gray-800 mb-3">Instant Analysis</h4>
                    <p className="text-gray-600">
                      What takes professional analysts hours to complete, our AI delivers in under a minute with greater accuracy and consistency.
                    </p>
                  </div>
                  <div className="text-left">
                    <h4 className="text-xl font-semibold text-gray-800 mb-3">Objective Insights</h4>
                    <p className="text-gray-600">
                      Remove emotional bias and human error from your trading decisions with purely data-driven analysis and recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: How It Works */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works: Your AI Trading Assistant</h2>
                <div className="space-y-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-6">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">Fetch Comprehensive Historical Data</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Our system gathers extensive historical stock data across multiple timeframes (weekly, daily, 30-minute) 
                        including OHLCV data and technical indicators like EMA, RSI, MACD, and ADX for thorough analysis.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-6">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">AI-Driven Trend Analysis</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Advanced AI algorithms analyze market trends across different timeframes, identifying bullish, bearish, 
                        or neutral patterns while considering momentum indicators and moving average relationships.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-6">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">Support & Resistance Identification</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Our AI pinpoints critical support and resistance levels by analyzing price action, volume patterns, 
                        and historical turning points to identify key zones where price is likely to react.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-6">
                      4
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">Actionable Strategy Generation</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Based on the trend and support/resistance analysis, our AI generates specific trading strategies 
                        with entry points, profit targets, stop-loss levels, and risk-reward ratios tailored to current market conditions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Key Benefits */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-12">Unlock Smarter Trading Decisions</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Save Hours of Analysis</h3>
                    <p className="text-gray-600">
                      Get comprehensive analysis in under a minute instead of spending hours on manual chart study.
                    </p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <Brain className="h-8 w-8 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Objective Insights</h3>
                    <p className="text-gray-600">
                      Remove emotional bias and human error with purely data-driven analysis and recommendations.
                    </p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <Shield className="h-8 w-8 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Better Risk Management</h3>
                    <p className="text-gray-600">
                      Precise support/resistance levels help you place better stop-losses and manage position sizes.
                    </p>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Comprehensive Reports</h3>
                    <p className="text-gray-600">
                      Get detailed analysis covering trends, key levels, and specific trading strategies in one report.
                    </p>
                  </div>
                  <div className="bg-indigo-50 p-6 rounded-lg">
                    <Target className="h-8 w-8 text-indigo-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Actionable Strategies</h3>
                    <p className="text-gray-600">
                      Receive specific entry points, targets, and stop-losses rather than vague market commentary.
                    </p>
                  </div>
                  <div className="bg-teal-50 p-6 rounded-lg">
                    <Zap className="h-8 w-8 text-teal-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Easy to Use</h3>
                    <p className="text-gray-600">
                      Simply enter a stock symbol and get professional-grade analysis without any technical expertise required.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center text-white">
                <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Trading?</h2>
                <p className="text-xl mb-8 opacity-90">
                  Join thousands of traders who are already using AI-powered analysis to make smarter, more profitable trading decisions. 
                  Get started in seconds with any stock symbol.
                </p>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
                  <p className="text-lg mb-4">
                    Enter any stock symbol in the search bar above to get your first comprehensive AI analysis
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm opacity-75">
                    <span>✓ No registration required</span>
                    <span>✓ Instant results</span>
                    <span>✓ Professional-grade analysis</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Bolt.new logo in bottom right corner */}
      <a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 w-16 h-16 hover:scale-105 transition-transform duration-200 z-10"
      >
        <img
          src="/black_circle_360x360.png"
          alt="Powered by Bolt.new"
          className="w-full h-full rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
        />
      </a>
    </div>
  );
};