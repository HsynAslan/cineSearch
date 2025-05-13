const axios = require("axios");
const User = require("../models/User");

const updateMovieSuggestions = async (userId, newMovieId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const alreadyFavoritedIds = user.favorites
    .filter(fav => fav.type === "movie")
    .map(fav => fav.id);

  const existingSuggestions = user.movieSuggestions.map(s => s.id);

  const res = await axios.get(`https://api.themoviedb.org/3/movie/${newMovieId}/similar`, {
    params: {
      api_key: process.env.TMDB_API_KEY,
      language: "tr-TR"
    }
  });

  const similarMovies = res.data.results;

  for (const movie of similarMovies) {
    const id = movie.id.toString();

    // Favorilerde varsa veya aynı öneri varsa tekrar ekleme
    if (alreadyFavoritedIds.includes(id)) continue;

    const index = user.movieSuggestions.findIndex(s => s.id === id);

    if (index !== -1) {
      // Varsa en başa taşı
      user.movieSuggestions.splice(index, 1);
      user.movieSuggestions.unshift({ id, addedAt: new Date() });
    } else {
      // Maksimum 50 öneri kontrolü
      if (user.movieSuggestions.length >= 50) {
        user.movieSuggestions.pop(); // en sonuncuyu sil
      }
      user.movieSuggestions.unshift({ id, addedAt: new Date() }); // en başa ekle
    }
  }

  await user.save();
};

module.exports = updateMovieSuggestions;
