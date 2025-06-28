import React, { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { validateStockSymbol, formatStockSymbol, POPULAR_SYMBOLS } from '../data/validStockSymbols';

interface StockSearchProps {
  onSearch: (symbol: string) => void;
  isLoading?: boolean;
}

export const StockSearch: React.FC<StockSearchProps> = ({ onSearch, isLoading = false }) => {
  const [symbol, setSymbol] = useState('');
  const [error, setError] = useState('');

  const validateAndSearch = (symbolToValidate: string) => {
    if (!symbolToValidate.trim()) {
      setError('Please enter a stock symbol');
      return false;
    }

    const formattedSymbol = formatStockSymbol(symbolToValidate);
    
    if (!validateStockSymbol(formattedSymbol)) {
      setError('Incorrect Stock Symbol');
      return false;
    }

    setError('');
    onSearch(formattedSymbol);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndSearch(symbol);
  };

  const handleAnalyzeClick = () => {
    validateAndSearch(symbol);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSymbol(value);
    
    if (error && value.trim()) {
      setError('');
    }
  };

  const handlePopularSymbolClick = (popularSymbol: string) => {
    if (isLoading) return;
    setSymbol(popularSymbol);
    setError('');
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          
          <input
            type="text"
            value={symbol}
            onChange={handleInputChange}
            placeholder="Enter Stock Symbol"
            className={`w-full pl-10 sm:pl-12 pr-20 sm:pr-32 py-2.5 sm:py-3 text-base sm:text-lg border-0 rounded-search focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-fast ${
              error ? 'ring-2 ring-red-300' : ''
            }`}
            disabled={isLoading}
            maxLength={5}
            style={{ height: '48px' }}
          />
          
          <button
            type="button"
            onClick={handleAnalyzeClick}
            disabled={isLoading || !symbol.trim()}
            className="absolute right-1 top-1 bottom-1 px-3 sm:px-6 bg-brand text-white rounded-search hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-fast font-heading font-semibold text-sm sm:text-base"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                <span className="hidden sm:inline">Analyzing...</span>
                <span className="sm:hidden">...</span>
              </div>
            ) : (
              <>
                <span className="hidden sm:inline">Analyze</span>
                <span className="sm:hidden">Go</span>
              </>
            )}
          </button>
        </div>
        
        {error && (
          <p className="mt-3 text-sm text-red-600 text-center font-body">{error}</p>
        )}
      </form>

      <div className="mt-6 sm:mt-8 text-center">
        <p className="text-sm text-text-body mb-3 font-body opacity-75">Popular symbols:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {POPULAR_SYMBOLS.map((popularSymbol) => (
            <button
              key={popularSymbol}
              onClick={() => handlePopularSymbolClick(popularSymbol)}
              className="px-2.5 sm:px-3 py-1 text-xs sm:text-sm bg-elevated text-text-body rounded-full hover:bg-gray-100 transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed border border-line font-body"
              disabled={isLoading}
            >
              {popularSymbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};