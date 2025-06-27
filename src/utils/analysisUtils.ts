export const getAnalysisPreview = (text: string): string => {
  // Helper function to identify if a paragraph is likely a heading
  const isHeading = (paragraph: string): boolean => {
    const trimmed = paragraph.trim();
    
    // Check if it starts with markdown heading syntax
    if (trimmed.startsWith('#')) {
      return true;
    }
    
    // Check if it matches known heading patterns and is short
    const headingPatterns = [
      /^Long-Term Trend/i,
      /^Mid-Term Trend/i,
      /^Short-Term Trend/i,
      /^Weekly/i,
      /^Daily/i,
      /^30-Minute/i,
      /^\d+\.\s*Long-Term/i,
      /^\d+\.\s*Mid-Term/i,
      /^\d+\.\s*Short-Term/i
    ];
    
    const isShort = trimmed.length < 100;
    const matchesPattern = headingPatterns.some(pattern => pattern.test(trimmed));
    
    return isShort && matchesPattern;
  };

  // Helper function to clean markdown formatting from text
  const cleanMarkdown = (text: string): string => {
    return text
      // Remove markdown bold syntax (**text**)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove markdown italic syntax (*text*)
      .replace(/\*(.*?)\*/g, '$1')
      // Remove markdown heading syntax
      .replace(/^#+\s*/, '')
      // Clean up any extra whitespace
      .trim();
  };

  // Extract the "Trend Analysis" section (content before first "---" separator)
  const trendSectionMatch = text.split(/\n\n---/)[0];
  
  if (trendSectionMatch && trendSectionMatch.length > 100) {
    // Split into paragraphs and filter out empty ones
    const paragraphs = trendSectionMatch
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    // Try to find content paragraphs at indices 1, 3, 5 (2nd, 4th, 6th paragraphs)
    const candidateIndices = [1, 3, 5];
    
    for (const index of candidateIndices) {
      if (index < paragraphs.length) {
        const candidate = paragraphs[index];
        
        // Check if this paragraph is not a heading
        if (!isHeading(candidate)) {
          // Clean the paragraph by removing markdown formatting
          const cleaned = cleanMarkdown(candidate);
          
          // Return truncated version if it's long enough
          if (cleaned.length > 50) {
            return cleaned.length > 150 ? cleaned.substring(0, 150) + '...' : cleaned;
          }
        }
      }
    }
  }
  
  // Fallback to existing logic if no suitable trend analysis paragraph is found
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const preview = lines.find(line => 
    line.includes('Long-Term') || 
    line.includes('Mid-Term') || 
    line.includes('trend') ||
    line.length > 50
  ) || lines[0] || '';
  
  // Clean markdown formatting from fallback preview as well
  const cleanedPreview = cleanMarkdown(preview);
  return cleanedPreview.length > 150 ? cleanedPreview.substring(0, 150) + '...' : cleanedPreview;
};

export const getAnalysisTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    'historical': 'Historical Analysis',
    'support_resistance': 'Support & Resistance',
    'combined': 'Combined Analysis',
    'trend_and_sr': 'Trend & Support/Resistance'
  };
  
  return typeMap[type] || type.replace('_', ' ').toUpperCase();
};

export const extractOverallTrend = (analysisText: string): 'Bullish' | 'Bearish' | 'Neutral' => {
  const text = analysisText.toLowerCase();
  
  // Define keywords for each trend type
  const bullishKeywords = [
    'bullish', 'uptrend', 'upward trend', 'rising trend', 'positive momentum',
    'strong upside', 'buy signal', 'long position', 'upward momentum',
    'bullish bias', 'upward direction', 'positive outlook', 'strong rally',
    'bullish breakout', 'upward trajectory', 'buying opportunity'
  ];
  
  const bearishKeywords = [
    'bearish', 'downtrend', 'downward trend', 'declining trend', 'negative momentum',
    'strong downside', 'sell signal', 'short position', 'downward momentum',
    'bearish bias', 'downward direction', 'negative outlook', 'strong decline',
    'bearish breakdown', 'downward trajectory', 'selling pressure'
  ];
  
  const neutralKeywords = [
    'sideways', 'consolidation', 'range-bound', 'neutral', 'mixed signals',
    'uncertain direction', 'choppy', 'indecisive', 'flat trend',
    'no clear direction', 'balanced', 'wait and see'
  ];
  
  // Count occurrences of each trend type
  let bullishCount = 0;
  let bearishCount = 0;
  let neutralCount = 0;
  
  bullishKeywords.forEach(keyword => {
    const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
    bullishCount += matches;
  });
  
  bearishKeywords.forEach(keyword => {
    const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
    bearishCount += matches;
  });
  
  neutralKeywords.forEach(keyword => {
    const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
    neutralCount += matches;
  });
  
  // Look for specific trend analysis sections
  const trendSectionMatch = text.match(/(?:trend analysis|overall trend|market trend)[:\s]*([^.]*)/i);
  if (trendSectionMatch) {
    const trendSection = trendSectionMatch[1].toLowerCase();
    if (trendSection.includes('bullish') || trendSection.includes('upward') || trendSection.includes('rising')) {
      bullishCount += 3; // Give extra weight to explicit trend analysis
    } else if (trendSection.includes('bearish') || trendSection.includes('downward') || trendSection.includes('declining')) {
      bearishCount += 3;
    } else if (trendSection.includes('neutral') || trendSection.includes('sideways') || trendSection.includes('consolidation')) {
      neutralCount += 3;
    }
  }
  
  // Determine the overall trend based on keyword counts
  if (bullishCount > bearishCount && bullishCount > neutralCount) {
    return 'Bullish';
  } else if (bearishCount > bullishCount && bearishCount > neutralCount) {
    return 'Bearish';
  } else {
    return 'Neutral';
  }
};