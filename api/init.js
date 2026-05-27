import clientPromise from '../lib/mongodb.js';

export default async function handler(req, res) {
  const client = await clientPromise;
  // BURASI DÜZELTİLDİ: 'finans' yerine 'finans_db' yapıldı
  const col = client.db('finans_db').collection('users');
  const admin = { id: 'admin_1', username: 'admin', password: '123', role: 'admin' };
  
  await col.updateOne({ id: 'admin_1' }, { $setOnInsert: admin }, { upsert: true });
  return res.json({ message: "Admin oluşturuldu!" });
}