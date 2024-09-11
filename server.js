const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');  // Import CORS
const app = express();

//app.use(cors());  // Enable CORS for all routes
app.use(cors({
  origin: 'https://thomashaighton.com'  // Replace with your frontend domain
}));


// Your API key from the .env file
require('dotenv').config();
const API_KEY = process.env.FREESOUND_API_KEY;

// Define the /api/search endpoint
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



