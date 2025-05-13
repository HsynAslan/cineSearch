import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <div className="overlay"></div>
      <div className="home-content">
        <h1 className="home-title">CineSearch'e Hoş Geldiniz</h1>
        <p className="home-subtitle">
          Film ve dizileri keşfet, favorilerine ekle hatta önerilen içeriğini bul ! Şimdi giriş yap ya da kayıt ol!
        </p>
        <div className="home-buttons">
          <Link to="/login" className="home-btn">Giriş Yap</Link>
          <Link to="/register" className="home-btn">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
}
