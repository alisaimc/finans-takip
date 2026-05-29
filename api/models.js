const mongoose = require('mongoose');

// 1. WORKSPACE (ÇALIŞMA ALANI) ŞEMASI
const WorkspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  plan: { type: String, default: 'free' },
  createdAt: { type: Date, default: Date.now }
});

// 2. USER (KULLANICI) ŞEMASI
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }, 
  role: { type: String, enum: ['admin', 'user'], default: 'admin' },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  profilePhoto: { type: String }
});

// 3. CATEGORY (KATEGORİ) ŞEMASI
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, uppercase: true },
  type: { type: String, enum: ['GELİR', 'GİDER'], required: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true }
});

// 4. TRANSACTION (KAYITLAR) ŞEMASI
const TransactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  type: { type: String, enum: ['GELİR', 'GİDER'], required: true },
  date: { type: String, required: true },
  description: { type: String },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Eğer model daha önce derlendiyse onu kullan (Vercel gibi ortamlarda çökmemesi için kritik), yoksa yeni derle
const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', WorkspaceSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

module.exports = { Workspace, User, Category, Transaction };