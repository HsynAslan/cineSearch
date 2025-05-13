import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/Register.css";

const baseURL = process.env.REACT_APP_API_BASE_URL;

function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    birthday: "",
    gender: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await axios.post(`${baseURL}/api/auth/register`, form);
      setMessage("Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Kayıt başarısız.");
    }
  };

  return (
    <div className="register-page">
      <div className="overlay"></div>
      <div className="register-container">
        <h2>Kayıt Ol</h2>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <form onSubmit={handleSubmit} className="register-form">
          <input name="name" placeholder="Adınız" value={form.name} onChange={handleChange} required />
          <input name="surname" placeholder="Soyadınız" value={form.surname} onChange={handleChange} required />
          <input type="email" name="email" placeholder="E-posta" value={form.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Şifre" value={form.password} onChange={handleChange} required />
          <input type="date" name="birthday" value={form.birthday} onChange={handleChange} placeholder="Doğum Tarihi"/>
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">Cinsiyet Seçin</option>
            <option value="female">Kadın</option>
            <option value="male">Erkek</option>
            <option value="other">Diğer</option>
          </select>
          <button type="submit" className="btn-register">Kayıt Ol</button>
        </form>
        <p className="login-prompt">
          Zaten hesabınız var mı? <a href="/login">Giriş Yap</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
