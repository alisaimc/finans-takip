// api/workspaces.js

import connectDB from "./db.js"; // veya db.js'yi nasıl import ediyorsanız (require("./db.js"))
import { Workspace, User, Transaction, Category } from "./models.js";
export default async function handler(req, res) {
  // Önce veritabanına bağlan
  await connectDB();

  // --- GET: TÜM ÇALIŞMA ALANLARINI GETİR ---
// --- GET: TÜM ÇALIŞMA ALANLARINI GETİR (GÜNCELLENDİ) ---
if (req.method === "GET") {
  try {
    // .lean() metodu Mongoose objelerini saf JSON objesine çevirir, işlem yapmayı hızlandırır
    const workspaces = await Workspace.find().sort({ createdAt: -1 }).lean();

    // Her bir çalışma alanı için veritabanına bağlanıp, ona ait kullanıcıları sayıyoruz
    const workspacesWithUserCount = await Promise.all(
      workspaces.map(async (ws) => {
        // workspaceId'nin String veya ObjectId kaydedilme ihtimaline karşı çift taraflı güvenli arama
        const count = await User.countDocuments({
          $or: [
            { workspaceId: ws._id },
            { workspaceId: ws._id.toString() }
          ]
        });

        return {
          ...ws,
          userCount: count, // Canlı sayılan değeri karta ekle
        };
      })
    );

    return res.status(200).json(workspacesWithUserCount);
  } catch (error) {
    console.error("Workspace getirme hatası:", error);
    return res.status(500).json({ error: "Veriler getirilemedi." });
  }
}

  // --- POST: YENİ ÇALIŞMA ALANI EKLE ---
  if (req.method === "POST") {
    try {
      const { name, type } = req.body;
      

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

    // 1. Önce bu Workspace ID'sine bağlı olan TÜM alt verileri sil
    // (Modellerinizdeki workspace referans isminin "workspaceId" olduğunu varsayıyoruz)
    await User.deleteMany({ workspaceId: id });
    await Transaction.deleteMany({ workspaceId: id });
    await Category.deleteMany({ workspaceId: id });

    // 2. En son Workspace'in kendisini sil
    await Workspace.findByIdAndDelete(id);

    return res.status(200).json({ message: "Workspace ve bağlı tüm veriler başarıyla silindi." });
  } catch (error) {
    return res.status(500).json({ error: "Silme işlemi sırasında hata oluştu." });
  }
  }

  // Desteklenmeyen bir metod gelirse:
  return res.status(405).json({ error: "Method Not Allowed" });
}