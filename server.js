const cors = require('cors');
const express = require('express');
const app = express();

app.use(cors());  // Enable CORS for all routes
app.use(express.json());  // Enable JSON parsing for incoming requests

// Define your routes
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    const velden = "url, name, previews";
    const url = `https://freesound.org/apiv2/search/text/?query=${query}&fields=${velden}&token=${process.env.FREESOUND_API_KEY}`;
    
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
