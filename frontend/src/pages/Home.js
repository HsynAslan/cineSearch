import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <h1>CineSearch'e Hoş Geldiniz 🎬</h1>
      <p>Film ve dizileri keşfetmek, puanlamak ve favorilerinizi listelemek için giriş yapın ya da kayıt olun!</p>
      
      <div className="home-buttons">
        <Link to="/login" className="home-btn">Giriş Yap</Link>
        <Link to="/register" className="home-btn">Kayıt Ol</Link>
      </div>
    </div>
  );
}
