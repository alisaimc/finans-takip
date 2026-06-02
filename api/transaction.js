import dbConnect from './db.js';
import { Transaction } from './models.js';
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
    
    let userContext;
    try {
      userContext = authenticate(req);
    } catch (err) {
      return res.status(401).json({ error: "Lütfen giriş yapın." });
    }

    // 1. LİSTELEME
    if (req.method === 'GET') {
      const transactions = await Transaction.find({ workspaceId: userContext.workspaceId });
      return res.status(200).json(transactions);
    }

    // 2. EKLEME VEYA GÜNCELLEME (POST)
    // 2. EKLEME VEYA GÜNCELLEME (POST)
    if (req.method === 'POST') {
      // TOPLU EKLEME (BULK INSERT) KONTROLÜ
      if (Array.isArray(req.body)) {
        const bulkData = req.body.map(item => ({
          ...item,
          workspaceId: userContext.workspaceId,
          createdBy: userContext.userId
        }));
        
        const newTransactions = await Transaction.insertMany(bulkData);
        return res.status(201).json(newTransactions);
      }

      // TEKİL EKLEME/GÜNCELLEME KONTROLÜ
      const { id, _id, amount, type, date, description, categoryId } = req.body;
      const targetId = id || _id;
      
      if (targetId) {
        const updatedTrans = await Transaction.findOneAndUpdate(
          { _id: targetId, workspaceId: userContext.workspaceId },
          { amount, type, date, description, categoryId },
          { new: true }
        );
        return res.status(200).json(updatedTrans);
      } else {
        const newTrans = await Transaction.create({
          amount, type, date, description, categoryId,
          workspaceId: userContext.workspaceId,
          createdBy: userContext.userId
        });
        return res.status(201).json(newTrans);
      }
    }

    // 3. SİLME (DELETE)
    if (req.method === 'DELETE') {
      // Sadece kendi workspace'indeki bir işlemi silebilir
      await Transaction.findOneAndDelete({ _id: req.query.id, workspaceId: userContext.workspaceId });
      return res.status(200).json({ message: "Başarıyla silindi" });
    }

    return res.status(405).json({ message: "Geçersiz metod" });

  } catch (error) {
    console.error("İşlem Hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
}