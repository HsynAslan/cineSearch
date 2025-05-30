import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Login.css';

const baseURL = process.env.REACT_APP_API_BASE_URL;

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${baseURL}/api/auth/login`, { email, password });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        navigate('/home');
      } else {
        setError('Geçersiz giriş bilgileri');
      }
    } catch (err) {
      setError('Geçersiz giriş bilgileri');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="overlay"></div>
      <div className="login-container">
        <h2>Giriş Yap</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? 'Yükleniyor...' : 'Giriş Yap'}
          </button>
        </form>
        <div className="extra-links">
          
          <p>Hesabınız yok mu? <a href="/register">Kayıt Ol</a></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
