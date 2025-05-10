// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // doğru yoldan import et

module.exports = async function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Yetki yok." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    if (!user.isVerified) {
      return res.status(403).json({ message: "E-posta doğrulaması yapılmamış." });
    }

    req.user = user; // tüm kullanıcıyı attach ediyoruz
    next();
  } catch (err) {
    res.status(403).json({ message: "Geçersiz token." });
  }
};
