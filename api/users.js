import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { rows } = await sql`SELECT * FROM users;`;
    return res.status(200).json(rows);
  }
  
  if (req.method === 'POST') {
    const { id, username, password, role } = req.body;
    await sql`INSERT INTO users (id, username, password, role) VALUES (${id}, ${username}, ${password}, ${role}) ON CONFLICT (id) DO UPDATE SET username = ${username}, password = ${password}, role = ${role};`;
    return res.status(200).json({ success: true });
  }
  
  if (req.method === 'DELETE') {
    const { id } = req.query;
    await sql`DELETE FROM users WHERE id = ${id};`;
    return res.status(200).json({ success: true });
  }
}