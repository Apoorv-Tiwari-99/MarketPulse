import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import { getStockQuote } from '../utils/stockData.js';

const router=express.Router();

// Get user watchlist
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Get current prices for watchlist items
        const watchlistWithPrices = await Promise.all(
            user.watchlist.map(async (item) => {
                const stockData = await getStockQuote(item.symbol);
                return {
                    ...item.toObject(),
                    currentPrice: stockData?.currentPrice || 0,
                    change: stockData?.change || 0,
                    changePercent: stockData?.changePercent || 0
                };
            })
        );

        res.json({
            success: true,
            data: watchlistWithPrices
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch watchlist',
            error: error.message
        });
    }
});


// Add stock to watchlist
router.post('/:symbol', authenticateToken, async (req, res) => {
    try {
        const { symbol } = req.params;

        // Verify stock exists
        const stockData = await getStockQuote(symbol);
        if (!stockData) {
            return res.status(404).json({
                success: false,
                message: 'Stock not found'
            });
        }

        const user = await User.findById(req.user._id);

        // Check if already in watchlist
        const alreadyInWatchlist = user.watchlist.some(item => item.symbol === symbol);
        if (alreadyInWatchlist) {
            return res.status(400).json({
                success: false,
                message: 'Stock already in watchlist'
            });
        }

        // Add to watchlist
        user.watchlist.push({
            symbol,
            companyName: stockData.companyName
        });

        await user.save();

        res.json({
            success: true,
            message: 'Stock added to watchlist',
            data: {
                symbol,
                companyName: stockData.companyName
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add to watchlist',
            error: error.message
        });
    }
});

// Remove stock from watchlist
router.delete('/:symbol', authenticateToken, async (req, res) => {
    try {
        const { symbol } = req.params;
        const user = await User.findById(req.user._id);

        user.watchlist = user.watchlist.filter(item => item.symbol !== symbol);
        await user.save();

        res.json({
            success: true,
            message: 'Stock removed from watchlist'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove from watchlist',
            error: error.message
        });
    }
});

export default router;
