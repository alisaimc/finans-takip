const dbConnect = require('./db');
const { Transaction } = require('./models');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "cok_gizli_super_anahtar_123";

// Güvenlik Duvarı (Middleware mantığı) - Token Doğrulama
const authenticate = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Yetkisiz erişim');
  }
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, JWT_SECRET); // Token'ı aç ve içindeki workspaceId'yi ver
};

module.exports = async (req, res) => {
  try {
    await dbConnect();
    
    // 1. Kapıdaki Güvenlik: Bileti kontrol et
    let userContext;
    try {
      userContext = authenticate(req);
    } catch (err) {
      return res.status(401).json({ error: "Lütfen giriş yapın." });
    }

    // 2. GET İsteği: Verileri getir
    if (req.method === 'GET') {
      // MULTI-TENANT SİHRİ BURASI: Sadece token'ın içindeki workspaceId'ye ait verileri çek!
      const transactions = await Transaction.find({ workspaceId: userContext.workspaceId });
      return res.status(200).json(transactions);
    }

    // 3. POST İsteği: Yeni veri ekle
    if (req.method === 'POST') {
      const { amount, type, date, description, categoryId } = req.body;
      
      const newTrans = await Transaction.create({
        amount, type, date, description, categoryId,
        workspaceId: userContext.workspaceId, // Veriyi o kişinin odasına mühürle
        createdBy: userContext.userId
      });
      
      return res.status(201).json(newTrans);
    }

    // 4. DELETE İsteği... vb.

  } catch (error) {
    console.error("İşlem Hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};