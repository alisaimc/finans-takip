const dbConnect = require('./db');
const { User, Workspace } = require('./models');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  // Sadece POST isteklerini kabul et
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    await dbConnect(); // Veritabanına bağlan
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur.' });
    }

    // 1. Kullanıcı adı daha önce alınmış mı?
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor.' });
    }

    // 2. Kullanıcıya özel yepyeni bir Çalışma Alanı (Workspace) oluştur
    const newWorkspace = await Workspace.create({ 
      name: `${username.toUpperCase()} Finans Alanı` 
    });

    // 3. Şifreyi Kriptola (Hash)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Kullanıcıyı oluştur ve Çalışma Alanına bağla
    await User.create({
      username,
      passwordHash: hashedPassword,
      role: 'admin', // Kendi alanının yöneticisi
      workspaceId: newWorkspace._id
    });

    return res.status(201).json({ message: 'Kayıt başarılı! Artık giriş yapabilirsiniz.' });

  } catch (error) {
    console.error("Kayıt Hatası:", error);
    return res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
};