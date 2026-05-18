import clientPromise from "../lib/mongodb.js"; // Yolun doğru olduğundan emin ol

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("finans_db"); // Veritabanı ismini sabitledik

    if (req.method === "GET") {
      const data = await db.collection("transactions").find({}).toArray();
      return res.status(200).json(data);
    } 
    else if (req.method === "POST") {
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