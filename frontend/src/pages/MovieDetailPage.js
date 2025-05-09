import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/MovieDetailPage.css';
const baseURL = process.env.REACT_APP_API_BASE_URL;
function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    axios.get(`${baseURL}/api/tmdb/movie/details/${id}`)

      .then(res => setMovie(res.data))
      .catch(err => console.error('Detay getirme hatası:', err));
  }, [id]);

  const handleFavorite = () => {
    const userId = localStorage.getItem('userId');
    axios.post('${baseURL}/api/tmdb/movie/favorite', { movieId: id, userId })
      .then(() => alert('Favorilere eklendi'))
      .catch(err => console.error('Favorilere ekleme hatası:', err));
  };

  const handleLike = () => {
    const userId = localStorage.getItem('userId');
    axios.post('${baseURL}/api/tmdb/movie/like', { movieId: id, userId })
      .then(() => alert('Beğenildi'))
      .catch(err => console.error('Beğenme hatası:', err));
  };

  const handleWishlist = () => {
    const userId = localStorage.getItem('userId');
    axios.post('${baseURL}/api/tmdb/movie/wishlist', { movieId: id, userId })
      .then(() => alert('İstek listesine eklendi'))
      .catch(err => console.error('İstek listesi hatası:', err));
  };

  if (!movie) return <div className="loading">Yükleniyor...</div>;

  return (
    <div className="detail-container">
      <div className="detail-poster">
        <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title || movie.name} />
      </div>
      <div className="detail-info">
        <h1>{movie.title || movie.name}</h1>
        <p><strong>Özet:</strong> {movie.overview}</p>
        <p><strong>IMDB:</strong> {movie.vote_average}</p>

        <div className="detail-buttons">
          <button onClick={handleFavorite}>❤️ Favori</button>
          <button onClick={handleLike}>👍 Beğen</button>
          <button onClick={handleWishlist}>⭐ İstek Listesi</button>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailPage;
