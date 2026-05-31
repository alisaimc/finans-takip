// api/workspaces.js

import connectDB from "./db.js"; // veya db.js'yi nasıl import ediyorsanız (require("./db.js"))
import { Workspace } from "./models.js"; // Export yönteminize göre import edin

export default async function handler(req, res) {
  // Önce veritabanına bağlan
  await connectDB();

  // --- GET: TÜM ÇALIŞMA ALANLARINI GETİR ---
  if (req.method === "GET") {
    try {
      const workspaces = await Workspace.find().sort({ createdAt: -1 });
      return res.status(200).json(workspaces);
    } catch (error) {
      return res.status(500).json({ error: "Veriler getirilemedi." });
    }
  }

  // --- POST: YENİ ÇALIŞMA ALANI EKLE ---
  if (req.method === "POST") {
    try {
      const { name, type } = req.body;
      if (!name || !type) {
        return res.status(400).json({ error: "Eksik bilgi." });
      }

      const newWorkspace = await Workspace.create({
        name,
        type,
        status: "Aktif",
        userCount: 0,
      });

      return res.status(201).json(newWorkspace);
    } catch (error) {
      return res.status(500).json({ error: "Oluşturulamadı." });
    }
  }

  // --- DELETE: ÇALIŞMA ALANI SİL ---
  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID belirtilmedi." });

      await Workspace.findByIdAndDelete(id);
      return res.status(200).json({ message: "Başarıyla silindi." });
    } catch (error) {
      return res.status(500).json({ error: "Silinemedi." });
    }
  }

  // Desteklenmeyen bir metod gelirse:
  return res.status(405).json({ error: "Method Not Allowed" });
}