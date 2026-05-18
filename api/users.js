import clientPromise from '../lib/mongodb.js'; // İçe aktarma yolu güncellendi

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const col = client.db('finans_db').collection('users'); // İsim güncellendi
    
    if (req.method === 'GET') {
      const data = await col.find({}).toArray();
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      await col.updateOne({ id: req.body.id }, { $set: req.body }, { upsert: true });
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Veritabanı hatası" });
  }
}