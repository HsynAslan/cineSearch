const axios = require("axios");
const User = require("../models/User");

const updateTvSuggestions = async (userId, newTvId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const alreadyFavoritedIds = user.favorites
    .filter(fav => fav.type === "tv")
    .map(fav => fav.id);

  const existingSuggestions = user.tvSuggestions.map(s => s.id);

  const res = await axios.get(`https://api.themoviedb.org/3/tv/${newTvId}/similar`, {
    params: {
      api_key: process.env.TMDB_API_KEY,
      language: "tr-TR"
    }
  });

  const similarShows = res.data.results;

  for (const show of similarShows) {
    const id = show.id.toString();

    if (alreadyFavoritedIds.includes(id)) continue;

    const index = user.tvSuggestions.findIndex(s => s.id === id);

    if (index !== -1) {
      user.tvSuggestions.splice(index, 1);
      user.tvSuggestions.unshift({ id, addedAt: new Date() });
    } else {
      if (user.tvSuggestions.length >= 50) {
        user.tvSuggestions.pop();
      }
      user.tvSuggestions.unshift({ id, addedAt: new Date() });
    }
  }

  await user.save();
};

module.exports = updateTvSuggestions;
