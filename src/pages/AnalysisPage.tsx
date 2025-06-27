import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabase';
import { Analysis } from '../types/analysis';
import { formatDate, formatDateForMeta } from '../utils/dateUtils';
import { getAnalysisTypeLabel, extractOverallTrend } from '../utils/analysisUtils';

export const AnalysisPage: React.FC = () => {
  const { id, symbol } = useParams<{ id: string; symbol: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) {
        setError('No analysis ID provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error: supabaseError } = await supabase
          .from('stock_analyses')
          .select('*')
          .eq('id', id)
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        setAnalysis(data);
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError('Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  // Update meta tags and page title when analysis data is loaded
  useEffect(() => {
    if (analysis) {
      const analysisDate = formatDateForMeta(analysis.created_at);
      const trend = extractOverallTrend(analysis.analysis_text);
      
      // Create the new title format: [Stock] showing [Bullish/Neutral/Bearish] Trend on [Date]
      const pageTitle = `${analysis.symbol} showing ${trend} Trend on ${analysisDate}`;
      const metaDescription = `Get real-time trend, support-and-resistance insights and AI-driven trading setups for ${analysis.symbol} as of ${analysisDate}. Our latest reasoning model highlights optimal buy-and-sell windows so you can trade with confidence.`;

      // Update document title
      document.title = pageTitle;

      // Update or create meta description
      let metaDescriptionTag = document.querySelector('meta[name="description"]');
      if (metaDescriptionTag) {
        metaDescriptionTag.setAttribute('content', metaDescription);
      } else {
        metaDescriptionTag = document.createElement('meta');
        metaDescriptionTag.setAttribute('name', 'description');
        metaDescriptionTag.setAttribute('content', metaDescription);
        document.head.appendChild(metaDescriptionTag);
      }
    }

    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'Stock Analysis Dashboard - First Flow Implementation';
      const metaDescriptionTag = document.querySelector('meta[name="description"]');
      if (metaDescriptionTag) {
        metaDescriptionTag.remove();
      }
    };
  }, [analysis]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested analysis could not be found.'}</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Verify that the symbol in URL matches the analysis symbol
  if (symbol && symbol.toUpperCase() !== analysis.symbol.toUpperCase()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">URL Mismatch</h2>
          <p className="text-gray-600 mb-6">The symbol in the URL does not match the analysis data.</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Extract trend and date for the page header
  const trend = extractOverallTrend(analysis.analysis_text);
  const analysisDate = formatDateForMeta(analysis.created_at);
  const pageHeaderTitle = `${analysis.symbol} showing ${trend} Trend on ${analysisDate}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                New Analysis
              </Link>
              
              <Link
                to="/history"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <History className="h-4 w-4 mr-2" />
                View History
              </Link>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(analysis.created_at)}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center mb-6">
              <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{pageHeaderTitle}</h1>
                <p className="text-gray-600">
                  {getAnalysisTypeLabel(analysis.analysis_type)}
                </p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              {console.log("Analysis Text being rendered:", analysis.analysis_text)}
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-900 mb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-6">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-medium text-gray-700 mb-2 mt-4">{children}</h3>,
                  p: ({ children }) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-gray-700">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                  hr: () => <hr className="my-8 border-t-2 border-gray-200" />,
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-4">
                      <table className="min-w-full divide-y divide-gray-200">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                  tbody: ({ children }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>,
                  tr: ({ children }) => <tr>{children}</tr>,
                  th: ({ children }) => (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{children}</td>
                  ),
                }}
              >
                {analysis.analysis_text}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};