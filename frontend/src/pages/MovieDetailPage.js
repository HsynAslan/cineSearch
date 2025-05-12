import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/MovieDetailPage.css'

// API base URL'ini tanımla
const API_BASE_URL = 'http://localhost:5000/api/tmdb';

const MovieDetailPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
// Get token from localStorage
const token = localStorage.getItem("token");
  // Fetch movie details
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        
        // Movie details için doğru endpoint kullanılıyor
        const response = await axios.get(`${API_BASE_URL}/movie/${id}`);
        setMovie(response.data);
        
        // Videos için ayrı istek
        const videosResponse = await axios.get(`${API_BASE_URL}/movie/${id}/videos`);
        setVideos(videosResponse.data);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  // Check if movie is in user's lists
 const checkUserLists = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Kullanıcı oturum açmamış. Token bulunamadı.");
    return;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/check-lists/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setIsFavorite(response.data.favorite);
    setIsInWishlist(response.data.wishlist);
  } catch (err) {
    console.error("Error checking user lists:", err);
  }
};


 // Toggle favorite status
const toggleFavorite = async () => {
  if (!token) {
    console.error("Kullanıcı oturum açmamış. Token bulunamadı.");
    return;
  }

  try {
    if (isFavorite) {
      await axios.delete(`${API_BASE_URL}/favorites/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      await axios.post(`${API_BASE_URL}/favorites/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    setIsFavorite(!isFavorite);
  } catch (err) {
    console.error("Error toggling favorite:", err);
  }
};

// Toggle wishlist status
const toggleWishlist = async () => {
  if (!token) {
    console.error("Kullanıcı oturum açmamış. Token bulunamadı.");
    return;
  }

  try {
    if (isInWishlist) {
      await axios.delete(`${API_BASE_URL}/wishlist/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      await axios.post(`${API_BASE_URL}/wishlist/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    setIsInWishlist(!isInWishlist);
  } catch (err) {
    console.error("Error toggling wishlist:", err);
  }
};

  useEffect(() => {
    checkUserLists();
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!movie) return <div className="not-found">Movie not found</div>;

  // Find the official trailer
  const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');

  return (
    <div className="movie-detail-container">
      <div className="movie-header">
        <div className="movie-poster">
          <img 
            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder-poster.jpg'} 
            alt={movie.title} 
          />
        </div>
        <div className="movie-info">
          <h1>{movie.title} ({movie.release_date && new Date(movie.release_date).getFullYear()})</h1>
          
          <div className="movie-meta">
            {movie.runtime && <span>{movie.runtime} min</span>}
            {movie.vote_average && (
              <>
                <span>|</span>
                <span>{movie.vote_average}/10 ({movie.vote_count} votes)</span>
              </>
            )}
            {movie.genres?.length > 0 && (
              <>
                <span>|</span>
                <span>{movie.genres.map(genre => genre.name).join(', ')}</span>
              </>
            )}
          </div>
          
          <div className="movie-actions">
            <button 
              onClick={toggleFavorite} 
              className={isFavorite ? 'active' : ''}
            >
              {isFavorite ? '★ Favorited' : '☆ Add to Favorites'}
            </button>
            <button 
              onClick={toggleWishlist} 
              className={isInWishlist ? 'active' : ''}
            >
              {isInWishlist ? '✓ In Wishlist' : '+ Add to Wishlist'}
            </button>
          </div>
          
          <h2>Overview</h2>
          <p>{movie.overview || 'No overview available.'}</p>
          
          <div className="movie-details">
            {movie.release_date && (
              <div>
                <h3>Release Date</h3>
                <p>{new Date(movie.release_date).toLocaleDateString()}</p>
              </div>
            )}
            {movie.budget > 0 && (
              <div>
                <h3>Budget</h3>
                <p>${movie.budget.toLocaleString()}</p>
              </div>
            )}
            {movie.revenue > 0 && (
              <div>
                <h3>Revenue</h3>
                <p>${movie.revenue.toLocaleString()}</p>
              </div>
            )}
            {movie.status && (
              <div>
                <h3>Status</h3>
                <p>{movie.status}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {trailer && (
        <div className="movie-trailer">
          <h2>Trailer</h2>
          <div className="video-container">
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${trailer.key}`}
              title={`${movie.title} Trailer`}
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      <div className="movie-additional-info">
        {movie.production_companies?.length > 0 && (
          <div className="production-companies">
            <h3>Production Companies</h3>
            <div className="companies-list">
              {movie.production_companies.map(company => (
                <div key={company.id} className="company">
                  {company.logo_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w200${company.logo_path}`} 
                      alt={company.name}
                    />
                  ) : (
                    <span>{company.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {movie.production_countries?.length > 0 && (
          <div className="production-countries">
            <h3>Production Countries</h3>
            <p>{movie.production_countries.map(country => country.name).join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailPage;