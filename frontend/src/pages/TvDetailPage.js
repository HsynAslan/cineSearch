import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/MovieDetailPage.css'; // You can reuse the same CSS or create a TvDetailPage.css if needed

const API_BASE_URL = 'https://cinesearch-backend-1h9k.onrender.com/api/tmdb';

const TvDetailPage = () => {
  const { id } = useParams();
  const [tvShow, setTvShow] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(null);
  const mediaType = 'tv'; // Fixed as 'tv' for this page

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Fetch TV show details
  useEffect(() => {
    const fetchTvShowDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/tv/${id}`);
        setTvShow(response.data);

        const videosResponse = await axios.get(`${API_BASE_URL}/tv/${id}/videos`);
        setVideos(videosResponse.data);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTvShowDetails();
  }, [id]);

  // Check if TV show is in user's lists
useEffect(() => {
  if (token && tvShow) {
    checkUserLists();
  }
}, [token, id, tvShow]);


const checkUserLists = async () => {
  if (!token) {
    console.error("Token bulunamadı.");
    return;
  }

  console.log("Token gönderiliyor:", token); // Token'ı kontrol et

  try {
    const response = await axios.get(`${API_BASE_URL}/check-lists/tv/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("API cevabı:", response.data);
    setIsFavorite(response.data.isFavorite);
    setIsInWishlist(response.data.isInWishlist);
  } catch (err) {
    console.error("API isteği sırasında hata oluştu:", err);
  }
};


const toggleFavorite = async () => {
  if (!token) {
    console.error("Kullanıcı oturum açmamış.");
    return;
  }

  try {
    const url = `${API_BASE_URL}/favorites/${id}`;
    const headers = { Authorization: `Bearer ${token}` };
    const payload = { type: "tv" };

    if (isFavorite) {
      await axios.delete(url, {
        headers,
        data: payload, // 'params' yerine 'data' kullanıyoruz
      });
      setIsFavorite(false);
    } else {
      await axios.post(url, payload, { headers });
      setIsFavorite(true);
    }
  } catch (err) {
    console.error("Favori güncellenirken hata oluştu:", err);
  }
};


  const toggleWishlist = async () => {
    if (!token) {
      console.error("Kullanıcı oturum açmamış. Token bulunamadı.");
      return;
    }

    try {
      if (isInWishlist) {
        await axios.delete(`${API_BASE_URL}/wishlist/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { type: 'tv' },
        });
      } else {
        await axios.post(
          `${API_BASE_URL}/wishlist/${id}`,
          { type: 'tv' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setIsInWishlist(!isInWishlist);
    } catch (err) {
      console.error("İstek listesi durumu değiştirilemedi:", err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!tvShow) return <div className="not-found">TV show not found</div>;

  // Find the official trailer
  const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');

  // Format date range for TV show
  const formatDateRange = () => {
    if (!tvShow.first_air_date) return '';
    const startYear = new Date(tvShow.first_air_date).getFullYear();
    if (!tvShow.last_air_date || tvShow.status === 'Returning Series') {
      return `${startYear} - Present`;
    }
    const endYear = new Date(tvShow.last_air_date).getFullYear();
    return `${startYear} - ${endYear}`;
  };

  // Format episode runtime
  const formatRuntime = () => {
    if (!tvShow.episode_run_time || tvShow.episode_run_time.length === 0) return '';
    const runtime = tvShow.episode_run_time[0];
    return `${runtime} min per episode`;
  };

  // Format seasons information
  const formatSeasons = () => {
    if (!tvShow.number_of_seasons) return '';
    return `${tvShow.number_of_seasons} season${tvShow.number_of_seasons !== 1 ? 's' : ''}, 
            ${tvShow.number_of_episodes} episode${tvShow.number_of_episodes !== 1 ? 's' : ''}`;
  };

  return (
    <div className="movie-detail-container">
      <div className="movie-header">
        <div className="movie-poster">
          <img 
            src={tvShow.poster_path ? `https://image.tmdb.org/t/p/w500${tvShow.poster_path}` : '/placeholder-poster.jpg'} 
            alt={tvShow.name} 
          />
        </div>
        <div className="movie-info">
          <h1>{tvShow.name} ({formatDateRange()})</h1>
          
          <div className="movie-meta">
            {formatRuntime() && <span>{formatRuntime()}</span>}
            {tvShow.vote_average && (
              <>
                <span>|</span>
                <span>{tvShow.vote_average}/10 ({tvShow.vote_count} votes)</span>
              </>
            )}
            {tvShow.genres?.length > 0 && (
              <>
                <span>|</span>
                <span>{tvShow.genres.map(genre => genre.name).join(', ')}</span>
              </>
            )}
            {formatSeasons() && (
              <>
                <span>|</span>
                <span>{formatSeasons()}</span>
              </>
            )}
          </div>
          
          <div className="movie-actions">
          {isFavorite !== null && (
  <button
    onClick={toggleFavorite}
    className={isFavorite ? 'active' : ''}
  >
    {isFavorite ? 'Favoriden Çıkar' : 'Favoriye Ekle'}
  </button>
)}



            <button 
              onClick={toggleWishlist} 
              className={isInWishlist ? 'active' : ''}
            >
              {isInWishlist ? '✓ In Wishlist' : '+ Add to Wishlist'}
            </button>
          </div>
          
          <h2>Overview</h2>
          <p>{tvShow.overview || 'No overview available.'}</p>
          
          <div className="movie-details">
            {tvShow.first_air_date && (
              <div>
                <h3>First Air Date</h3>
                <p>{new Date(tvShow.first_air_date).toLocaleDateString()}</p>
              </div>
            )}
            
            {tvShow.last_air_date && (
              <div>
                <h3>Last Air Date</h3>
                <p>{new Date(tvShow.last_air_date).toLocaleDateString()}</p>
              </div>
            )}
            
            {tvShow.status && (
              <div>
                <h3>Status</h3>
                <p>{tvShow.status}</p>
              </div>
            )}
            
            {tvShow.networks?.length > 0 && (
              <div>
                <h3>Networks</h3>
                <p>{tvShow.networks.map(network => network.name).join(', ')}</p>
              </div>
            )}
            
            {tvShow.created_by?.length > 0 && (
              <div>
                <h3>Created By</h3>
                <p>{tvShow.created_by.map(creator => creator.name).join(', ')}</p>
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
              title={`${tvShow.name} Trailer`}
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      <div className="movie-additional-info">
        {tvShow.production_companies?.length > 0 && (
          <div className="production-companies">
            <h3>Production Companies</h3>
            <div className="companies-list">
              {tvShow.production_companies.map(company => (
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

        {tvShow.production_countries?.length > 0 && (
          <div className="production-countries">
            <h3>Production Countries</h3>
            <p>{tvShow.production_countries.map(country => country.name).join(', ')}</p>
          </div>
        )}
        
        {tvShow.seasons?.length > 0 && (
          <div className="seasons-section">
            <h3>Seasons</h3>
            <div className="seasons-list">
              {tvShow.seasons.map(season => (
                <div key={season.id} className="season-item">
                  <img 
                    src={season.poster_path ? `https://image.tmdb.org/t/p/w200${season.poster_path}` : '../videos/no-poster.jpg'} 
                    alt={`Season ${season.season_number}`}
                  />
                  <div className="season-info">
                    <h4>{season.name}</h4>
                    <p>{season.episode_count} episodes</p>
                    <p>Air Date: {season.air_date || 'Unknown'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TvDetailPage;