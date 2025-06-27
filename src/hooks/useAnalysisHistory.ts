import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Analysis } from '../types/analysis';

export const useAnalysisHistory = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 20;

  const fetchAnalyses = async (page: number = 1) => {
    try {
      setLoading(true);
      
      // Build the query with filters
      let query = supabase
        .from('stock_analyses')
        .select('*', { count: 'exact' });

      // Apply search filter
      if (searchTerm) {
        query = query.ilike('symbol', `%${searchTerm}%`);
      }

      // Apply type filter
      if (selectedType !== 'all') {
        query = query.eq('analysis_type', selectedType);
      }

      // Apply sorting
      query = query.order('created_at', { ascending: sortBy === 'oldest' });

      // Apply pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setAnalyses(data || []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      setAnalyses([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchAnalyses(page);
    }
  };

  const refetch = () => {
    fetchAnalyses(currentPage);
  };

  // Fetch analyses when component mounts or filters change
  useEffect(() => {
    // Reset to page 1 when filters change
    fetchAnalyses(1);
  }, [searchTerm, selectedType, sortBy]);

  return {
    analyses,
    loading,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    sortBy,
    setSortBy,
    currentPage,
    totalPages,
    totalCount,
    itemsPerPage,
    goToPage,
    refetch,
  };
};