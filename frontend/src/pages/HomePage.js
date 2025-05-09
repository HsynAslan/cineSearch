import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/HomePage.css';

function HomePage() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [movieResults, setMovieResults] = useState([]);
  const [tvResults, setTvResults] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/tmdb/popular/movies')
      .then(response => setPopularMovies(response.data))
      .catch(error => console.error('Error fetching popular movies:', error));
  }, []);

  const handleSearch = async () => {
    if (searchQuery) {
      try {
        const movieResponse = await axios.get(`http://localhost:5000/api/tmdb/search/movies?query=${searchQuery}`);
        const tvResponse = await axios.get(`http://localhost:5000/api/tmdb/search/tv?query=${searchQuery}`);
        setMovieResults(movieResponse.data);
        setTvResults(tvResponse.data);
      } catch (error) {
        console.error('Error searching:', error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const openMovieDetails = (movie) => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="home-page">
      <div className="video-background">
        <video autoPlay muted loop playsInline>
          <source src="/videos/background.mp4" type="video/mp4" />
        </video>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="home-content">
          <h2>CineSearch!</h2>
          <p>Başarılı bir şekilde giriş yaptınız.</p>

          <div className="carousel-container">
            {popularMovies.map((movie) => (
              <div className="carousel-item" key={movie.id} onClick={() => openMovieDetails(movie)}>
                <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                <p>{movie.title}</p>
              </div>
            ))}
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Film veya Dizi Ara"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Ara</button>
          </div>

          <div className="results">
            {movieResults.length > 0 && (
              <div>
                <h3>Filmler</h3>
                <ul>
                  {movieResults.map((movie) => (
                    <li key={movie.id} onClick={() => openMovieDetails(movie)}>
                      <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                      <p>{movie.title}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tvResults.length > 0 && (
              <div>
                <h3>Diziler</h3>
                <ul>
                  {tvResults.map((tv) => (
                    <li key={tv.id} onClick={() => openMovieDetails(tv)}>
                      <img src={`https://image.tmdb.org/t/p/w500${tv.poster_path}`} alt={tv.name} />
                      <p>{tv.name}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="btn-logout">Çıkış Yap</button>
        </div>
      )}
    </div>
  );
}

export default HomePage;
