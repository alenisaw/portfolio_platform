const express = require('express');
const axios = require('axios');
const router = express.Router();

// NewsAPI integration
router.get('/news', async (req, res) => {
  try {
    const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWSAPI_KEY}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Error fetching news');
  }
});

// Unsplash integration for portfolio images
router.get('/unsplash', async (req, res) => {
  try {
    const response = await axios.get(`https://api.unsplash.com/photos?client_id=${process.env.UNSPLASH_ACCESS_KEY}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Error fetching images');
  }
});

module.exports = router;
