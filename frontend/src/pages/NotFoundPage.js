import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">404 Sayfa Bulunamadı</h2>
      <p>Aradığınız sayfa mevcut değil.</p>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
        onClick={() => navigate('/')}
      >
        Anasayfaya Dön
      </button>
    </div>
  );
}

export default NotFoundPage;
