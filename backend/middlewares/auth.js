// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // doğru yoldan import et

module.exports = async function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Yetki yok." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "E-posta doğrulaması yapılmamış." });
    }

    // Kullanıcıyı konsola yazdırıyoruz
    console.log("Auth middleware çalıştı! Kullanıcı verisi:", user);
    
    req.user = user; // Kullanıcıyı request objesine ekliyoruz
    next();
  } catch (err) {
    console.error("Auth middleware hatası:", err); // Hata konsola yazdırılıyor
    res.status(403).json({ message: "Geçersiz token." });
  }
};

