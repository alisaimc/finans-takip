import clientPromise from './_db.js';
export default async function handler(req, res) {
  const client = await clientPromise;
  const col = client.db('finans').collection('users');
  const admin = { id: 'admin_1', username: 'admin', password: '123', role: 'admin' };
  await col.updateOne({ id: 'admin_1' }, { $setOnInsert: admin }, { upsert: true });
  return res.json({ message: "Admin oluşturuldu!" });
}

