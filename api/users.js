import dbConnect from './db.js';
import { User } from './models.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || "saim_cok_gizli_anahtar_2026_!?";

// Bileti kontrol et ve içindeki kullanıcı/workspace bilgilerini çöz
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
    
    // İşlemi kim yapıyor? Hangi Workspace'e ait? (Biletten okuyoruz)
    let userContext;
    try {
      userContext = authenticate(req);
    } catch (err) {
      return res.status(401).json({ error: "Lütfen giriş yapın." });
    }

    // 1. KULLANICILARI LİSTELE (SADECE KENDİ WORKSPACE'İNDEKİLERİ GETİR)
    if (req.method === 'GET') {
      // Find içine workspaceId şartı koyduk! Başkasını göremez.
      const users = await User.find({ workspaceId: userContext.workspaceId }).select('-passwordHash'); 
      const formattedUsers = users.map(u => ({ ...u.toObject(), id: u._id.toString() }));
      return res.status(200).json(formattedUsers);
    }

    // 2. KULLANICI EKLE VEYA GÜNCELLE
    if (req.method === 'POST') {
      const { id, _id, password, username, role, ...updateData } = req.body;
      
      // A) YENİ KULLANICI EKLENİYOR (Admin içeriden ekliyorsa)
      if (!id && !_id) {
         // Aynı kullanıcı adı var mı kontrolü
         const existingUser = await User.findOne({ username });
         if (existingUser) return res.status(400).json({ error: "Bu kullanıcı adı zaten alınmış." });

         // Şifreyi kırılmaz hale getir
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);
         
         // KULLANICIYI DİREKT İŞLEMİ YAPANIN WORKSPACE'İNE ATA
         const newUser = await User.create({
            username,
            passwordHash: hashedPassword,
            role: role || 'user',
            workspaceId: userContext.workspaceId // <-- İŞTE BURASI: İçeriden eklenenler senin alanına düşer
         });
         return res.status(201).json({ success: true, user: newUser });
      } 
      
      // B) MEVCUT KULLANICI GÜNCELLENİYOR (Şifre/Rol değişimi)
      else {
         // EK GÜVENLİK: Sadece senin workspace'inde olan birini güncelleyebilirsin
         const targetUser = await User.findOne({ _id: id || _id, workspaceId: userContext.workspaceId });
         if (!targetUser) return res.status(403).json({ error: "Yetkisiz işlem: Bu kullanıcı sizin alanınızda değil." });

         if (password) {
             const salt = await bcrypt.genSalt(10);
             updateData.passwordHash = await bcrypt.hash(password, salt);
         }
         if (username) updateData.username = username;
         if (role) updateData.role = role;

         await User.findByIdAndUpdate(targetUser._id, { $set: updateData }, { new: true });
         return res.status(200).json({ success: true });
      }
    }

    // 3. KULLANICI SİL
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: "ID eksik!" });
      
      // EK GÜVENLİK: Sadece senin workspace'inde olan birini silebilirsin
      const deletedUser = await User.findOneAndDelete({ _id: id, workspaceId: userContext.workspaceId });
      if (!deletedUser) return res.status(403).json({ error: "Yetkisiz işlem: Bu kullanıcı sizin alanınızda değil." });

      return res.status(200).json({ success: true });
    }
    
    return res.status(405).json({ message: "Geçersiz metod" });

  } catch (error) {
    console.error("Users API Hatası:", error);
    return res.status(500).json({ error: "Veritabanı veya Sunucu hatası" });
  }
}