import clientPromise from "../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    // 'finans_db' yazan yere kendi veritabanı ismini verebilirsin
    const db = client.db("finans_db"); 

    if (req.method === "GET") {
      // Veritabanındaki kayıtları React'a gönder
      const data = await db.collection("transactions").find({}).toArray();
      return res.status(200).json(data);
    } 
    else if (req.method === "POST") {
      // React'tan gelen yeni kaydı veritabanına ekle
      const newTransaction = req.body;
      await db.collection("transactions").insertOne(newTransaction);
      return res.status(201).json({ success: true, data: newTransaction });
    }
    
    return res.status(405).json({ message: "Geçersiz metod" });
  } catch (error) {
    console.error("Veritabanı hatası:", error);
    return res.status(500).json({ error: "Sunucu hatası oluştu" });
  }
}
