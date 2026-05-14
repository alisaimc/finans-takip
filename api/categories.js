import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    const { rows } = await sql`SELECT * FROM categories WHERE userId = ${userId};`;
    return res.status(200).json(rows);
  }
  
  if (req.method === 'POST') {
    const { id, name, type, userId } = req.body;
    await sql`INSERT INTO categories (id, name, type, userId) VALUES (${id}, ${name}, ${type}, ${userId}) ON CONFLICT (id) DO UPDATE SET name = ${name}, type = ${type};`;
    return res.status(200).json({ success: true });
  }
  
  if (req.method === 'DELETE') {
    const { id } = req.query;
    await sql`DELETE FROM categories WHERE id = ${id};`;
    return res.status(200).json({ success: true });
  }
}