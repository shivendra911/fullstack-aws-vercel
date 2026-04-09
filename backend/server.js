const express = require('express');
const rateLimit = require('express-rate-limit');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_NAME = process.env.SERVER_NAME || os.hostname();

// Rate Limiter: 10 requests per minute
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again in a minute.",
        server: SERVER_NAME
    },
    standardHeaders: true, 
    legacyHeaders: false, 
});

app.use('/api', limiter);

app.get('/api/data', (req, res) => {
    res.json({
        message: "Successfully fetched data from the backend!",
        server: SERVER_NAME,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Server [${SERVER_NAME}] is running on port ${PORT}`);
});