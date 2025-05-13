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



const updateMovieSuggestions = require("../utils/updateMovieSuggestions"); // üstte tanımlı olmalı
const updateTvSuggestions = require("../utils/updateTvSuggestions");
// ✅ Favori Ekle
router.post("/favorites/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  const user = req.user;

  if (!["movie", "tv"].includes(type)) {
    return res.status(400).json({ message: "Geçersiz içerik türü." });
  }

  const exists = user.favorites.some(item => item.id === id && item.type === type);
  if (exists) {
    return res.status(400).json({ message: "Zaten favorilerde." });
  }

  user.favorites.push({ id, type });
  await user.save();

  try {
    if (type === "movie") {
      await updateMovieSuggestions(user._id.toString(), id);
    } else if (type === "tv") {
      await updateTvSuggestions(user._id.toString(), id);
    }
  } catch (err) {
    console.error("Öneriler güncellenirken hata:", err.message);
    // hata olsa da favori kaydedildiği için 200 dönebilir
  }

  res.json({ message: "Favorilere eklendi." });
});


// ❌ Favoriden Kaldır
router.delete("/favorites/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { type } = req.body; // Burada type'ı body'den alıyoruz.
  const user = req.user;

  if (!type) {
    return res.status(400).json({ message: "Tür belirtilmelidir." });
  }

  user.favorites = user.favorites.filter(item => item.id !== id || item.type !== type);
  await user.save();
  res.json({ message: "Favorilerden kaldırıldı." });
});


// ✅ Wishlist Ekle
router.post("/wishlist/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  const user = req.user;

  if (!["movie", "tv"].includes(type)) {
    return res.status(400).json({ message: "Geçersiz içerik türü." });
  }

  const exists = user.wishlist.some(item => item.id === id && item.type === type);
  if (exists) {
    return res.status(400).json({ message: "Zaten istek listesinde." });
  }

  user.wishlist.push({ id, type });
  await user.save();
  res.json({ message: "İstek listesine eklendi." });
});

// ❌ Wishlist'ten Kaldır
router.delete("/wishlist/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  const user = req.user;

  user.wishlist = user.wishlist.filter(item => item.id !== id || item.type !== type);
  await user.save();
  res.json({ message: "İstek listesinden kaldırıldı." });
});


// Sadece "movie" türünü kontrol eden liste kontrol endpoint'i
router.get("/check-lists/movie/:id", auth, async (req, res) => {
  const { id } = req.params;
  const user = req.user; // JWT doğrulama middleware ile geliyor olmalı

  try {
    console.log("=== MOVIE CHECK ===");
    
    console.log("Kullanıcı ID:", user.id);

    const isFavorite = user.favorites?.some(item => item.id === id && item.type === 'movie');
    const isInWishlist = user.wishlist?.some(item => item.id === id && item.type === 'movie');

    console.log("Favori mi?", isFavorite);
    console.log("İstek listesinde mi?", isInWishlist);

    return res.json({
      isFavorite: !!isFavorite,
      isInWishlist: !!isInWishlist
    });
  } catch (err) {
    console.error("Liste kontrol hatası:", err);
    return res.status(500).json({ message: 'Bir hata oluştu.' });
  }
});

// Sadece "tv" türünü kontrol eden liste kontrol endpoint'i
router.get("/check-lists/tv/:id", auth, async (req, res) => {
  const { id } = req.params;
  const user = req.user; // JWT doğrulama middleware ile geliyor olmalı

  try {
    console.log("=== TV SERIES CHECK ===");
    
    console.log("Kullanıcı ID:", user.id);

    const isFavorite = user.favorites?.some(item => item.id === id && item.type === 'tv');
    const isInWishlist = user.wishlist?.some(item => item.id === id && item.type === 'tv');

    console.log("Favori mi?", isFavorite);
    console.log("İstek listesinde mi?", isInWishlist);

    return res.json({
      isFavorite: !!isFavorite,
      isInWishlist: !!isInWishlist
    });
  } catch (err) {
    console.error("Liste kontrol hatası:", err);
    return res.status(500).json({ message: 'Bir hata oluştu.' });
  }
});


// Test Route
router.get("/test", auth, async (req, res) => {
  console.log("Kullanıcı verisi:", req.user); // Kullanıcı bilgilerini kontrol ediyoruz
  res.json({ message: "Token doğrulandı!" });
});



// Film Fragmanlarını Getir
router.get('/movie/:id/videos', async (req, res) => {
  const movieId = req.params.id;
  try {
    const response = await axios.get(`${apiUrl}/movie/${movieId}/videos`, {
      params: { api_key: apiKey },
    });
    res.json(response.data.results); // içinde YouTube videoları olacak
  } catch (error) {
    console.error('Error fetching movie videos:', error);
    res.status(500).send('Video bilgileri alınamadı.');
  }
});

