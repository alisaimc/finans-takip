import dbConnect from './db.js';
import { Category } from './models.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "saim_cok_gizli_anahtar_2026_!?";

const authenticate = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('Yetkisiz');
  return jwt.verify(token, JWT_SECRET);
};

export default async function handler(req, res) {
  try {
    await dbConnect();
    const userContext = authenticate(req);

    // 1. KATEGORİLERİ GETİR
    if (req.method === 'GET') {
      const categories = await Category.find({ workspaceId: userContext.workspaceId });
      return res.status(200).json(categories);
    }

    // 2. KATEGORİ EKLE VEYA GÜNCELLE
    if (req.method === 'POST') {
      const { id, _id, name, type } = req.body;
      const targetId = id || _id;

      if (targetId) {
        // ID varsa: GÜNCELLEME İŞLEMİ
        const updatedCategory = await Category.findOneAndUpdate(
          { _id: targetId, workspaceId: userContext.workspaceId },
          { name, type },
          { new: true }
        );
        return res.status(200).json(updatedCategory);
      } else {
        // ID yoksa: YENİ EKLE
        const newCategory = await Category.create({
          name,
          type,
          workspaceId: userContext.workspaceId
        });
        return res.status(201).json(newCategory);
      }
    }

    // 3. KATEGORİ SİL
    if (req.method === 'DELETE') {
      // Sadece senin workspace'indeki kategoriler silinebilir (Güvenlik!)
      await Category.findOneAndDelete({ _id: req.query.id, workspaceId: userContext.workspaceId });
      return res.status(200).json({ message: "Silindi" });
    }

    return res.status(405).json({ message: "Geçersiz metod" });
  } catch (error) {
    res.status(401).json({ error: "Yetkisiz işlem veya sunucu hatası" });
  }
}