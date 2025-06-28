# AI-Powered Stock Analysis Dashboard

## Overview

The AI-Powered Stock Analysis Dashboard is a cutting-edge application designed to transform complex stock market data into actionable trading insights using advanced Artificial Intelligence. It aims to democratize sophisticated technical analysis, making it accessible to traders of all experience levels by automating the time-consuming and expertise-intensive process of market research.

## The Problem It Solves

Traditional technical analysis presents several significant challenges for traders:

- **Time-Consuming Process**: Manually analyzing charts, calculating indicators, and identifying patterns across multiple timeframes can take hours, often leading to missed opportunities in fast-moving markets.
- **Expertise Barrier**: Understanding intricate market trends, identifying reliable support and resistance levels, and interpreting various technical indicators requires years of experience and deep market knowledge.
- **Human Error & Bias**: Manual analysis is susceptible to human error, emotional decision-making, and cognitive biases, which can lead to suboptimal trading outcomes.
- **Information Overload**: The sheer volume of market data can be overwhelming, making it difficult to extract relevant and actionable information efficiently.

These challenges often result in traders missing critical signals, making ill-informed decisions, or failing to manage risk effectively, ultimately impacting their profitability.

## How It Works

This application leverages a powerful AI backend to provide comprehensive stock analysis in minutes, addressing the limitations of traditional methods.

### 1. Comprehensive Historical Data Fetching
- The system automatically gathers extensive historical stock data across multiple timeframes (weekly, daily, and 30-minute intervals).
- This data includes Open, High, Low, Close, and Volume (OHLCV) information, along with a wide array of technical indicators such as Exponential Moving Averages (EMA), Relative Strength Index (RSI), Moving Average Convergence Divergence (MACD), Average Directional Index (ADX), and Average True Range (ATR).
- This data is cached in a Supabase database to ensure rapid retrieval for subsequent analyses of the same stock within a relevant trading period.

### 2. AI-Driven Trend Analysis
- Advanced AI algorithms analyze the fetched historical data to identify prevailing market trends (bullish, bearish, or neutral) across different timeframes.
- The AI considers momentum indicators and the relationships between various moving averages to provide a holistic view of the stock's direction.

### 3. Precise Support & Resistance Identification
- The AI pinpoints critical support and resistance levels by analyzing price action, volume patterns, and historical turning points.
- This process identifies key price zones where the stock is likely to find buying or selling pressure, crucial for strategic trading decisions.

### 4. Actionable Trading Strategy Generation
- Based on the combined insights from trend analysis and support/resistance identification, the AI generates specific, actionable trading strategies.
- These strategies include suggested entry points, profit targets, stop-loss levels, and calculated risk-reward ratios, tailored to the current market conditions.

### 5. User-Friendly Interface
- The frontend provides a clean and intuitive interface where users can simply enter a stock symbol.
- The analysis process is displayed with clear loading steps, and the final comprehensive report is presented in an easy-to-read markdown format.

## Key Features & Benefits

- **Instant Analysis**: Get professional-grade technical analysis in under a minute, saving hours of manual research.
- **Objective Insights**: Eliminate emotional bias and human error with purely data-driven analysis and recommendations.
- **Enhanced Risk Management**: Utilize precise support and resistance levels to set more effective stop-losses and manage position sizes.
- **Comprehensive Reports**: Receive detailed analysis covering trends, key price levels, and specific trading strategies, all in one consolidated report.
- **Actionable Strategies**: Gain clear entry points, targets, and stop-losses, moving beyond vague market commentary to concrete trading plans.
- **Accessibility**: No prior technical analysis expertise is required; simply enter a stock symbol and let the AI do the work.

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend (Edge Functions)**: Supabase Edge Functions (Deno)
- **Database**: Supabase PostgreSQL
- **AI Models**: Perplexity AI, DeepSeek AI
- **External APIs**: Stock Historical Data Downloader, Stock Level Tracker (for Support & Resistance)

## Setup and Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- API keys for AI providers (Perplexity and/or DeepSeek)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stock-analysis-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update the environment variables with your actual credentials:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # AI Model Configuration
   PRIMARY_AI_PROVIDER=perplexity
   PERPLEXITY_API_KEY=your_perplexity_api_key_here
   PERPLEXITY_MODEL=sonar-reasoning
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   DEEPSEEK_MODEL=deepseek-reasoner

   # External API Keys
   HISTORICAL_DATA_API_KEY=your_historical_data_api_key_here
   SUPPORT_RESISTANCE_API_KEY=your_support_resistance_api_key_here
   ```

4. **Database Setup**
   - The database migrations are included in the `supabase/migrations` folder
   - Run the migrations in your Supabase project to create the required tables

5. **Deploy Edge Functions**
   - Deploy the Supabase Edge Functions to your project:
   ```bash
   supabase functions deploy fetch-historical-data-and-store
   supabase functions deploy generate-trend-analysis
   supabase functions deploy generate-sr-analysis
   supabase functions deploy generate-strategy-analysis
   supabase functions deploy save-analysis
   ```

6. **Set Environment Variables in Supabase**
   ```bash
   supabase secrets set PRIMARY_AI_PROVIDER=perplexity
   supabase secrets set PERPLEXITY_API_KEY=your_actual_key
   supabase secrets set DEEPSEEK_API_KEY=your_actual_key
   supabase secrets set HISTORICAL_DATA_API_KEY=your_actual_key
   supabase secrets set SUPPORT_RESISTANCE_API_KEY=your_actual_key
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

### Production Deployment

The application can be deployed to any static hosting service like Netlify, Vercel, or similar platforms. The backend runs on Supabase Edge Functions, so no additional server setup is required.

## Usage

1. **Enter a Stock Symbol**: Type any valid US stock symbol (e.g., AAPL, GOOGL, TSLA) in the search box.
2. **Wait for Analysis**: The system will automatically fetch data and generate analysis (typically takes 1-3 minutes).
3. **Review Results**: Get comprehensive analysis including:
   - Market trend analysis across multiple timeframes
   - Key support and resistance levels
   - Specific trading strategies with entry/exit points
   - Risk management recommendations

## API Documentation

### Edge Functions

- **fetch-historical-data-and-store**: Fetches and caches historical stock data
- **generate-trend-analysis**: Analyzes market trends using AI
- **generate-sr-analysis**: Identifies support and resistance levels
- **generate-strategy-analysis**: Generates actionable trading strategies
- **save-analysis**: Saves completed analysis to database

### Database Schema

- **stock_analyses**: Stores completed analysis reports
- **historical_data_cache**: Caches historical stock data for performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Disclaimer

This application is for educational and informational purposes only. It does not constitute financial advice. Always conduct your own research and consult with qualified financial advisors before making investment decisions. Trading stocks involves risk and you may lose money.