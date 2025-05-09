import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProfilePage from './pages/Profile';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import NotFoundPage from './pages/NotFoundPage';
import Home from './pages/Home';
import HomePage from "./pages/HomePage"; // HomePage component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
         <Route path="/home" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} /> {/* 404 yönlendirmesi */}
      </Routes>
    </Router>
  );
}

export default App;
