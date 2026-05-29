import dbConnect from './db.js';
import { User } from './models.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Şifreleme için eklendi

const JWT_SECRET = process.env.JWT_SECRET || "saim_cok_gizli_anahtar_2026_!?";

// Token doğrulama fonksiyonu
const authenticate = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('Yetkisiz');
  return jwt.verify(token, JWT_SECRET);
};

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  try {
    await dbConnect();
    
    // İşlemi yapan kişinin kimliğini token'dan alıyoruz
    let userContext;
    try {
      userContext = authenticate(req);
    } catch (err) {
      return res.status(401).json({ error: "Lütfen giriş yapın." });
    }

    if (req.method === 'GET') {
      // Sadece aynı çalışma alanındaki (workspace) kullanıcıları getir
      const users = await User.find({ workspaceId: userContext.workspaceId });
      const formattedUsers = users.map(u => ({ ...u.toObject(), id: u._id.toString() }));
      return res.status(200).json(formattedUsers);
    }

    if (req.method === 'POST') {
      const { id, _id, password, username, role, ...updateData } = req.body;
      
      // EĞER ID YOKSA: YENİ KULLANICI EKLENİYOR DEMEKTİR
      if (!id && !_id) {
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);
         
         const newUser = await User.create({
            username,
            passwordHash: hashedPassword,
            role: role || 'user',
            workspaceId: userContext.workspaceId // <--- KRİTİK NOKTA: Adminin workspace'i kopyalanıyor
         });
         return res.status(201).json({ success: true, user: newUser });
      } 
      // EĞER ID VARSA: GÜNCELLEME İŞLEMİ YAPILIYOR DEMEKTİR
      else {
         if (password) {
             const salt = await bcrypt.genSalt(10);
             updateData.passwordHash = await bcrypt.hash(password, salt);
         }
         if (username) updateData.username = username;
         if (role) updateData.role = role;

         await User.findOneAndUpdate(
           { _id: id || _id },
           { $set: updateData },
           { new: true }
         );
         return res.status(200).json({ success: true });
      }
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: "ID eksik!" });
      await User.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    }
    
    return res.status(405).json({ message: "Geçersiz metod" });

  } catch (error) {
    console.error("Users API Hatası:", error);
    return res.status(500).json({ error: "Veritabanı veya Sunucu hatası" });
  }
}