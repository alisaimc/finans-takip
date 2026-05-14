import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Lütfen Vercel panelinden MONGODB_URI ortam değişkenini ekleyin.');
}

if (process.env.NODE_ENV === 'development') {
  // Geliştirme ortamında hot-reload (sıcak yenileme) sorunlarını önlemek için bağlantıyı globalde tutuyoruz
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Canlı (Production) ortamında normal bağlantı
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;