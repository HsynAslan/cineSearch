import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Eğer token yoksa, login sayfasına yönlendir
      navigate('/login');
    } else {
      // Token varsa, loading işlemini durdur
      setLoading(false);
      // Token'ı konsola yazdır
      console.log("Kullanıcı Giriş Yapmış. Token:", token);
    }
  }, [navigate]);

  // Çıkış yapma fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem('token'); // Token'ı sil
    navigate('/login'); // Login sayfasına yönlendir
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div> // Yükleniyor mesajı
      ) : (
        <div>
          <h2>Hoşgeldiniz!</h2>
          {/* HomePage içeriği */}
          <button onClick={handleLogout} className="btn-logout">
            Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
}

export default HomePage;
