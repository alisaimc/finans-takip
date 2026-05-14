import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    const { rows } = await sql`SELECT * FROM settings WHERE userId = ${userId};`;
    return res.status(200).json(rows[0] || null);
  }
  
  if (req.method === 'POST') {
    const { userId, city, weatherOverride } = req.body;
    // Nesneleri veritabanına yazmadan önce JSON stringine çeviriyoruz
    const cityStr = JSON.stringify(city);
    await sql`INSERT INTO settings (userId, city, weatherOverride) VALUES (${userId}, ${cityStr}, ${weatherOverride}) ON CONFLICT (userId) DO UPDATE SET city = ${cityStr}, weatherOverride = ${weatherOverride};`;
    return res.status(200).json({ success: true });
  }
}