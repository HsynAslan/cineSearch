const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const tmdbRoutes = require('./routes/tmdbRoutes'); // Yeni route'u dahil et
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

// TMDB API Routes
app.use('/api/tmdb', tmdbRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log("Server started on port 5000"));
  })
  .catch(err => console.log(err));
