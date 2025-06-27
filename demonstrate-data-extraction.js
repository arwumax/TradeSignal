// demonstrate-data-extraction.js - Show how historical data is extracted and transformed

function demonstrateDataExtraction() {
  console.log("=== Historical Data Extraction for Support & Resistance API ===\n");

  // 1. This is what we receive from the historical data API
  const historicalDataFromAPI = {
    "success": true,
    "data": {
      "week": {
        "bars": [
          {
            "t": "2025-02-17T05:00:00",
            "o": 607.25,
            "h": 609.59,
            "l": 595.91,
            "c": 596.37,
            "v": 170721540,
            "indicators": {
              "+DI": 21.24,
              "-DI": 17.17,
              "ADX": 15.9,
              "ATR_14": 14.92,
              "EMA_100": 511.24,
              "EMA_20": 586.55,
              "EMA_200": 452.77,
              "EMA_50": 554.4,
              "MACD_line": 13.51,
              "RSI_14": 57.96,
              "Signal_line": 15.05
            }
          },
          {
            "t": "2025-02-24T05:00:00",
            "o": 598.44,
            "h": 599.45,
            "l": 578.98,
            "c": 590.65,
            "v": 315266033,
            "indicators": {
              "+DI": 19.21,
              "-DI": 23.42,
              "ADX": 15.47,
              "ATR_14": 15.32,
              "EMA_100": 512.81,
              "EMA_20": 586.94,
              "EMA_200": 454.14,
              "EMA_50": 555.82,
              "MACD_line": 12.26,
              "RSI_14": 55.03,
              "Signal_line": 14.49
            }
          }
        ]
      },
      "day": {
        "bars": [
          {
            "t": "2025-02-20T05:00:00",
            "o": 607.25,
            "h": 609.59,
            "l": 595.91,
            "c": 596.37,
            "v": 170721540,
            "indicators": {
              "EMA_20": 586.55,
              "EMA_50": 554.4,
              "EMA_100": 511.24,
              "EMA_200": 452.77,
              "RSI_14": 57.96,
              "MACD_line": 13.51,
              "Signal_line": 15.05,
              "+DI": 21.24,
              "-DI": 17.17,
              "ADX": 15.9
            }
          },
          {
            "t": "2025-02-21T05:00:00",
            "o": 598.44,
            "h": 599.45,
            "l": 578.98,
            "c": 590.65,
            "v": 315266033,
            "indicators": {
              "EMA_20": 586.94,
              "EMA_50": 555.82,
              "EMA_100": 512.81,
              "EMA_200": 454.14,
              "RSI_14": 55.03,
              "MACD_line": 12.26,
              "Signal_line": 14.49,
              "+DI": 19.21,
              "-DI": 23.42,
              "ADX": 15.47
            }
          }
        ]
      },
      "30min": {
        "bars": [
          {
            "t": "2025-02-21T14:30:00",
            "o": 596.50,
            "h": 598.20,
            "l": 594.80,
            "c": 597.10,
            "v": 1250000,
            "indicators": {
              "RSI_14": 56.5,
              "MACD_line": 12.8,
              "Signal_line": 14.2,
              "+DI": 20.1,
              "-DI": 18.9,
              "ADX": 16.2
            }
          },
          {
            "t": "2025-02-21T15:00:00",
            "o": 597.10,
            "h": 599.80,
            "l": 596.20,
            "c": 598.90,
            "v": 1180000,
            "indicators": {
              "RSI_14": 58.2,
              "MACD_line": 13.1,
              "Signal_line": 14.0,
              "+DI": 21.3,
              "-DI": 17.8,
              "ADX": 16.8
            }
          }
        ]
      }
    }
  };

  console.log("1. STEP 1: Extract data from historical API response");
  console.log("   Input: historicalData (from fetch-historical-data function)");
  console.log("   Structure: { success: true, data: { week: { bars: [...] }, day: { bars: [...] }, '30min': { bars: [...] } } }");
  console.log();

  // 2. Extract the data portion (this is what we do in the function)
  const data = historicalDataFromAPI.data || historicalDataFromAPI;
  
  console.log("2. STEP 2: Extract the 'data' portion");
  console.log("   Code: const data = historicalData.data || historicalData;");
  console.log("   Result: data now contains the timeframe objects directly");
  console.log("   Keys in data:", Object.keys(data));
  console.log();

  // 3. Prepare the payload for S&R API (this is the key transformation)
  const payload = {
    symbol: "SPY",
    tolerance_pct: 0.3,
    bars: {
      week: data.week?.bars || [],
      day: data.day?.bars || [],
      "30min": data['30min']?.bars || []
    }
  };

  console.log("3. STEP 3: Transform to S&R API format");
  console.log("   Key transformation: Extract the 'bars' arrays from each timeframe");
  console.log("   Code:");
  console.log("   const payload = {");
  console.log("     symbol: symbol,");
  console.log("     tolerance_pct: 0.3,");
  console.log("     bars: {");
  console.log("       week: data.week?.bars || [],");
  console.log("       day: data.day?.bars || [],");
  console.log("       '30min': data['30min']?.bars || []");
  console.log("     }");
  console.log("   };");
  console.log();

  console.log("4. STEP 4: Verify the transformation");
  console.log("   Original structure: data.week.bars = [...]");
  console.log("   S&R API structure: payload.bars.week = [...]");
  console.log();
  console.log("   Payload structure:");
  console.log("   - symbol:", payload.symbol);
  console.log("   - tolerance_pct:", payload.tolerance_pct);
  console.log("   - bars.week length:", payload.bars.week.length);
  console.log("   - bars.day length:", payload.bars.day.length);
  console.log("   - bars['30min'] length:", payload.bars["30min"].length);
  console.log();

  console.log("5. STEP 5: Sample bar structure (what S&R API receives)");
  if (payload.bars.week.length > 0) {
    console.log("   Sample weekly bar:");
    console.log(JSON.stringify(payload.bars.week[0], null, 4));
  }
  console.log();

  console.log("6. CRITICAL DIFFERENCES:");
  console.log("   ❌ WRONG: payload.bars.week.bars = [...]  (extra 'bars' level)");
  console.log("   ✅ CORRECT: payload.bars.week = [...]     (direct array)");
  console.log();
  console.log("   The S&R API expects:");
  console.log("   {");
  console.log("     'symbol': 'SPY',");
  console.log("     'tolerance_pct': 0.3,");
  console.log("     'bars': {");
  console.log("       'week': [ {bar1}, {bar2}, ... ],      // Direct array");
  console.log("       'day': [ {bar1}, {bar2}, ... ],       // Direct array");
  console.log("       '30min': [ {bar1}, {bar2}, ... ]      // Direct array");
  console.log("     }");
  console.log("   }");
  console.log();

  console.log("7. COMPLETE REQUEST EXAMPLE:");
  console.log("   URL: https://stock-level-tracker.replit.app/api/v1/analysis/levels");
  console.log("   Method: POST");
  console.log("   Headers: { 'Content-Type': 'application/json', 'X-API-Key': 'default-api-key' }");
  console.log("   Body:", JSON.stringify(payload, null, 2).substring(0, 500) + "...");
  console.log();

  return payload;
}

