import clientPromise from "../lib/mongodb.js";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    // Veritabanı adınız transaction.js ile aynı olmalı
    const db = client.db("finans_db"); 
    // Koleksiyon adını categories olarak ayarlıyoruz
    const collection = db.collection("categories");

    // 1. KATEGORİLERİ VERİTABANINDAN ÇEKME (GET)
    if (req.method === "GET") {
      const data = await collection.find({}).toArray();
      return res.status(200).json(data);
    } 
    
    // 2. YENİ KATEGORİ EKLEME VEYA DÜZENLEME (POST)
    if (req.method === "POST") {
      const categoryData = req.body;
      
      if (categoryData.id) {
        // Eğer ID varsa, bu bir düzenleme işlemidir
        const { _id, ...updateData } = categoryData;
        
        await collection.updateOne(
          { id: categoryData.id },
          { $set: updateData },
          { upsert: true }
        );
        return res.status(200).json({ success: true, data: categoryData });
      } else {
        // ID yoksa yeni kategori oluşturuluyor demektir
        categoryData.id = Date.now().toString();
        await collection.insertOne(categoryData);
        return res.status(201).json({ success: true, data: categoryData });
      }
    }

    // 3. KATEGORİYİ VERİTABANINDAN SİLME (DELETE)
    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: "ID parametresi eksik!" });
      }
      
      await collection.deleteOne({ id: id });
      return res.status(200).json({ success: true });
    }
    
    return res.status(405).json({ message: "Geçersiz metod" });
  } catch (error) {
    console.error("Kategori veritabanı hatası:", error);
    return res.status(500).json({ error: "Sunucu hatası oluştu" });
  }
}