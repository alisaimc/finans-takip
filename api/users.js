// pages/api/users.js
import clientPromise from '../lib/mongodb.js';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const col = client.db('finans_db').collection('users');
    
    if (req.method === 'GET') {
      const data = await col.find({}).toArray();
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { _id, ...updateData } = req.body;
      await col.updateOne({ id: req.body.id }, { $set: updateData }, { upsert: true });
      return res.status(200).json({ success: true });
    }
    // EKLENEN KISIM: Kullanıcı Silme
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: "ID eksik!" });
      await col.deleteOne({ id: id });
      return res.status(200).json({ success: true });
    }
    
    return res.status(405).json({ message: "Geçersiz metod" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Veritabanı hatası" });
  }
}