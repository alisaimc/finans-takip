// Uygulamanın JSON verilerini okuyabilmesi için bu satır ana dosyanızda olmalı:
// app.use(express.json());

// Kategorileri Getir
app.get('/api/category', async (req, res) => {
    // Veritabanından kategorileri çek (SELECT * FROM categories)
    // res.json(kategoriler);
});

// Kategori Ekle/Güncelle (app.post olarak düzeltildi)
app.post('/api/category', async (req, res) => {
    const { id, name, type } = req.body;
    // Veritabanına kaydet (INSERT INTO categories ...)
    // res.status(200).send("Başarılı");
});

// Kategori Sil
app.delete('/api/category', async (req, res) => {
    // Canvas'taki kodumuz ID'yi query parametresi olarak gönderiyor (?id=...)
    const { id } = req.query; 
    // Veritabanından sil (DELETE FROM categories WHERE id=?)
    // res.status(200).send("Silindi");
});