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
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          
          <input
            type="text"
            value={symbol}
            onChange={handleInputChange}
            placeholder="Enter Stock Symbol"
            className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              error ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
            }`}
            disabled={isLoading}
            maxLength={5}
          />
          
          <button
            type="button"
            onClick={handleAnalyzeClick}
            disabled={isLoading || !symbol.trim()}
            className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </div>
            ) : (
              'Analyze'
            )}
          </button>
        </div>
        
        {error && (
          <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
        )}
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-2">Popular symbols:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {POPULAR_SYMBOLS.map((popularSymbol) => (
            <button
              key={popularSymbol}
              onClick={() => handlePopularSymbolClick(popularSymbol)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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