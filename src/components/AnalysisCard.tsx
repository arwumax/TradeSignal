import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, TrendingUp } from 'lucide-react';
import { Analysis } from '../types/analysis';
import { formatRelativeDate, formatDateForMeta } from '../utils/dateUtils';
import { getAnalysisPreview, extractOverallTrend } from '../utils/analysisUtils';

interface AnalysisCardProps {
  analysis: Analysis;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis }) => {
  // Extract trend from analysis text
  const trend = extractOverallTrend(analysis.analysis_text);
  const analysisDate = formatDateForMeta(analysis.created_at);
  
  // Create the new title format: [Stock] showing [Bullish/Neutral/Bearish] Trend on [Date]
  const cardTitle = `${analysis.symbol} showing ${trend} Trend on ${analysisDate}`;

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <Link to={`/analysis/${analysis.symbol}/${analysis.id}`} className="block p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800">
                {cardTitle}
              </h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                {formatRelativeDate(analysis.created_at)}
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-700 leading-relaxed">
          {getAnalysisPreview(analysis.analysis_text)}
        </p>

        <div className="mt-4 text-sm text-blue-600 font-medium">
          Read full analysis →
        </div>
      </Link>
    </div>
  );
};