// Function to show the exact code from the generate-analysis function
function showActualFunctionCode() {
  console.log("=== ACTUAL CODE FROM generate-analysis FUNCTION ===\n");
  
  // Break the code example into smaller chunks to avoid console buffer limits
  const codeLines = [
    "// This is the exact code from fetchSupportResistanceLevels function:",
    "",
    "const fetchSupportResistanceLevels = async (symbol: string, historicalData: any) => {",
    "  try {",
    "    console.log(`[GENERATE-ANALYSIS] Fetching S&R levels for ${symbol}`);",
    "",
    "    // STEP 1: Extract data from historical API response",
    "    const data = historicalData.data || historicalData;",
    "",
    "    // STEP 2: Prepare the payload for stock-level-tracker API",
    "    const payload = {",
    "      symbol: symbol,",
    "      tolerance_pct: 0.3,",
    "      bars: {",
    "        week: data.week?.bars || [],      // Extract bars array from week object",
    "        day: data.day?.bars || [],        // Extract bars array from day object",
    "        \"30min\": data['30min']?.bars || [] // Extract bars array from 30min object",
    "      }",
    "    };",
    "",
    "    console.log(`[GENERATE-ANALYSIS] S&R API Payload structure:`, {",
    "      symbol: payload.symbol,",
    "      tolerance_pct: payload.tolerance_pct,",
    "      weekBarsCount: payload.bars.week.length,",
    "      dayBarsCount: payload.bars.day.length,",
    "      thirtyMinBarsCount: payload.bars[\"30min\"].length",
    "    });",
    "",
    "    // STEP 3: Make the request to S&R API",
    "    const response = await fetch(\"https://stock-level-tracker.replit.app/api/v1/analysis/levels\", {",
    "      method: \"POST\",",
    "      headers: {",
    "        \"Content-Type\": \"application/json\",",
    "        \"X-API-Key\": \"default-api-key\",",
    "      },",
    "      body: JSON.stringify(payload),",
    "    });",
    "",
    "    if (!response.ok) {",
    "      const errorText = await response.text();",
    "      console.error(`[GENERATE-ANALYSIS] S&R API Error Response: ${errorText}`);",
    "      throw new Error(`Support/Resistance API error: ${response.status} ${response.statusText}`);",
    "    }",
    "",
    "    return await response.json();",
    "  } catch (error) {",
    "    console.error('[GENERATE-ANALYSIS] Error fetching S&R levels:', error);",
    "    throw error;",
    "  }",
    "};"
  ];

  // Print each line separately to avoid buffer overflow
  codeLines.forEach(line => {
    console.log(line);
  });

  console.log("\n=== KEY POINTS ===");
  console.log("1. We receive: { data: { week: { bars: [...] }, day: { bars: [...] }, '30min': { bars: [...] } } }");
  console.log("2. We extract: data.week.bars, data.day.bars, data['30min'].bars");
  console.log("3. We send: { bars: { week: [...], day: [...], '30min': [...] } }");
  console.log("4. The transformation removes the intermediate 'bars' wrapper from each timeframe");
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { demonstrateDataExtraction, showActualFunctionCode };
}

// Run demonstration if this file is executed directly
if (typeof window === 'undefined') {
  demonstrateDataExtraction();
  showActualFunctionCode();
}