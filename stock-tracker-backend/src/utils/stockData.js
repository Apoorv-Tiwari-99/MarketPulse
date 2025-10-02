import yahooFinance from "yahoo-finance2";

// Indian stock symbols mapping
export const INDIAN_STOCKS = {
    'RELIANCE.NS': 'Reliance Industries',
    'TCS.NS': 'Tata Consultancy Services',
    'HDFCBANK.NS': 'HDFC Bank',
    'INFY.NS': 'Infosys',
    'HINDUNILVR.NS': 'Hindustan Unilever',
    'ICICIBANK.NS': 'ICICI Bank',
    'SBIN.NS': 'State Bank of India',
    'BHARTIARTL.NS': 'Bharti Airtel',
    'KOTAKBANK.NS': 'Kotak Mahindra Bank',
    'ITC.NS': 'ITC Limited'
};

// Indian indices - only include working ones
export const INDIAN_INDICES = {
    '^NSEI': 'Nifty 50',
    '^BSESN': 'Sensex',
    '^CNX100': 'Nifty 100',
};

// Fetch stock quote 
export const getStockQuote = async (symbol) => {
    try {
        const quote = await yahooFinance.quote(symbol);
        
        // Check if quote is valid
        if (!quote || !quote.symbol) {
            console.warn(`Invalid quote response for ${symbol}`);
            return null;
        }
        
        return {
            symbol: quote.symbol,
            companyName: INDIAN_STOCKS[symbol] || quote.longName || quote.shortName || 'N/A',
            currentPrice: quote.regularMarketPrice || quote.price || 0,
            previousClose: quote.regularMarketPreviousClose || 0,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            high: quote.regularMarketDayHigh || 0,
            low: quote.regularMarketDayLow || 0,
            volume: quote.regularMarketVolume || 0,
            marketCap: quote.marketCap || 0,
            currency: quote.currency || 'INR',
            open: quote.regularMarketOpen || 0
        };

    } catch (error) {
        console.error(`Error fetching quote for ${symbol}:`, error.message);
        return null;
    }
}

// Fetch multiple stocks
export const getMultipleStocks = async (symbols) => {
    const promises = symbols.map(symbol => getStockQuote(symbol));
    const results = await Promise.allSettled(promises);

    return results
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value);
};


// Fix the getHistoricalData function with proper Yahoo Finance parameters
export const getHistoricalData = async (symbol, interval = '1d', range = '1mo') => {
    try {
        console.log(`Fetching historical data for ${symbol} with interval: ${interval}, range: ${range}`);

        // Map intervals to valid Yahoo Finance intervals
        const intervalMap = {
            '1d': '1d',
            '1wk': '1wk', 
            '1mo': '1mo',
            '3mo': '3mo'
        };

        // Map ranges to valid Yahoo Finance periods
        const rangeMap = {
            '1d': '1d',
            '1mo': '1mo',
            '3mo': '3mo',
            '6mo': '6mo',
            '1y': '1y',
            '5y': '5y'
        };

        const safeInterval = intervalMap[interval] || '1d';
        const safeRange = rangeMap[range] || '1mo';

        // For Yahoo Finance, we need to use specific date ranges
        let period1, period2;
        const today = new Date();
        
        switch (safeRange) {
            case '1d':
                period1 = new Date(today.getTime() - (24 * 60 * 60 * 1000)); // 1 day ago
                period2 = today;
                break;
            case '1mo':
                period1 = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago
                period2 = today;
                break;
            case '3mo':
                period1 = new Date(today.getTime() - (90 * 24 * 60 * 60 * 1000)); // 90 days ago
                period2 = today;
                break;
            case '6mo':
                period1 = new Date(today.getTime() - (180 * 24 * 60 * 60 * 1000)); // 180 days ago
                period2 = today;
                break;
            case '1y':
                period1 = new Date(today.getTime() - (365 * 24 * 60 * 60 * 1000)); // 1 year ago
                period2 = today;
                break;
            case '5y':
                period1 = new Date(today.getTime() - (5 * 365 * 24 * 60 * 60 * 1000)); // 5 years ago
                period2 = today;
                break;
            default:
                period1 = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000)); // Default 30 days
                period2 = today;
        }

        const queryOptions = {
            interval: safeInterval,
            period1,
            period2
        };

        console.log(`Yahoo Finance query:`, { symbol, interval: safeInterval, period1, period2 });

        const historical = await yahooFinance.chart(symbol, queryOptions);
        
        if (!historical || !historical.quotes || historical.quotes.length === 0) {
            console.warn(`No historical data found for ${symbol}`);
            return generateMockHistoricalData(safeRange); // Fallback to mock data
        }

        // Filter out invalid quotes and transform data
        const validQuotes = historical.quotes.filter(quote => 
            quote && quote.date && quote.close !== undefined
        );

        if (validQuotes.length === 0) {
            console.warn(`No valid quotes found for ${symbol}`);
            return generateMockHistoricalData(safeRange);
        }

        return validQuotes.map(quote => ({
            timestamp: new Date(quote.date).getTime(),
            date: quote.date.toISOString(),
            open: quote.open || quote.close || 0,
            high: quote.high || quote.close || 0,
            low: quote.low || quote.close || 0,
            close: quote.close || 0,
            volume: quote.volume || 0
        }));

    } catch (error) {
        console.error(`Error fetching historical data for ${symbol}:`, error.message);
        // Return mock data as fallback
        return generateMockHistoricalData(range);
    }
};

