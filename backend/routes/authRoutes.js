const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const authenticateToken = require("../middlewares/auth");
const authMiddleware = require('../middlewares/auth'); // doğru path'e göre düzenle
const baseURL = process.env.REACT_APP_API_BASE_URL;

router.post("/register", async (req, res) => {
  try {
    const { name, surname, email, password, birthday, gender } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Bu e-posta zaten kayıtlı." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      name,
      surname,
      email,
      password: hashedPassword,
      birthday,
      gender,
      verificationToken,
    });

    await newUser.save();

    const verifyLink = `${baseURL}/api/auth/verify/${verificationToken}`;
    const htmlMessage = `
    <div style="font-family:Arial,sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:10px;">
      <h2 style="color:#333;">Hoş Geldiniz, ${name}!</h2>
      <p>Kaydınız başarıyla alındı. Hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
      <a href="${verifyLink}" style="display:inline-block; margin-top:15px; padding:10px 20px; background-color:#4CAF50; color:white; text-decoration:none; border-radius:5px;">Hesabımı Doğrula</a>
      <p style="margin-top:20px; color:#888;">Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
    </div>
  `;
  

    await sendEmail(email, "E-posta Doğrulama", htmlMessage);

    res.status(201).json({ message: "Kayıt başarılı. Lütfen e-postanızı kontrol edin." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

router.get("/verify/:token", async (req, res) => {
    try {
      const { token } = req.params;
  
      // Token ile eşleşen kullanıcıyı bul
      const user = await User.findOne({ verificationToken: token });
  
      if (!user) {
        return res.status(400).send("Geçersiz veya süresi dolmuş doğrulama bağlantısı.");
      }
  
      // Kullanıcıyı doğrula ve token'ı sil
      user.isVerified = true;  // Kullanıcıyı doğrulama
      user.verificationToken = undefined; // Token'ı bir kez kullandıktan sonra silmek iyi bir uygulamadır
      await user.save();
  
      // Başarılı doğrulama mesajı HTML ile gönder
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Doğrulama Başarılı</title>
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto;">
            <h1 style="color: #4CAF50;">✓ Doğrulama Başarılı</h1>
            <p style="font-size: 18px; color: #333;">Hesabınız başarıyla doğrulandı. Artık giriş yapabilirsiniz.</p>
            <a href="https://cine-search-jade.vercel.app/login" style="color: #4CAF50; font-size: 16px; text-decoration: none;">Giriş Yap</a>
          </div>
        </body>
        </html>
      `);
    } catch (err) {
      console.error(err);
      res.status(500).send("Sunucu hatası.");
    }
  });
  
  
  router.post("/login", async (req, res) => {
    try {
      debugger;
      const { email, password } = req.body;
  
      // Kullanıcıyı e-posta ile bul
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ message: "E-posta veya şifre hatalı." });
      }
  
      // Şifreyi kontrol et
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "E-posta veya şifre hatalı." });
      }
  
      // Kullanıcı doğrulandı mı?
      if (!user.isVerified) {
        return res.status(400).json({ message: "Hesabınız doğrulanmamış. Lütfen e-posta adresinizi kontrol edin." });
      }
  
      // JWT token oluştur
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.status(200).json({ message: "Giriş başarılı", token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Sunucu hatası." });
    }
  });


  router.get("/profile", authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id); // middleware'de `req.user = decoded`
  
      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı." });
      }
  
      res.status(200).json({
        name: user.name,
        surname: user.surname,
        email: user.email,
        birthday: user.birthday,
        gender: user.gender,
        isVerified: user.isVerified,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Sunucu hatası." });
    }
  });


// Backend tarafında `/home` endpoint'inde
router.get("/home", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // Kullanıcı bilgilerini alıyoruz

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Kullanıcıya uygun filmleri burada döndürebiliriz
    res.status(200).json({
      message: "Home Page",
      user: {
        name: user.name,
        favoriteMovies: user.favoriteMovies, // favori filmleri örnek
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

module.exports = router;
