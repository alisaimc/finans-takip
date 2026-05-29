const dbConnect = require('./db');
const { User } = require('./models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "cok_gizli_super_anahtar_123";

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    await dbConnect();
    const { username, password } = req.body;

    // 1. Kullanıcıyı veritabanında bul
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
    }

    // 2. Şifreyi doğrula
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
    }

    // 3. Başarılıysa Token (JWT) Üret
    // Token'ın içine kullanıcının Workspace ID'sini gömüyoruz! Bu çok kritik.
    const token = jwt.sign(
      { 
        userId: user._id, 
        workspaceId: user.workspaceId, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' } // 7 gün boyunca sistemde açık kalabilir
    );

    // 4. React'a yanıt dön
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        profilePhoto: user.profilePhoto
      }
    });

  } catch (error) {
    console.error("Giriş Hatası:", error);
    return res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
};