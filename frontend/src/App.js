import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProfilePage from './pages/Profile';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import NotFoundPage from './pages/NotFoundPage';
import Home from './pages/Home';
import HomePage from "./pages/HomePage"; // HomePage component
import MovieDetailPage from "./pages/MovieDetailPage"; // MovieDetailPage component
import TvDetailPage from "./pages/TvDetailPage"; // MovieDetailPage component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
         <Route path="/home" element={<HomePage />} />
         <Route path="/movie/:id" element={<MovieDetailPage />} />
         <Route path="/tv/:id" element={<TvDetailPage />} />
        <Route path="*" element={<NotFoundPage />} /> {/* 404 yönlendirmesi */}
      </Routes>
    </Router>
  );
}

export default App;
