import { MongoClient } from 'mongodb';
if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI eksik!');
const uri = process.env.MONGODB_URI;
let client = new MongoClient(uri);
let clientPromise = client.connect();
export default clientPromise;