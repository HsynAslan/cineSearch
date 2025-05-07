import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../css/Register.css'; // CSS dosyasını buraya ekliyoruz

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
      const response = await axios.post("http://localhost:5000/api/auth/register", form);
      setMessage("Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Kayıt başarısız.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Kayıt Ol</h2>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <input
              name="name"
              placeholder="Adınız"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <input
              name="surname"
              placeholder="Soyadınız"
              value={form.surname}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="E-posta"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Şifre"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="date"
              name="birthday"
              value={form.birthday}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
            >
              <option value="Kadın">Kadın</option>
              <option value="Erkek">Erkek</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>
          <button type="submit" className="btn-register">Kayıt Ol</button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
