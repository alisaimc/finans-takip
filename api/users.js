import dbConnect from './db.js';
import { User } from './models.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || "saim_cok_gizli_anahtar_2026_!?";

const authenticate = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('Yetkisiz');
  return jwt.verify(token, JWT_SECRET);
};

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  try {
    await dbConnect();
    
    let userContext;
    try {
      userContext = authenticate(req);
    } catch (err) {
      return res.status(401).json({ error: "Lütfen giriş yapın." });
    }

    if (req.method === 'GET') {
      const users = await User.find({ workspaceId: userContext.workspaceId }).select('-passwordHash'); 
      const formattedUsers = users.map(u => ({ ...u.toObject(), id: u._id.toString() }));
      return res.status(200).json(formattedUsers);
    }

    if (req.method === 'POST') {
      const { id, _id, password, username, role, ...updateData } = req.body;
      const targetId = id || _id;
      
      if (!targetId) {
         // YENİ EKLENİYOR
         const existingUser = await User.findOne({ username });
         if (existingUser) return res.status(400).json({ error: "Bu kullanıcı adı alınmış." });

         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);
         
         const newUser = await User.create({
            username,
            passwordHash: hashedPassword,
            role: role || 'user',
            workspaceId: userContext.workspaceId 
         });
         return res.status(201).json({ success: true, user: newUser });
      } else {
         // GÜNCELLENİYOR
         const targetUser = await User.findOne({ _id: targetId, workspaceId: userContext.workspaceId });
         if (!targetUser) return res.status(403).json({ error: "Yetkisiz işlem." });

         if (password) {
             const salt = await bcrypt.genSalt(10);
             updateData.passwordHash = await bcrypt.hash(password, salt);
         }
         if (username) updateData.username = username;
         if (role) updateData.role = role;

         await User.findByIdAndUpdate(targetUser._id, { $set: updateData }, { new: true });
         return res.status(200).json({ success: true });
      }
    }

    if (req.method === 'DELETE') {
      const deletedUser = await User.findOneAndDelete({ _id: req.query.id, workspaceId: userContext.workspaceId });
      if (!deletedUser) return res.status(403).json({ error: "Yetkisiz işlem." });
      return res.status(200).json({ success: true });
    }
    
    return res.status(405).json({ message: "Geçersiz metod" });

  } catch (error) {
    return res.status(500).json({ error: "Veritabanı veya Sunucu hatası" });
  }
}