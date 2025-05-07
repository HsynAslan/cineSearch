import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login'); // Eğer token yoksa, kullanıcıyı login sayfasına yönlendir
          return;
        }

        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`, // token ile kimlik doğrulama
          },
        });

        setUser(response.data); // Kullanıcı bilgilerini state'e kaydet
      } catch (err) {
        setError('Profil bilgileri alınırken bir hata oluştu.');
      }
    };

    fetchUserData();
  }, [navigate]);

  if (error) {
    return <div>{error}</div>; // Hata mesajı
  }

  if (!user) {
    return <div>Loading...</div>; // Veri yükleniyor...
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Profil Bilgileri</h2>
      <div className="mb-4">
        <strong>Ad:</strong> {user.name}
      </div>
      <div className="mb-4">
        <strong>Soyad:</strong> {user.surname}
      </div>
      <div className="mb-4">
        <strong>E-posta:</strong> {user.email}
      </div>
      <div className="mb-4">
        <strong>Doğum Tarihi:</strong> {user.birthday}
      </div>
      <div className="mb-4">
        <strong>Cinsiyet:</strong> {user.gender}
      </div>
      <div className="mb-4">
        <strong>Hesap Durumu:</strong> {user.isVerified ? 'Doğrulandı' : 'Doğrulanmadı'}
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => navigate('/logout')}>
        Çıkış Yap
      </button>
    </div>
  );
}

export default ProfilePage;
