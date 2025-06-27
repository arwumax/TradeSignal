// src/utils/tradingHours.ts - Trading hours utilities for Eastern Time

export interface TradingPeriodInfo {
  isCurrentlyTradingHours: boolean;
  currentPeriodType: 'trading' | 'non-trading';
  periodStartET: Date;
  periodEndET: Date;
  periodStartUTC: Date;
  periodEndUTC: Date;
}

/**
 * Get detailed information about the current trading period in Eastern Time
 * @param timestamp - The timestamp to analyze (defaults to current time)
 * @returns TradingPeriodInfo object with period boundaries and type
 */
export const getETInfo = (timestamp: Date = new Date()): TradingPeriodInfo => {
  // Convert input timestamp to Eastern Time
  const etTime = new Date(timestamp.toLocaleString("en-US", { timeZone: "America/New_York" }));
  
  // Get the current date in ET for boundary calculations
  const etYear = parseInt(timestamp.toLocaleDateString("en-US", { timeZone: "America/New_York", year: "numeric" }));
  const etMonth = parseInt(timestamp.toLocaleDateString("en-US", { timeZone: "America/New_York", month: "numeric" })) - 1; // Month is 0-indexed
  const etDay = parseInt(timestamp.toLocaleDateString("en-US", { timeZone: "America/New_York", day: "numeric" }));
  const etHour = parseInt(timestamp.toLocaleDateString("en-US", { timeZone: "America/New_York", hour: "numeric", hour12: false }));
  const etMinute = parseInt(timestamp.toLocaleDateString("en-US", { timeZone: "America/New_York", minute: "numeric" }));
  
  // Define trading hours: 9:30 AM to 4:00 PM ET
  const tradingStartHour = 9;
  const tradingStartMinute = 30;
  const tradingEndHour = 16; // 4:00 PM in 24-hour format
  const tradingEndMinute = 0;
  
  // Check if current time is within trading hours
  const currentTimeMinutes = etHour * 60 + etMinute;
  const tradingStartMinutes = tradingStartHour * 60 + tradingStartMinute;
  const tradingEndMinutes = tradingEndHour * 60 + tradingEndMinute;
  
  const isCurrentlyTradingHours = currentTimeMinutes >= tradingStartMinutes && currentTimeMinutes < tradingEndMinutes;
  
  let periodStartET: Date;
  let periodEndET: Date;
  
  if (isCurrentlyTradingHours) {
    // Currently in trading hours: period is 9:30 AM to 4:00 PM today
    periodStartET = new Date(etYear, etMonth, etDay, tradingStartHour, tradingStartMinute, 0, 0);
    periodEndET = new Date(etYear, etMonth, etDay, tradingEndHour, tradingEndMinute, 0, 0);
  } else {
    // Currently in non-trading hours
    if (currentTimeMinutes < tradingStartMinutes) {
      // Before 9:30 AM: non-trading period started at 4:00 PM yesterday
      const yesterday = new Date(etYear, etMonth, etDay - 1);
      periodStartET = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), tradingEndHour, tradingEndMinute, 0, 0);
      periodEndET = new Date(etYear, etMonth, etDay, tradingStartHour, tradingStartMinute, 0, 0);
    } else {
      // After 4:00 PM: non-trading period started at 4:00 PM today
      periodStartET = new Date(etYear, etMonth, etDay, tradingEndHour, tradingEndMinute, 0, 0);
      const tomorrow = new Date(etYear, etMonth, etDay + 1);
      periodEndET = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), tradingStartHour, tradingStartMinute, 0, 0);
    }
  }
  
  // Convert ET times to UTC for database comparison
  // Create temporary dates in ET timezone and convert to UTC
  const periodStartUTC = new Date(periodStartET.toLocaleString("en-US", { timeZone: "UTC" }));
  const periodEndUTC = new Date(periodEndET.toLocaleString("en-US", { timeZone: "UTC" }));
  
  // Adjust for timezone offset to get proper UTC times
  const etOffset = getETOffset(timestamp);
  periodStartUTC.setHours(periodStartUTC.getHours() + etOffset);
  periodEndUTC.setHours(periodEndUTC.getHours() + etOffset);
  
  return {
    isCurrentlyTradingHours,
    currentPeriodType: isCurrentlyTradingHours ? 'trading' : 'non-trading',
    periodStartET,
    periodEndET,
    periodStartUTC,
    periodEndUTC
  };
};

/**
 * Get the UTC offset for Eastern Time at a given date
 * Accounts for Daylight Saving Time (DST)
 * @param date - The date to check
 * @returns The offset in hours to add to ET to get UTC
 */
const getETOffset = (date: Date): number => {
  // Create a date in ET and UTC to calculate the offset
  const etString = date.toLocaleString("en-US", { timeZone: "America/New_York" });
  const utcString = date.toLocaleString("en-US", { timeZone: "UTC" });
  
  const etDate = new Date(etString);
  const utcDate = new Date(utcString);
  
  // Calculate the difference in hours
  const offsetMs = utcDate.getTime() - etDate.getTime();
  return offsetMs / (1000 * 60 * 60);
};

/**
 * Check if a given timestamp falls within the same trading period as another timestamp
 * @param timestamp1 - First timestamp to compare
 * @param timestamp2 - Second timestamp to compare
 * @returns true if both timestamps fall within the same trading period
 */
export const isInSameTradingPeriod = (timestamp1: Date, timestamp2: Date): boolean => {
  const period1 = getETInfo(timestamp1);
  const period2 = getETInfo(timestamp2);
  
  // Check if both timestamps fall within the same period boundaries
  return (
    period1.periodStartUTC.getTime() === period2.periodStartUTC.getTime() &&
    period1.periodEndUTC.getTime() === period2.periodEndUTC.getTime()
  );
};

/**
 * Get a human-readable description of the current trading period
 * @param timestamp - The timestamp to analyze (defaults to current time)
 * @returns A descriptive string about the current period
 */
export const getTradingPeriodDescription = (timestamp: Date = new Date()): string => {
  const info = getETInfo(timestamp);
  
  if (info.isCurrentlyTradingHours) {
    return `Currently in trading hours (${info.periodStartET.toLocaleTimeString('en-US', { 
      timeZone: 'America/New_York', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })} - ${info.periodEndET.toLocaleTimeString('en-US', { 
      timeZone: 'America/New_York', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })} ET)`;
  } else {
    return `Currently in non-trading hours (${info.periodStartET.toLocaleTimeString('en-US', { 
      timeZone: 'America/New_York', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })} ET - ${info.periodEndET.toLocaleTimeString('en-US', { 
      timeZone: 'America/New_York', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })} ET)`;
  }
};