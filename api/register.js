import dbConnect from './db.js';
import { User, Workspace } from './models.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    await dbConnect();
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor.' });
    }

    const newWorkspace = await Workspace.create({ 
      name: `${username.toUpperCase()} Finans Alanı` 
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      username,
      passwordHash: hashedPassword,
      role: 'admin',
      workspaceId: newWorkspace._id
    });
    const globalCategories = await Category.find({ isGlobal: true });

if (globalCategories.length > 0) {
  const userCategories = globalCategories.map(cat => ({
    name: cat.name,
    type: cat.type,
    workspaceId: newWorkspace._id, // Yeni oluşturulan workspace'e kopyala
    isGlobal: false // Kopyalanan artık o kullanıcıya özel
  }));
  await Category.insertMany(userCategories);
}

    return res.status(201).json({ message: 'Kayıt başarılı! Artık giriş yapabilirsiniz.' });

  } catch (error) {
    console.error("Kayıt Hatası:", error);
    return res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
}