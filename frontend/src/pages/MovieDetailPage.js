import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const MovieDetailPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        // TMDB API key'i backend'e proxy'lenmiş olduğunu varsayıyoruz
        const response = await axios.get(`http://localhost:5000/api/tmdb/movie/${id}`);
        setMovie(response.data.movieDetails);
        setTrailer(response.data.trailer);
        setLoading(false);
      } catch (error) {
        console.error('Film detayları alınamadı:', error);
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (loading) return <p>Yükleniyor...</p>;
  if (!movie) return <p>Film bulunamadı.</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{movie.title}</h1>
      <p>{movie.overview}</p>
      <p><strong>Çıkış Tarihi:</strong> {movie.release_date}</p>
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        style={{ width: '300px', borderRadius: '10px' }}
      />

      {trailer ? (
        <div style={{ marginTop: '2rem' }}>
          <h2>Fragman</h2>
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${trailer.key}`}
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      ) : (
        <p>Fragman bulunamadı.</p>
      )}
    </div>
  );
};

export default MovieDetailPage;
