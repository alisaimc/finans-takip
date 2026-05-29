// pages/api/users.js
import dbConnect from './db.js';
import { User } from './models.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Profil fotoğrafı yüklemeleri için boyut limiti
    },
  },
};

export default async function handler(req, res) {
  try {
    // 1. Veritabanına standart Mongoose köprüsüyle bağlanıyoruz
    await dbConnect();
    
    // 2. KULLANICILARI LİSTELE
    if (req.method === 'GET') {
      const users = await User.find({});
      
      // Frontend MongoDB'nin "_id" formatı yerine "id" beklediği için ufak bir veri dönüşümü yapıyoruz
      const formattedUsers = users.map(u => {
        const userDoc = u.toObject();
        userDoc.id = userDoc._id.toString();
        return userDoc;
      });
      
      return res.status(200).json(formattedUsers);
    }

    // 3. KULLANICI GÜNCELLE VEYA EKLE
    if (req.method === 'POST') {
      const { id, _id, password, ...updateData } = req.body;
      
      // Frontend şifre değiştirdiğinde "password" yolluyor, veritabanı "passwordHash" bekliyor
      if (password) {
          updateData.passwordHash = password; // Not: Normalde burası bcrypt ile şifrelenir
      }

      // Kullanıcıyı bul ve güncelle, yoksa yeni kayıt aç (upsert: true)
      await User.findOneAndUpdate(
        { _id: id || _id }, 
        { $set: updateData }, 
        { new: true, upsert: true }
      );
      
      return res.status(200).json({ success: true });
    }

    // 4. KULLANICI SİL
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: "ID eksik!" });
      
      await User.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    }
    
    return res.status(405).json({ message: "Geçersiz metod" });

  } catch (error) {
    console.error("Users API Hatası:", error);
    return res.status(500).json({ error: "Veritabanı hatası" });
  }
}