import { useState, useEffect, useRef } from 'react';
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
  const carouselRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Kullanıcı oturum kontrolü
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      setLoading(false);
    }
  }, [navigate]);

  // Popüler filmleri çekme
  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tmdb/popular/movies');
        setPopularMovies(response.data);
      } catch (error) {
        console.error('Error fetching popular movies:', error);
      }
    };
    
    fetchPopularMovies();
  }, []);

  // Otomatik kaydırma efekti
  useEffect(() => {
    if (!popularMovies.length || isHovered || isScrolling) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        const isEnd = scrollLeft + clientWidth >= scrollWidth - 50;
        
        if (isEnd) {
          // Sona gelindiğinde başa dön
          carouselRef.current.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          // Normal kaydırma
          carouselRef.current.scrollBy({
            left: 300,
            behavior: 'smooth'
          });
        }
      }
    }, 3000); // 3 saniyede bir kaydır

    return () => clearInterval(interval);
  }, [popularMovies.length, isHovered, isScrolling]);

  // Elle kaydırma fonksiyonları
  const scrollCarousel = (direction) => {
    setIsScrolling(true);
    
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      carouselRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }

    // 1 saniye sonra tekrar otomatik kaydırmayı etkinleştir
    setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  // Arama fonksiyonu
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Lütfen arama yapmak için bir şeyler yazın');
      return;
    }
    
    try {
      const [movieResponse, tvResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/tmdb/search/movies?query=${searchQuery}`),
        axios.get(`http://localhost:5000/api/tmdb/search/tv?query=${searchQuery}`)
      ]);
      
      setMovieResults(movieResponse.data);
      setTvResults(tvResponse.data);
      
      // Sonuçlara otomatik scroll
      setTimeout(() => {
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
      
    } catch (error) {
      console.error('Error searching:', error);
      alert('Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Çıkış fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Film/detay sayfasına yönlendirme
  const openMovieDetails = (item) => {
    const mediaType = item.title ? 'movie' : 'tv';
    navigate(`/${mediaType}/${item.id}`);
  };

  // Enter tuşu ile arama
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Carousel hover durumu
  const handleCarouselHover = (hoverState) => {
    setIsHovered(hoverState);
  };

  return (
    <div className="home-page">
      {/* Arkaplan videosu */}
      <div className="video-background">
        <video autoPlay muted loop playsInline>
          <source src="/videos/background.mp4" type="video/mp4" />
        </video>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      ) : (
        <div className="home-content">
          {/* Başlık ve hoşgeldin mesajı */}
          <h2>CineSearch</h2>
          <p>Binlerce film ve dizi keşfetmeye hazır olun</p>

          {/* Popüler filmler carousel */}
          <div 
            className="carousel-wrapper"
            onMouseEnter={() => handleCarouselHover(true)}
            onMouseLeave={() => handleCarouselHover(false)}
          >
            <div className="carousel-container" ref={carouselRef}>
              {popularMovies.map((movie) => (
                <div 
                  className="carousel-item" 
                  key={movie.id} 
                  onClick={() => openMovieDetails(movie)}
                >
                  <img 
                    src={
                      movie.poster_path 
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : '/images/no-poster.jpg'
                    } 
                    alt={movie.title} 
                    onError={(e) => {
                      e.target.src = '/images/no-poster.jpg';
                    }}
                  />
                  <p>{movie.title}</p>
                  <span className="rating">{movie.vote_average?.toFixed(1)}</span>
                </div>
              ))}
            </div>
            <div className="carousel-nav">
              <button onClick={() => scrollCarousel('left')} aria-label="Önceki">
                &lt;
              </button>
              <button onClick={() => scrollCarousel('right')} aria-label="Sonraki">
                &gt;
              </button>
            </div>
          </div>

          {/* Arama bölümü */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Film veya dizi adı girin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={handleSearch} aria-label="Ara">
              <i className="fas fa-search"></i> Ara
            </button>
          </div>

          {/* Arama sonuçları */}
          {(movieResults.length > 0 || tvResults.length > 0) && (
            <div className="results-section">
              {/* Film sonuçları */}
              {movieResults.length > 0 && (
                <div className="results-category">
                  <h3 className="results-title">Film Sonuçları ({movieResults.length})</h3>
                  <div className="results-grid">
                    {movieResults.map((movie) => (
                      <div 
                        className="result-item" 
                        key={movie.id} 
                        onClick={() => openMovieDetails(movie)}
                      >
                        <img 
                          src={
                            movie.poster_path 
                              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                              : '/images/no-poster.jpg'
                          } 
                          alt={movie.title}
                          onError={(e) => {
                            e.target.src = '/images/no-poster.jpg';
                          }}
                        />
                        <p>{movie.title}</p>
                        <span className="media-type">Film</span>
                        <span className="rating">{movie.vote_average?.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dizi sonuçları */}
              {tvResults.length > 0 && (
                <div className="results-category">
                  <h3 className="results-title">Dizi Sonuçları ({tvResults.length})</h3>
                  <div className="results-grid">
                    {tvResults.map((tv) => (
                      <div 
                        className="result-item" 
                        key={tv.id} 
                        onClick={() => openMovieDetails(tv)}
                      >
                        <img 
                          src={
                            tv.poster_path 
                              ? `https://image.tmdb.org/t/p/w500${tv.poster_path}`
                              : '/images/no-poster.jpg'
                          } 
                          alt={tv.name}
                          onError={(e) => {
                            e.target.src = '/images/no-poster.jpg';
                          }}
                        />
                        <p>{tv.name}</p>
                        <span className="media-type">Dizi</span>
                        <span className="rating">{tv.vote_average?.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Çıkış butonu */}
          <button onClick={handleLogout} className="btn-logout" aria-label="Çıkış Yap">
            <i className="fas fa-sign-out-alt"></i> Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
}

export default HomePage;