// TV Show Details
router.get('/tv/:id', async (req, res) => {
  const tvId = req.params.id;
  try {
    const response = await axios.get(`${apiUrl}/tv/${tvId}`, {
      params: { api_key: apiKey }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    res.status(500).send('Error fetching TV show details');
  }
});

// TV Show Videos
router.get('/tv/:id/videos', async (req, res) => {
  const tvId = req.params.id;
  try {
    const response = await axios.get(`${apiUrl}/tv/${tvId}/videos`, {
      params: { api_key: apiKey }
    });
    res.json(response.data.results);
  } catch (error) {
    console.error('Error fetching TV show videos:', error);
    res.status(500).send('Error fetching TV show videos');
  }
});

// Film Detayları ve Fragman Bilgisi (tek bir response)
router.get('/movie/:id', async (req, res) => {
  const movieId = req.params.id;
  if (!movieId) {
    return res.status(400).json({ error: 'Film ID eksik.' });
  }

  try {
    const response = await axios.get(`${apiUrl}/movie/${movieId}`, {
      params: {
        api_key: apiKey,
        language: 'tr-TR'
      }
    });

    res.json(response.data);  // Dönen veriyi doğrudan frontend'e gönder
  } catch (error) {
    console.error('API Hatası:', error);
    res.status(500).json({ error: 'Film detayları alınamadı.' });
  }
});

// Kullanıcının beğendiği filmlere benzer öneriler
// router.get('/similar-based-on-favorites', auth, async (req, res) => {
//   const user = req.user;

//   try {
//     // Kullanıcı modelinden beğendiği filmler alınır
//     const User = require('../models/User');
//     const foundUser = await User.findById(user.id);

//     if (!foundUser || !foundUser.favorites) {
//       return res.json([]);
//     }

//     // Sadece film olanları filtrele (dizi hariç)
//     const favoriteMovies = foundUser.favorites.filter(fav => fav.type === 'movie');

//     const uniqueSimilar = new Map();

//     // Her film için benzer filmleri çek
//     for (const fav of favoriteMovies.slice(0, 3)) {
//       const tmdbRes = await axios.get(`https://api.themoviedb.org/3/movie/${fav.id}/similar`, {
//         params: {
//           api_key: process.env.TMDB_API_KEY,
//           language: 'tr-TR'
//         }
//       });

//       tmdbRes.data.results.forEach(movie => {
//         if (!uniqueSimilar.has(movie.id)) {
//           uniqueSimilar.set(movie.id, movie);
//         }
//       });
//     }

//     res.json(Array.from(uniqueSimilar.values()).slice(0, 10));
//   } catch (err) {
//     console.error('Benzer filmler alınamadı:', err.message);
//     res.status(500).json({ message: 'Benzer filmler alınamadı.' });
//   }
// });

router.get('/suggestions/movies', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.movieSuggestions) {
    return res.json([]);
  }

  try {
    const tmdbIds = user.movieSuggestions.map(s => s.id).slice(0, 10); // ilk 10 öneri
    const movieDetails = [];

    for (const id of tmdbIds) {
      const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
        params: {
          api_key: process.env.TMDB_API_KEY,
          language: 'tr-TR'
        }
      });
      movieDetails.push(response.data);
    }

    res.json(movieDetails);
  } catch (err) {
    console.error("Öneriler alınırken hata:", err.message);
    res.status(500).json({ message: "Öneriler alınamadı." });
  }
});

router.get('/suggestions', auth, async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.movieSuggestions || user.movieSuggestions.length === 0) {
      return res.json([]);
    }

    // En son 15 öneriyi al (son eklenenler)
    const latestSuggestions = user.movieSuggestions
      .slice(0, 15); // İlk 15 öneriyi al

    const movieIds = latestSuggestions.map((item) => item.id);

    const moviePromises = movieIds.map((id) =>
      axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&language=tr-TR`)
    );
    const movieResponses = await Promise.all(moviePromises);
    const suggestedMovies = movieResponses.map((response) => response.data);

    res.json(suggestedMovies);
  } catch (error) {
    console.error('Error fetching suggested movies:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});


// routes/tmdb.js
router.get('/suggestions/tv', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const likedTvIds = user.likes.filter(item => item.type === 'tv').map(item => item.id);

    // Basitçe ilk 3 beğenilen TV show üzerinden öneri üret
    const results = await Promise.all(
      likedTvIds.slice(0, 3).map(async (id) => {
        const response = await axios.get(`https://api.themoviedb.org/3/tv/${id}/recommendations?api_key=${process.env.TMDB_API_KEY}&language=tr-TR`);
        return response.data.results || [];
      })
    );

    const suggestions = results.flat().slice(0, 10); // İlk 10 öneri
    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Öneriler alınamadı' });
  }
});

router.get('/suggestionsTvGet', auth, async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.tvSuggestions || user.tvSuggestions.length === 0) {
      return res.json([]);
    }

    // En son 15 öneriyi al (son eklenenler)
    const latestSuggestions = user.tvSuggestions
      .slice(0, 15); // İlk 15 öneriyi al

    const tvIds = latestSuggestions.map((item) => item.id);

    const tvPromises = tvIds.map((id) =>
      axios.get(`https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.TMDB_API_KEY}&language=tr-TR`)
    );
    const tvResponses = await Promise.all(tvPromises);
    const suggestedTvShows = tvResponses.map((response) => response.data);

    res.json(suggestedTvShows);
  } catch (error) {
    console.error('Error fetching suggested TV shows:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});


router.get('/wishlistGet', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wishlist');
    if (!user) {
      return res.status(404).json({ msg: 'Kullanıcı bulunamadı' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
