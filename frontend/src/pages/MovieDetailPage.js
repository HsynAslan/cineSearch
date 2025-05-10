import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/MovieDetailPage.css';

const baseURL = process.env.REACT_APP_API_BASE_URL;

function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    axios.get(`${baseURL}/api/tmdb/movie/details/${id}`)
      .then(res => setMovie(res.data))
      .catch(err => console.error('Detay getirme hatası:', err));
  }, [id]);

  const sendAction = async (actionType, successMessage) => {
    try {
      const response = await axios.post(`${baseURL}/api/tmdb/movie/${actionType}`, {
        movieId: id,
        userId,
      });
      alert(successMessage);
    } catch (error) {
      console.error(`${actionType} hatası:`, error.response?.data || error.message);
      alert(`Hata: ${error.response?.data || 'Bir sorun oluştu.'}`);
    }
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
          <button onClick={() => sendAction('favorite', 'Favorilere eklendi')}>❤️ Favori</button>
          <button onClick={() => sendAction('like', 'Beğenildi')}>👍 Beğen</button>
          <button onClick={() => sendAction('wishlist', 'İstek listesine eklendi')}>⭐ İstek Listesi</button>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailPage;
