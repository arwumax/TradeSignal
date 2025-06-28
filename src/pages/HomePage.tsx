import React, { useEffect, useState } from 'react';
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

  // State for scroll animations
  const [visibleCards, setVisibleCards] = useState<boolean[]>([false, false, false]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cardIndex = parseInt(entry.target.getAttribute('data-card-index') || '0');
          setVisibleCards(prev => {
            const newVisible = [...prev];
            newVisible[cardIndex] = true;
            return newVisible;
          });
        }
      });
    }, observerOptions);

    // Observe all info cards
    const cards = document.querySelectorAll('[data-card-index]');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [isAnalyzing]);

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
    <div className="min-h-screen bg-main">
      {/* Header with Logo and History Link */}
      <div className="relative z-20 flex items-center justify-between px-responsive py-4">
        <div className="flex items-center">
          <img 
            src="/未命名設計 (5).png" 
            alt="TradeSignal Logo" 
            className="h-8 w-auto"
          />
        </div>
        
        <Link
          to="/history"
          className="inline-flex items-center px-4 py-2 bg-elevated text-text-body rounded-lg shadow-card hover:shadow-card-hover transition-all duration-fast border border-line"
        >
          <History className="h-4 w-4 mr-2" />
          View History
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative min-h-hero flex flex-col items-center justify-center px-responsive py-16">
        {/* Background Gradient */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))'
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl text-center">
          {!isAnalyzing ? (
            <>
              {/* Tagline and Value Proposition */}
              <div className="mb-12">
                <h1 className="text-hero font-heading font-bold text-text-main mb-4 max-w-tagline mx-auto">
                  AI-Powered Stock Analysis
                </h1>
                <p className="text-xl text-text-body mb-4 font-body">
                  Transform complex market data into actionable trading insights with AI
                </p>
                <p className="text-lg text-text-body opacity-80 font-body">
                  Get comprehensive technical analysis, support & resistance levels, and trading strategies in seconds
                </p>
              </div>

              {/* Enhanced Stock Search Component */}
              <div className="w-full max-w-search mx-auto">
                <div className="relative">
                  <div className="bg-elevated rounded-search shadow-search p-2">
                    <StockSearch onSearch={handleSearch} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <LoadingSteps steps={loadingSteps} onRetry={handleRetry} />
          )}
        </div>
      </div>

      {/* Info Cards Section - Only show when not analyzing */}
      {!isAnalyzing && (
        <section className="py-16 px-responsive">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-heading font-bold text-text-main mb-4">
                Why Choose AI-Powered Analysis?
              </h2>
              <div className="w-24 h-px bg-line mx-auto"></div>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Speed & Efficiency */}
              <div 
                data-card-index="0"
                className={`bg-elevated rounded-card shadow-card p-6 hover:shadow-card-hover hover:-translate-y-1 hover:scale-[1.02] transition-all duration-fast transform ${
                  visibleCards[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
                style={{ transitionDelay: '0ms' }}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full mb-4 mx-auto">
                  <Clock className="h-6 w-6 text-brand" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-text-main mb-3 text-center">
                  Lightning Fast Analysis
                </h3>
                <p className="text-text-body font-body text-center leading-relaxed">
                  Get comprehensive technical analysis in under a minute instead of spending hours on manual chart study and indicator calculations.
                </p>
              </div>

              {/* Card 2: Objective Insights */}
              <div 
                data-card-index="1"
                className={`bg-elevated rounded-card shadow-card p-6 hover:shadow-card-hover hover:-translate-y-1 hover:scale-[1.02] transition-all duration-fast transform ${
                  visibleCards[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
                style={{ transitionDelay: '100ms' }}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-green-50 rounded-full mb-4 mx-auto">
                  <Brain className="h-6 w-6 text-brand" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-text-main mb-3 text-center">
                  Objective Insights
                </h3>
                <p className="text-text-body font-body text-center leading-relaxed">
                  Remove emotional bias and human error with purely data-driven analysis and AI-powered recommendations based on market patterns.
                </p>
              </div>

              {/* Card 3: Professional Grade */}
              <div 
                data-card-index="2"
                className={`bg-elevated rounded-card shadow-card p-6 hover:shadow-card-hover hover:-translate-y-1 hover:scale-[1.02] transition-all duration-fast transform ${
                  visibleCards[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
                style={{ transitionDelay: '200ms' }}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-purple-50 rounded-full mb-4 mx-auto">
                  <Target className="h-6 w-6 text-brand" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-text-main mb-3 text-center">
                  Professional Grade
                </h3>
                <p className="text-text-body font-body text-center leading-relaxed">
                  Receive institutional-quality analysis with precise entry points, targets, and risk management strategies tailored to current market conditions.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action Section - Only show when not analyzing */}
      {!isAnalyzing && (
        <section className="py-16 px-responsive">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-elevated rounded-card shadow-card p-8 border border-line">
              <h2 className="text-2xl font-heading font-bold text-text-main mb-4">
                Ready to Transform Your Trading?
              </h2>
              <p className="text-lg text-text-body font-body mb-6 leading-relaxed">
                Join thousands of traders who are already using AI-powered analysis to make smarter, more profitable trading decisions. 
                Get started in seconds with any stock symbol.
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-text-body opacity-75">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  No registration required
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Instant results
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Professional-grade analysis
                </span>
              </div>
            </div>
          </div>
        </section>
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