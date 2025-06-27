export type AnalysisType = 'historical' | 'support_resistance' | 'combined' | 'trend_and_sr';

export interface LoadingStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  error?: string;
}

export interface Analysis {
  id: string;
  symbol: string;
  analysis_type: AnalysisType;
  analysis_text: string;
  created_at: string;
  updated_at?: string;
}

export interface AnalysisResponse {
  success: boolean;
  analysis?: string;
  symbol?: string;
  analysisType?: AnalysisType;
  details?: string;
  existingAnalysisId?: string; // Added for cached analysis
}

export interface SaveAnalysisResponse {
  success: boolean;
  id?: string;
  message?: string;
  data?: {
    id: string;
    symbol: string;
    analysisType: AnalysisType;
    createdAt: string;
  };
}

export interface HistoricalDataResponse {
  success: boolean;
  historicalDataId?: string;
  symbol?: string;
  dataStructure?: {
    weekBarsCount: number;
    dayBarsCount: number;
    thirtyMinBarsCount: number;
  };
  error?: string;
  details?: string;
}

export interface TrendAnalysisResponse {
  success: boolean;
  analysis?: string;
  symbol?: string;
  analysisType?: string;
  error?: string;
  details?: string;
}

export interface SRAnalysisResponse {
  success: boolean;
  analysis?: string;
  symbol?: string;
  analysisType?: string;
  error?: string;
  details?: string;
}

export interface StrategyAnalysisResponse {
  success: boolean;
  analysis?: string;
  symbol?: string;
  analysisType?: string;
  error?: string;
  details?: string;
}