// Generate better mock historical data based on range
const generateMockHistoricalData = (range = '1mo') => {
    const data = [];
    const basePrice = 1500 + Math.random() * 1000;
    const now = new Date();
    
    let dataPoints;
    switch (range) {
        case '1d':
            dataPoints = 24; // 24 hours
            break;
        case '1wk':
            dataPoints = 7; // 7 days
            break;
        case '1mo':
            dataPoints = 30; // 30 days
            break;
        case '3mo':
            dataPoints = 90; // 90 days
            break;
        case '6mo':
            dataPoints = 180; // 180 days
            break;
        case '1y':
            dataPoints = 52; // 52 weeks
            break;
        case '5y':
            dataPoints = 60; // 60 months
            break;
        default:
            dataPoints = 30;
    }
    
    let currentPrice = basePrice;
    
    for (let i = dataPoints; i >= 0; i--) {
        let date;
        
        switch (range) {
            case '1d':
                date = new Date(now);
                date.setHours(date.getHours() - i);
                break;
            case '1wk':
                date = new Date(now);
                date.setDate(date.getDate() - i);
                break;
            case '1mo':
                date = new Date(now);
                date.setDate(date.getDate() - i);
                break;
            case '3mo':
                date = new Date(now);
                date.setDate(date.getDate() - i);
                break;
            case '6mo':
                date = new Date(now);
                date.setDate(date.getDate() - i);
                break;
            case '1y':
                date = new Date(now);
                date.setDate(date.getDate() - (i * 7)); // Weekly data for 1 year
                break;
            case '5y':
                date = new Date(now);
                date.setMonth(date.getMonth() - i); // Monthly data for 5 years
                break;
            default:
                date = new Date(now);
                date.setDate(date.getDate() - i);
        }
        
        // Generate realistic price movement
        const change = (Math.random() - 0.5) * 20;
        currentPrice = Math.max(10, currentPrice + change); // Ensure price doesn't go below 10
        
        const open = currentPrice + (Math.random() - 0.5) * 10;
        const close = currentPrice;
        const high = Math.max(open, close) + Math.random() * 15;
        const low = Math.min(open, close) - Math.random() * 15;
        
        data.push({
            timestamp: date.getTime(),
            date: date.toISOString(),
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume: Math.floor(1000000 + Math.random() * 5000000),
        });
    }
    
    console.log(`Generated ${data.length} mock data points for range: ${range}`);
    return data;
};

// Search stocks - Keep this as is
export const searchStocks = async (query) => {
    try {
        const searchResults = await yahooFinance.search(query);
        
        if (!searchResults || !searchResults.quotes) {
            return [];
        }
        
        return searchResults.quotes
            .filter(quote => quote && quote.symbol && (
                quote.symbol.includes('.NS') || // Indian stocks
                quote.symbol.includes('.BO') || // BSE stocks
                quote.exchange === 'NSI' || quote.exchange === 'BSE' // Indian exchanges
            ))
            .map(quote => ({
                symbol: quote.symbol,
                name: quote.longname || quote.shortname || 'N/A',
                exchange: quote.exchange || 'NSE'
            }));
    } catch (error) {
        console.error('Error searching stocks:', error.message);
        return [];
    }
};

