// test-api-connectivity.js - Test connectivity to external APIs

async function testHistoricalDataAPI() {
  console.log("=== Testing Historical Data API ===");
  console.log("URL: https://stock-historical-data-downloader.maxwu.work/api/v1/download");
  
  const payload = {
    symbol: "AAPL",
    requests: [
      {
        interval: "day",
        recent_bar_no: 5,
        indicators: {
          ema: [20, 50],
          rsi: { length: 14 },
          macd: { fast: 12, slow: 26, signal: 9 },
          dmi: { length: 14 }
        }
      }
    ],
    include_extended_hours: false,
    output_format: "compact-json"
  };

  try {
    console.log("Making request...");
    const response = await fetch("https://stock-historical-data-downloader.maxwu.work/api/v1/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "lmt_0818f2510d2c67ead3260d22511a5f58",
      },
      body: JSON.stringify(payload),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log("✅ SUCCESS - API is responding");
      console.log("Response structure:", {
        hasData: !!data,
        keys: data ? Object.keys(data) : [],
        dataKeys: data?.data ? Object.keys(data.data) : [],
        sampleSize: JSON.stringify(data).length
      });
      
      if (data?.data?.day?.bars?.length > 0) {
        console.log("Sample bar:", data.data.day.bars[0]);
      }
    } else {
      const errorText = await response.text();
      console.log("❌ FAILED - API returned error");
      console.log("Error response:", errorText);
    }
  } catch (error) {
    console.log("❌ FAILED - Network or request error");
    console.log("Error:", error.message);
    console.log("Error type:", error.constructor.name);
  }
  
  console.log("\n" + "=".repeat(50) + "\n");
}

async function testSupportResistanceAPI() {
  console.log("=== Testing Support & Resistance API ===");
  console.log("URL: https://stock-level-tracker.replit.app/api/v1/analysis/levels");
  
  // Sample data that matches the expected format
  const payload = {
    symbol: "AAPL",
    tolerance_pct: 0.3,
    atr_multiplier: 0.3,
    confirm_window: 4,
    merge_timeframes: true,
    bars: {
      week: [
        {
          "t": "2025-01-06T05:00:00",
          "o": 220.0,
          "h": 225.0,
          "l": 218.0,
          "c": 223.0,
          "v": 50000000,
          "indicators": {
            "EMA_20": 220.5,
            "EMA_50": 215.0,
            "RSI_14": 55.0,
            "MACD_line": 2.5,
            "Signal_line": 2.0,
            "+DI": 25.0,
            "-DI": 20.0,
            "ADX": 30.0,
            "ATR_14": 3.5
          }
        }
      ],
      day: [
        {
          "t": "2025-01-06T05:00:00",
          "o": 220.0,
          "h": 225.0,
          "l": 218.0,
          "c": 223.0,
          "v": 50000000,
          "indicators": {
            "EMA_20": 220.5,
            "EMA_50": 215.0,
            "EMA_100": 210.0,
            "EMA_200": 200.0,
            "RSI_14": 55.0,
            "MACD_line": 2.5,
            "Signal_line": 2.0,
            "+DI": 25.0,
            "-DI": 20.0,
            "ADX": 30.0,
            "ATR_14": 3.5
          }
        }
      ]
    }
  };

  try {
    console.log("Making request...");
    const response = await fetch("https://stock-level-tracker.replit.app/api/v1/analysis/levels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "default-api-key",
      },
      body: JSON.stringify(payload),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log("✅ SUCCESS - API is responding");
      console.log("Response structure:", {
        hasData: !!data,
        keys: data ? Object.keys(data) : [],
        hasSymbol: !!data?.symbol,
        hasTimeframes: !!data?.timeframes,
        hasMerged: !!data?.timeframes?.merged,
        sampleSize: JSON.stringify(data).length
      });
      
      if (data?.timeframes?.merged?.significant_levels?.length > 0) {
        console.log("Sample level:", data.timeframes.merged.significant_levels[0]);
      }
    } else {
      const errorText = await response.text();
      console.log("❌ FAILED - API returned error");
      console.log("Error response:", errorText);
    }
  } catch (error) {
    console.log("❌ FAILED - Network or request error");
    console.log("Error:", error.message);
    console.log("Error type:", error.constructor.name);
  }
  
  console.log("\n" + "=".repeat(50) + "\n");
}

async function testBothAPIs() {
  console.log("🔍 Testing External API Connectivity\n");
  console.log("This will test both APIs used by the stock analysis application:");
  console.log("1. Historical Data API - for getting stock price and indicator data");
  console.log("2. Support & Resistance API - for calculating key price levels");
  console.log("\n" + "=".repeat(70) + "\n");
  
  await testHistoricalDataAPI();
  await testSupportResistanceAPI();
  
  console.log("🏁 API Connectivity Test Complete");
  console.log("\nIf both APIs show ✅ SUCCESS, your application should work properly.");
  console.log("If either shows ❌ FAILED, there may be connectivity or API issues.");
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testBothAPIs, testHistoricalDataAPI, testSupportResistanceAPI };
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  testBothAPIs().catch(console.error);
}