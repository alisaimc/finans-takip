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
      const categories = await Category.find({
        $or: [
          { workspaceId: userContext.workspaceId },
          { isGlobal: true }
        ]
      });
      return res.status(200).json(categories);
    }

    // 2. KATEGORİ EKLE VEYA GÜNCELLE
    if (req.method === 'POST') {
      const { id, _id, name, type, isGlobal } = req.body;
      const targetId = id || _id;

      if (targetId) {
        // GÜNCELLEME İŞLEMİ (Eğer global kategori güncelleniyorsa admin rolü kontrol edilir)
        const query = isGlobal && userContext.role === 'admin'
          ? { _id: targetId }
          : { _id: targetId, workspaceId: userContext.workspaceId };

        const updatedCategory = await Category.findOneAndUpdate(
          query,
          { name, type },
          { new: true }
        );
        return res.status(200).json(updatedCategory);
      } else {
        // YENİ EKLE
        if (isGlobal && userContext.role === 'admin') {
          // Master Kategori Ekleme
          const newCategory = await Category.create({ name, type, isGlobal: true });
          return res.status(201).json(newCategory);
        } else {
          // Normal Kategori Ekleme
          const newCategory = await Category.create({
            name,
            type,
            workspaceId: userContext.workspaceId,
            isGlobal: false
          });
          return res.status(201).json(newCategory);
        }
      }
    }

    // 3. KATEGORİ SİL
    if (req.method === 'DELETE') {
      const category = await Category.findById(req.query.id);
      if (!category) return res.status(404).json({ error: "Bulunamadı" });

      if (category.isGlobal) {
        // Global kategori silme işlemi sadece adminler içindir
        if (userContext.role !== 'admin') return res.status(403).json({ error: "Yetkisiz işlem" });
        await Category.findByIdAndDelete(req.query.id);
      } else {
        // Normal kategori kendi workspace'i içindeyse silinir
        if (String(category.workspaceId) !== String(userContext.workspaceId)) {
          return res.status(403).json({ error: "Yetkisiz işlem" });
        }
        await Category.findByIdAndDelete(req.query.id);
      }
      return res.status(200).json({ message: "Başarıyla silindi" });
    }

    return res.status(405).json({ message: "Geçersiz metod" });
  } catch (error) {
    res.status(401).json({ error: "Yetkisiz işlem veya sunucu hatası" });
  }
}