const express = require('express');
const axios = require('axios');
const router = express.Router();
const auth = require("../middlewares/auth");
const User = require("../models/User");
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
// Beğenilen Filmleri Al
router.get('/account/favorite/movies', async (req, res) => {
  const userId = req.user.id;  // Kullanıcı ID'sini almak için kimlik doğrulama yapın
  try {
    const response = await axios.get(`${apiUrl}/account/${userId}/favorite/movies`, {
      params: { api_key: apiKey },
    });
    res.json(response.data.results);
  } catch (error) {
    console.error('Error fetching favorite movies:', error);
    res.status(500).send('Error fetching favorite movies');
  }
});

// Film Detayları Al
router.get('/movie/details/:id', async (req, res) => {
  const movieId = req.params.id;
  try {
    const response = await axios.get(`${apiUrl}/movie/${movieId}`, {
      params: { api_key: apiKey },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).send('Error fetching movie details');
  }
});
// Favori Ekleme (MongoDB tabanlı)
router.post('/movie/favorite', async (req, res) => {
  const { movieId, userId } = req.body;

  if (!movieId || !userId) {
    return res.status(400).send('MovieId ve userId gereklidir.');
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('Kullanıcı bulunamadı.');

    if (user.favorites.includes(movieId)) {
      return res.status(400).send('Film zaten favorilere eklenmiş.');
    }

    user.favorites.push(movieId);
    await user.save();
    res.status(200).send('Film favorilere eklendi.');
  } catch (error) {
    console.error('Favori ekleme hatası:', error);
    res.status(500).send('Favori ekleme sırasında bir hata oluştu.');
  }
});

// İstek Listesine Ekleme (Wishlist)
router.post('/movie/wishlist', async (req, res) => {
  const { movieId, userId } = req.body;

  if (!movieId || !userId) {
    return res.status(400).send('MovieId ve userId gereklidir.');
  }

  try {
    // Kullanıcı ID'sine ait veritabanına film ekleme işlemi
    // Burada kullanıcı modeline uygun veritabanı işlemi yapılmalı (Örnek MongoDB)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('Kullanıcı bulunamadı.');
    }

    // Eğer film zaten istek listesinde varsa, tekrar eklemeyelim
    if (user.wishlist.includes(movieId)) {
      return res.status(400).send('Film zaten istek listesine eklenmiş.');
    }

    user.wishlist.push(movieId); // Film ID'sini istek listesine ekle
    await user.save(); // Değişiklikleri kaydet

    res.status(200).send('Film istek listesine eklendi.');
  } catch (error) {
    console.error('İstek listesine eklerken hata:', error);
    res.status(500).send('İstek listesine eklerken bir hata oluştu.');
  }
});
// Beğenme (Like) Ekleme
router.post('/movie/like', async (req, res) => {
  const { movieId, userId } = req.body;

  if (!movieId || !userId) {
    return res.status(400).send('MovieId ve userId gereklidir.');
  }

  try {
    // Kullanıcı ID'sine ait veritabanına film ekleme işlemi
    // Burada kullanıcı modeline uygun veritabanı işlemi yapılmalı (Örnek MongoDB)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('Kullanıcı bulunamadı.');
    }

    // Eğer film zaten beğenilmişse, tekrar beğenmesin
    if (user.likes.includes(movieId)) {
      return res.status(400).send('Film zaten beğenildi.');
    }

    user.likes.push(movieId); // Film ID'sini beğenilere ekle
    await user.save(); // Değişiklikleri kaydet

    res.status(200).send('Film beğenildi.');
  } catch (error) {
    console.error('Beğenme işlemi sırasında hata:', error);
    res.status(500).send('Beğenme işlemi sırasında bir hata oluştu.');
  }
});

// GET /api/user/check-lists/:movieId
router.get("/check-lists/:movieId", auth, async (req, res) => {
  const movieId = req.params.movieId;
  const user = req.user;

  const isFavorite = user.favorites.includes(movieId);
  const isInWishlist = user.wishlist.includes(movieId);

  res.json({
    favorite: isFavorite,
    wishlist: isInWishlist,
  });
});

// ✅ Favori Ekle
router.post("/favorites/:movieId", auth, async (req, res) => {
  const movieId = req.params.movieId;
  const user = req.user;

  if (user.favorites.includes(movieId)) {
    return res.status(400).json({ message: "Film zaten favorilere eklenmiş." });
  }

  user.favorites.push(movieId);
  await user.save();
  res.json({ message: "Favorilere eklendi." });
});

// ❌ Favoriden Kaldır
router.delete("/favorites/:movieId", auth, async (req, res) => {
  const movieId = req.params.movieId;
  const user = req.user;

  user.favorites = user.favorites.filter(id => id !== movieId);
  await user.save();
  res.json({ message: "Favorilerden kaldırıldı." });
});

// ✅ Wishlist Ekle
router.post("/wishlist/:movieId", auth, async (req, res) => {
  const movieId = req.params.movieId;
  const user = req.user;

  if (user.wishlist.includes(movieId)) {
    return res.status(400).json({ message: "Film zaten istek listesinde." });
  }

  user.wishlist.push(movieId);
  await user.save();
  res.json({ message: "İstek listesine eklendi." });
});

// ❌ Wishlist'ten Kaldır
router.delete("/wishlist/:movieId", auth, async (req, res) => {
  const movieId = req.params.movieId;
  const user = req.user;

  user.wishlist = user.wishlist.filter(id => id !== movieId);
  await user.save();
  res.json({ message: "İstek listesinden kaldırıldı." });
});

module.exports = router;
