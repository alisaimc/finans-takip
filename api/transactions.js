import clientPromise from './_db.js';
export default async function handler(req, res) {
  const client = await clientPromise;
  const col = client.db('finans').collection('transactions');
  if (req.method === 'GET') {
    const data = await col.find({ userId: req.query.userId }).toArray();
    return res.json(data);
  }
  if (req.method === 'POST') {
    await col.updateOne({ id: req.body.id }, { $set: req.body }, { upsert: true });
    return res.json({ success: true });
  }
  if (req.method === 'DELETE') {
    await col.deleteOne({ id: req.query.id });
    return res.json({ success: true });
  }
}
