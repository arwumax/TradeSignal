// test-sr-api-final.js - Correct Support & Resistance API Request Format

async function demonstrateFinalCorrectSRAPIRequest() {
  console.log("=== FINAL CORRECT Support & Resistance API Request Format ===\n");

  // This is the CORRECT format that matches your example
  const symbol = "SPY";
  
  // Get API key from environment variable or use default
  const srApiKey = process.env.SUPPORT_RESISTANCE_API_KEY || 'default-api-key';
  
  // The payload should directly contain arrays under each timeframe
  const payload = {
    "symbol": "SPY",
    "tolerance_pct": 0.3,
    "bars": {
      "week": [
        {
          "t": "2022-01-03T05:00:00",
          "o": 453.06,
          "h": 456.56,
          "l": 441.98,
          "c": 443.35,
          "v": 425641380,
          "indicators": {
            "+DI": 19.87,
            "-DI": 22.17,
            "ADX": 14.01,
            "ATR_14": 11.52,
            "EMA_100": 368.43,
            "EMA_20": 432.66,
            "EMA_200": null,
            "EMA_50": 406.2,
            "MACD_line": 11.6,
            "RSI_14": 59.94,
            "Signal_line": 11.96
          }
        },
        {
          "t": "2022-01-10T05:00:00",
          "o": 440.12,
          "h": 450.11,
          "l": 434.32,
          "c": 442.04,
          "v": 456163027,
          "indicators": {
            "+DI": 17.97,
            "-DI": 24.68,
            "ADX": 14.14,
            "ATR_14": 11.83,
            "EMA_100": 369.89,
            "EMA_20": 433.55,
            "EMA_200": null,
            "EMA_50": 407.6,
            "MACD_line": 10.98,
            "RSI_14": 59.02,
            "Signal_line": 11.77
          }
        }
      ],
      "day": [
        {
          "t": "2022-01-03T05:00:00",
          "o": 453.06,
          "h": 456.56,
          "l": 441.98,
          "c": 443.35,
          "v": 425641380,
          "indicators": {
            "EMA_20": 432.66,
            "EMA_50": 406.2,
            "EMA_100": 368.43,
            "EMA_200": null,
            "RSI_14": 59.94,
            "MACD_line": 11.6,
            "Signal_line": 11.96,
            "+DI": 19.87,
            "-DI": 22.17,
            "ADX": 14.01
          }
        }
      ],
      "30min": [
        {
          "t": "2022-01-03T14:30:00",
          "o": 453.06,
          "h": 456.56,
          "l": 441.98,
          "c": 443.35,
          "v": 425641380,
          "indicators": {
            "RSI_14": 59.94,
            "MACD_line": 11.6,
            "Signal_line": 11.96,
            "+DI": 19.87,
            "-DI": 22.17,
            "ADX": 14.01
          }
        }
      ]
    }
  };

  console.log("1. CORRECT Request Structure:");
  console.log("URL: https://stock-level-tracker.replit.app/api/v1/analysis/levels");
  console.log("Method: POST");
  console.log("Headers:", JSON.stringify({
    "Content-Type": "application/json",
    "X-API-Key": srApiKey
  }, null, 2));
  console.log();

  console.log("2. CORRECT Payload Structure:");
  console.log("- symbol: string");
  console.log("- tolerance_pct: number");
  console.log("- bars: object with direct arrays");
  console.log("  - week: array of bar objects");
  console.log("  - day: array of bar objects");
  console.log("  - 30min: array of bar objects");
  console.log();

  console.log("3. Key Points:");
  console.log("✓ NO extra 'bars' property inside each timeframe");
  console.log("✓ Direct arrays under 'week', 'day', '30min'");
  console.log("✓ Each bar has 't', 'o', 'h', 'l', 'c', 'v' properties");
  console.log("✓ Each bar has 'indicators' object with technical indicators");
  console.log("✓ API key is now retrieved from environment variable");
  console.log();

  console.log("4. Sample Request Body (truncated):");
  console.log(JSON.stringify(payload, null, 2).substring(0, 800) + "...");
  console.log();

  console.log("5. How this differs from my previous incorrect example:");
  console.log("❌ WRONG: bars.week.bars = [...]");
  console.log("✅ CORRECT: bars.week = [...]");
  console.log("✅ SECURE: API key from environment variable");
  console.log();

  console.log("6. Making the actual request...\n");

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
    } else {
      const result = await response.json();
      console.log("\n7. Response Data:");
      console.log(JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error("\n7. Request Failed:");
    console.error("Error:", error.message);
  }

  console.log("\n=== End of Final Correct Demonstration ===");
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { demonstrateFinalCorrectSRAPIRequest };
}

// Run demonstration if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  demonstrateFinalCorrectSRAPIRequest();
}