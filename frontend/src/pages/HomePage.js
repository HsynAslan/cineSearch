import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/HomePage.css'
function HomePage() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [movieResults, setMovieResults] = useState([]);
  const [tvResults, setTvResults] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); // Eğer giriş yapılmamışsa login sayfasına yönlendir
    } else {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Popüler Filmleri Al
    axios.get('http://localhost:5000/api/popular/movies')
      .then(response => setPopularMovies(response.data))
      .catch(error => console.error('Error fetching popular movies:', error));
  }, []);

  // Film ve dizi arama işlemi
  const handleSearch = async () => {
    if (searchQuery) {
      try {
       const movieResponse = await axios.get(`http://localhost:5000/api/search/movies?query=${searchQuery}`);
const tvResponse = await axios.get(`http://localhost:5000/api/search/tv?query=${searchQuery}`);

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
    setSelectedMovie(movie);
  };

  const closePopup = () => {
    setSelectedMovie(null);
  };

  return (
    <div className="home-page">
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="home-content">
          <h2>Hoşgeldiniz!</h2>
          <p>Başarılı bir şekilde giriş yaptınız.</p>

          {/* Kayan Film Listesi */}
          <div className="carousel-container">
            {popularMovies.map((movie) => (
              <div className="carousel-item" key={movie.id} onClick={() => openMovieDetails(movie)}>
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                />
                <p>{movie.title}</p>
              </div>
            ))}
          </div>

          {/* Arama Çubuğu */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Film veya Dizi Ara"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Ara</button>
          </div>

          {/* Arama Sonuçları */}
          <div className="results">
            {movieResults.map((movie) => (
              <li key={movie.id} onClick={() => openMovieDetails(movie)}>
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                />
                <p>{movie.title}</p>
              </li>
            ))}
          </div>

          {/* Çıkış Yap Butonu */}
          <button onClick={handleLogout} className="btn-logout">
            Çıkış Yap
          </button>

          {/* Film Detay Popup */}
          {selectedMovie && (
            <div className="popup open">
              <img
                src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
                alt={selectedMovie.title}
              />
              <div className="popup-content">
                <h3>{selectedMovie.title}</h3>
                <p>{selectedMovie.overview}</p>
                <button onClick={closePopup}>Kapat</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HomePage;
