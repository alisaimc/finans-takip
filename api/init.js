import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // Tabloları oluştur
    await sql`CREATE TABLE IF NOT EXISTS transactions (id VARCHAR(255) PRIMARY KEY, type VARCHAR(50), categoryId VARCHAR(255), categoryName VARCHAR(255), date VARCHAR(50), amount NUMERIC, description TEXT, userId VARCHAR(255));`;
    await sql`CREATE TABLE IF NOT EXISTS categories (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), type VARCHAR(50), userId VARCHAR(255));`;
    await sql`CREATE TABLE IF NOT EXISTS users (id VARCHAR(255) PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), role VARCHAR(50));`;
    await sql`CREATE TABLE IF NOT EXISTS settings (userId VARCHAR(255) PRIMARY KEY, city JSONB, weatherOverride VARCHAR(50));`;
    
    // Varsayılan Admin Kullanıcısını ekle (Eğer yoksa)
    await sql`INSERT INTO users (id, username, password, role) VALUES ('admin_1', 'admin', '123', 'admin') ON CONFLICT DO NOTHING;`;

    return res.status(200).json({ message: "PostgreSQL Veritabanı ve tablolar başarıyla kuruldu!" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}