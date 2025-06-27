import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { LoadingStep } from '../types/analysis';

interface LoadingStepsProps {
  steps: LoadingStep[];
  onRetry?: () => void;
}

export const LoadingSteps: React.FC<LoadingStepsProps> = ({ steps, onRetry }) => {
  const hasErrors = steps.some(step => step.status === 'error');

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
        Analyzing Stock Data
      </h3>
      
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              {step.status === 'completed' && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {step.status === 'loading' && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              )}
              {step.status === 'error' && (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              {step.status === 'pending' && (
                <Clock className="h-5 w-5 text-gray-300" />
              )}
            </div>
            
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                step.status === 'completed' ? 'text-green-700' :
                step.status === 'loading' ? 'text-blue-700' :
                step.status === 'error' ? 'text-red-700' :
                'text-gray-500'
              }`}>
                {step.label}
              </p>
              
              {step.error && (
                <p className="text-xs text-red-600 mt-1">{step.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {hasErrors && (
        <div className="mt-6 text-center">
          <button
            onClick={onRetry || (() => window.location.reload())}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};