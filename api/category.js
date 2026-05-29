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

    if (req.method === 'GET') {
      const categories = await Category.find({ workspaceId: userContext.workspaceId });
      return res.status(200).json(categories);
    }

    if (req.method === 'POST') {
      const { name, type } = req.body;
      const newCategory = await Category.create({
        name,
        type,
        workspaceId: userContext.workspaceId
      });
      return res.status(201).json(newCategory);
    }

    if (req.method === 'DELETE') {
      await Category.findByIdAndDelete(req.query.id);
      return res.status(200).json({ message: "Silindi" });
    }

  } catch (error) {
    res.status(401).json({ error: "Yetkisiz işlem veya sunucu hatası" });
  }
}