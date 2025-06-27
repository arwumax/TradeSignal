// test-sr-api-corrected.js - Demonstration with correct request format

async function demonstrateCorrectSRAPIRequest() {
  console.log("=== Corrected Support & Resistance API Request Demonstration ===\n");

  // Correct data structure that matches your provided format
  const correctHistoricalData = {
    data: {
      week: {
        bars: [
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
      day: {
        bars: [
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
        bars: [
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

  const symbol = "SPY";
  const data = correctHistoricalData.data;

  // Get API key from environment variable or use default
  const srApiKey = process.env.SUPPORT_RESISTANCE_API_KEY || 'default-api-key';

  // Prepare the payload with the correct format
  const payload = {
    symbol: symbol,
    tolerance_pct: 0.3,
    bars: {
      week: data.week?.bars || [],
      day: data.day?.bars || [],
      "30min": data['30min']?.bars || []
    }
  };

  console.log("1. Request URL:");
  console.log("https://stock-level-tracker.replit.app/api/v1/analysis/levels\n");

  console.log("2. Request Method:");
  console.log("POST\n");

  console.log("3. Request Headers:");
  console.log(JSON.stringify({
    "Content-Type": "application/json",
    "X-API-Key": srApiKey
  }, null, 2));
  console.log();

  console.log("4. Request Body Structure:");
  console.log("Symbol:", payload.symbol);
  console.log("Tolerance Percentage:", payload.tolerance_pct);
  console.log("Weekly bars count:", payload.bars.week.length);
  console.log("Daily bars count:", payload.bars.day.length);
  console.log("30-minute bars count:", payload.bars["30min"].length);
  console.log();

  console.log("5. Sample Weekly Bar Structure:");
  if (payload.bars.week.length > 0) {
    console.log(JSON.stringify(payload.bars.week[0], null, 2));
  }
  console.log();

  console.log("6. Sample Daily Bar Structure:");
  if (payload.bars.day.length > 0) {
    console.log(JSON.stringify(payload.bars.day[0], null, 2));
  }
  console.log();

  console.log("7. Sample 30-minute Bar Structure:");
  if (payload.bars["30min"].length > 0) {
    console.log(JSON.stringify(payload.bars["30min"][0], null, 2));
  }
  console.log();

  console.log("8. Complete Request Body (First 500 characters):");
  const fullPayload = JSON.stringify(payload, null, 2);
  console.log(fullPayload.substring(0, 500) + "...");
  console.log();

  console.log("9. Key Differences from Previous Format:");
  console.log("- Each bar now includes an 'indicators' object");
  console.log("- Technical indicators (EMA, RSI, MACD, etc.) are nested within each bar");
  console.log("- Timestamp format uses 't' field with ISO string");
  console.log("- OHLCV data uses single letters: o, h, l, c, v");
  console.log("- Volume is included in each bar");
  console.log("- API key is now retrieved from environment variable");
  console.log();

  console.log("10. Making the actual request...\n");

  try {
    const response = await fetch("https://stock-level-tracker.replit.app/api/v1/analysis/levels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": srApiKey,
      },
      body: JSON.stringify(payload),
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error Response Body:", errorText);
      throw new Error(`Support/Resistance API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("\n11. Response Data Structure:");
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error("\n11. Request Failed:");
    console.error("Error:", error.message);
    
    if (error.message.includes("fetch")) {
      console.log("\nNote: This might fail in a browser environment due to CORS restrictions.");
      console.log("The actual request works fine from the Supabase Edge Function environment.");
    }
  }

  console.log("\n=== End of Corrected Demonstration ===");
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { demonstrateCorrectSRAPIRequest };
}

// Run demonstration if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  demonstrateCorrectSRAPIRequest();
}