const express = require('express');
const fetch = require('node-fetch'); // Used for making requests to Freesound
const app = express();
require('dotenv').config(); // Allows use of environment variables

const PORT = process.env.PORT || 3000; // Heroku assigns a port dynamically
const API_KEY = process.env.FREESOUND_API_KEY; // Store your API key in an environment variable

// Middleware to allow cross-origin requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Route to search for sounds
app.get('/api/search', async (req, res) => {
    const query = req.query.q; // Frontend passes the query in the URL
    const url = `https://freesound.org/apiv2/search/text/?query=${query}&token=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching from Freesound API:', error);
        res.status(500).json({ error: 'Failed to fetch data from Freesound' });
    }
});

// Serve static files (your frontend code)
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
