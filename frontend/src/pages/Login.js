import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Login.css'; // Stil dosyasını import ediyoruz
const baseURL = process.env.REACT_APP_API_BASE_URL;
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state'i ekliyoruz
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Loading başlatılıyor
    try {
      const res = await axios.post('${baseURL}/api/auth/login', { email, password });
      if (res.data.token) { // Token kontrolü yapıyoruz
        localStorage.setItem('token', res.data.token); // Token'ı localStorage'a kaydet
        navigate('/home'); // Başarıyla giriş yaptıktan sonra HomePage'e yönlendir
      } else {
        setError('Geçersiz giriş bilgileri');
      }
    } catch (err) {
      setError('Geçersiz giriş bilgileri');
    } finally {
      setIsLoading(false); // Loading durduruluyor
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Giriş Yap</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta"
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? 'Yükleniyor...' : 'Giriş Yap'}
          </button>
        </form>
        <div className="forgot-password">
          <a href="/forgot-password">Şifremi Unuttum?</a>
        </div>
        <div className="signup-prompt">
          <p>Hesabınız yok mu? <a href="/signup">Kayıt Ol</a></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
