import dbConnect from './db.js';
import { User, Workspace } from "./models.js";
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    await dbConnect();
    const { username, password, workspaceName } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor.' });
    }

    // 1. Yeni Workspace Alanını Oluştur
    const newWorkspace = await Workspace.create({ 
      name: workspaceName || `${username.toUpperCase()} Finans Alanı` 
    });

    // 2. Güvenli Şifre Kriptolama
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Admin Kullanıcısını Yeni Workspace'e Bağlayarak Oluştur
    await User.create({
      username,
      passwordHash: hashedPassword,
      role: 'admin',
      workspaceId: newWorkspace._id
    });

    // MİMARİ GÜNCELLEME: Global kategorileri her yeni kayıt olan kullanıcıya 
    // tek tek kopyalayan (Category.insertMany) eski seed bloğu tamamen kaldırılmıştır.
    // Tüm sistem artık ana merkezdeki (isGlobal: true) kategorileri ortak referans kabul eder.

    return res.status(201).json({ message: 'Kayıt başarılı! Artık giriş yapabilirsiniz.' });

  } catch (error) {
    console.error("Kayıt Hatası:", error);
    return res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
}