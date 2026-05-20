import clientPromise from "../lib/mongodb.js";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("finans_db");
    const collection = db.collection("transactions");

    // 1. VERİLERİ VERİTABANINDAN ÇEKME (GET)
    if (req.method === "GET") {
      const data = await collection.find({}).toArray();
      return res.status(200).json(data);
    } 
    
    // 2. YENİ KAYIT EKLEME VEYA DÜZENLEME (POST)
    if (req.method === "POST") {
      const transactionData = req.body;
      
      if (transactionData.id) {
        // Eğer ID varsa, bu bir düzenleme işlemidir (Upsert mantığı)
        
        // ÇÖZÜM BURADA: _id alanını updateData'dan ayırıyoruz
        const { _id, ...updateData } = transactionData;
        
        await collection.updateOne(
          { id: transactionData.id },
          { $set: updateData }, // Sadece _id içermeyen alanları güncelliyoruz
          { upsert: true }
        );
        return res.status(200).json({ success: true, data: transactionData });
      } else {
        // ID yoksa yeni kayıt oluşturuluyor demektir
        transactionData.id = Date.now().toString();
        await collection.insertOne(transactionData);
        return res.status(201).json({ success: true, data: transactionData });
      }
    }

    // 3. VERİTABANINDAN SİLME (DELETE)
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
    console.error("Veritabanı hatası:", error);
    return res.status(500).json({ error: "Sunucu hatası oluştu" });
  }
}