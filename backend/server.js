require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const os = require('os');

const app = express();

// Trust the first proxy (Vercel/Nginx) to get the real client IP
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;
const SERVER_NAME = process.env.SERVER_NAME || os.hostname();

// 1. Connect to MongoDB (Using the Secret injected by GitHub Actions)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(`[${SERVER_NAME}] Successfully connected to MongoDB Atlas!`))
  .catch((err) => console.error(`[${SERVER_NAME}] MongoDB connection error:`, err));

// 2. Create the Database Schema
const clickSchema = new mongoose.Schema({
    serverHandled: String,
    timestamp: { type: Date, default: Date.now }
});
const Click = mongoose.model('Click', clickSchema);

// 3. Your Custom Rate Limiter (Set to 9 so it triggers before Nginx's 10)
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 9, 
    message: {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again in a minute.",
        server: SERVER_NAME
    },
    standardHeaders: true, 
    legacyHeaders: false, 
});

app.use('/api', limiter);

// 4. The API Route
app.get('/api/data', async (req, res) => {
    try {
        // Save the click event to MongoDB
        const newClick = new Click({ serverHandled: SERVER_NAME });
        await newClick.save();

        // Count total clicks
        const totalClicks = await Click.countDocuments();

        res.json({
            message: "Successfully fetched data AND saved to database!",
            server: SERVER_NAME,
            totalGlobalClicks: totalClicks,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: "Database operation failed" });
    }
});

app.listen(PORT, () => {
    console.log(`Server [${SERVER_NAME}] is running on port ${PORT}`);
});