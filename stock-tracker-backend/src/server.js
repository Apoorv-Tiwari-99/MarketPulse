import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import authRoutes from './routes/auth.js';
import stockRoutes from './routes/stocks.js';
import watchlistRoutes from './routes/watchlist.js';
import indexRoutes from './routes/indices.js';

dotenv.config();

const app = express();

// secruity middleware 

app.use(helmet());
app.use(cors());

// Rate limiting 
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15minutes 
    max: 100 // limit each IP to 100 request per windowMS 
});

app.use(limiter);

// Body parsing middleware 

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/indices', indexRoutes);


//  Health check endpoint 
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: "Server is running"
    })
});

// Error handling middleware 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong ",
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});


// Route not found handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not Found",
    });
});


// Database connection 

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("MongoDB connection error", error));


const PORT = process.env.PORT || '5000';
app.listen(PORT, () => {
    console.log(`Server is running on the PORT ${PORT}`);
});


export default app;


