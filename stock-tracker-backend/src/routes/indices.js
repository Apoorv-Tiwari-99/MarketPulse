import express from 'express';
import { getMultipleStocks, INDIAN_INDICES } from '../utils/stockData.js';

const router = express.Router();

// Get all indices
router.get('/', async (req, res) => {
    try {
        const symbols = Object.keys(INDIAN_INDICES);
        const indices = await getMultipleStocks(symbols);
        
        // Add index names and filter out null values
        const validIndices = indices
            .filter(index => index !== null)
            .map(index => ({
                ...index,
                indexName: INDIAN_INDICES[index.symbol] || 'N/A'
            }));

        res.json({
            success: true,
            data: validIndices
        });
    } catch (error) {
        console.error('Error fetching indices:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch indices',
            error: error.message
        });
    }
});

export default router;