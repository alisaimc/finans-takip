import clientPromise from './_db.js';
export default async function handler(req, res) {
  const client = await clientPromise;
  const col = client.db('finans').collection('users');
  if (req.method === 'GET') {
    const data = await col.find({}).toArray();
    return res.json(data);
  }
  if (req.method === 'POST') {
    await col.updateOne({ id: req.body.id }, { $set: req.body }, { upsert: true });
    return res.json({ success: true });
  }
}
