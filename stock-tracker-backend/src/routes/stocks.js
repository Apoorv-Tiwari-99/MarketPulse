import express from "express";
import { getStockQuote, getMultipleStocks, getHistoricalData, searchStocks, INDIAN_STOCKS } from '../utils/stockData.js';

const router = express.Router();

// Get all stocks 
router.get("/", async (req, res) => {
    try {
        const symbols = Object.keys(INDIAN_STOCKS);
        const stocks = await getMultipleStocks(symbols);
        
        // Filter out null values
        const validStocks = stocks.filter(stock => stock !== null);

        res.json({
            success: true,
            data: validStocks
        });

    } catch (error) {
        console.error('Error fetching stocks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stocks',
            error: error.message
        });
    }
})

// Get single stocks detail 
router.get("/:symbol", async (req, res) => {
    try {
        const { symbol } = req.params;
        const stock = await getStockQuote(symbol);
        
        if (!stock) {
            return res.status(404).json({
                success: false,
                message: 'Stock not found'
            });
        }
        
        res.json({
            success: true,
            data: stock
        });

    } catch (error) {
        console.error(`Error fetching stock ${req.params.symbol}:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stock',
            error: error.message
        });
    }
})

// Get historical data for chart
router.get("/:symbol/historical", async (req, res) => {
    try {
        const { symbol } = req.params;
        const { interval = '1d', range = '1mo' } = req.query;

        console.log(`Fetching historical data for ${symbol} with interval: ${interval}, range: ${range}`);

        const historicalData = await getHistoricalData(symbol, interval, range);
        
        res.json({
            success: true,
            data: historicalData
        });
    } catch (error) {
        console.error(`Error fetching historical data for ${req.params.symbol}:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch historical data',
            error: error.message
        });
    }
})

// Search Stocks - Keep this as is
router.get("/search/:query", async (req, res) => {
    try {
        const { query } = req.params;
        const results = await searchStocks(query);

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error searching stocks:', error);
        res.status(500).json({
            success: false,
            message: 'Search failed',
            error: error.message
        });
    }
})

export default router;