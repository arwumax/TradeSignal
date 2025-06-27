// test-sr-api.js - Demonstration of POST request to Support & Resistance API

async function demonstrateSRAPIRequest() {
  console.log("=== Support & Resistance API Request Demonstration ===\n");

  // Sample data structure that would come from historical data API
  const sampleHistoricalData = {
    data: {
      week: {
        bars: [
          { timestamp: "2024-06-17", open: 590, high: 595, low: 585, close: 592, volume: 1000000 },
          { timestamp: "2024-06-24", open: 592, high: 598, low: 588, close: 595, volume: 1200000 }
        ]
      },
      day: {
        bars: [
          { timestamp: "2024-06-20", open: 590, high: 593, low: 587, close: 591, volume: 500000 },
          { timestamp: "2024-06-21", open: 591, high: 596, low: 589, close: 594, volume: 600000 },
          { timestamp: "2024-06-24", open: 594, high: 599, low: 592, close: 597, volume: 700000 }
        ]
      },
      "30min": {
        bars: [
          { timestamp: "2024-06-24T09:30:00", open: 594, high: 596, low: 593, close: 595, volume: 50000 },
          { timestamp: "2024-06-24T10:00:00", open: 595, high: 598, low: 594, close: 597, volume: 60000 },
          { timestamp: "2024-06-24T10:30:00", open: 597, high: 599, low: 596, close: 598, volume: 55000 }
        ]
      }
    }
  };

  const symbol = "AAPL";
  const data = sampleHistoricalData.data;

  // Step 1: Prepare the payload exactly as done in the function
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
    "X-API-Key": "default-api-key"
  }, null, 2));
  console.log();

  console.log("4. Request Body (Payload):");
  console.log(JSON.stringify(payload, null, 2));
  console.log();

  console.log("5. Payload Structure Summary:");
  console.log({
    symbol: payload.symbol,
    tolerance_pct: payload.tolerance_pct,
    weekBarsCount: payload.bars.week.length,
    dayBarsCount: payload.bars.day.length,
    thirtyMinBarsCount: payload.bars["30min"].length
  });
  console.log();

  console.log("6. Making the actual request...\n");

  try {
    // Make the actual request (this is the exact code from the function)
    const response = await fetch("https://stock-level-tracker.replit.app/api/v1/analysis/levels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "default-api-key",
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
    console.log("\n7. Response Data Structure:");
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error("\n7. Request Failed:");
    console.error("Error:", error.message);
    
    if (error.message.includes("fetch")) {
      console.log("\nNote: This might fail in a browser environment due to CORS restrictions.");
      console.log("The actual request works fine from the Supabase Edge Function environment.");
    }
  }

  console.log("\n=== End of Demonstration ===");
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { demonstrateSRAPIRequest };
}

// Run demonstration if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  demonstrateSRAPIRequest();
}