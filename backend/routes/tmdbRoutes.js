const express = require('express');
const axios = require('axios');
const router = express.Router();

// .env dosyasındaki API anahtarını almak
const apiKey = process.env.TMDB_API_KEY; // API anahtarını .env'den alıyoruz
const apiUrl = 'https://api.themoviedb.org/3';

// Film arama endpoint'i
router.get('/search/movies', async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).send('Query param "query" is required');
  }

  try {
    const response = await axios.get(`${apiUrl}/search/movie`, {
      params: {
        api_key: apiKey,
        query: query,
      },
    });

    if (response.data.results.length === 0) {
      return res.status(404).send('No movies found');
    }

    res.json(response.data.results);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).send('Error fetching movies');
  }
});

// Dizi arama endpoint'i
router.get('/search/tv', async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).send('Query param "query" is required');
  }

  try {
    const response = await axios.get(`${apiUrl}/search/tv`, {
      params: {
        api_key: apiKey,
        query: query,
      },
    });

    if (response.data.results.length === 0) {
      return res.status(404).send('No TV shows found');
    }

    res.json(response.data.results);
  } catch (error) {
    console.error('Error fetching TV shows:', error);
    res.status(500).send('Error fetching TV shows');
  }
});


// Popüler Filmleri Al
router.get('/popular/movies', async (req, res) => {
  try {
    const response = await axios.get(`${apiUrl}/movie/popular`, {
      params: {
        api_key: apiKey,
      },
    });
    res.json(response.data.results);
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    res.status(500).send('Error fetching popular movies');
  }
});

module.exports = router;
