import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    const { rows } = await sql`SELECT * FROM transactions WHERE userId = ${userId};`;
    return res.status(200).json(rows);
  }
  
  if (req.method === 'POST') {
    const { id, type, categoryId, categoryName, date, amount, description, userId } = req.body;
    await sql`INSERT INTO transactions (id, type, categoryId, categoryName, date, amount, description, userId) VALUES (${id}, ${type}, ${categoryId}, ${categoryName}, ${date}, ${amount}, ${description}, ${userId}) ON CONFLICT (id) DO UPDATE SET type = ${type}, categoryId = ${categoryId}, categoryName = ${categoryName}, date = ${date}, amount = ${amount}, description = ${description};`;
    return res.status(200).json({ success: true });
  }
  
  if (req.method === 'DELETE') {
    const { id } = req.query;
    await sql`DELETE FROM transactions WHERE id = ${id};`;
    return res.status(200).json({ success: true });
  }
}