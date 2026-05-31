import mongoose from 'mongoose';

const WorkspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  plan: { type: String, default: 'free' },
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }, 
  role: { type: String, enum: ['admin', 'user'], default: 'admin' },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  profilePhoto: { type: String }
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, uppercase: true },
  type: { type: String, enum: ['GELİR', 'GİDER'], required: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: false }, // false yaptık çünkü global ise workspaceId boş olabilir
  isGlobal: { type: Boolean, default: false } // Global mi?
});

const TransactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  type: { type: String, enum: ['GELİR', 'GİDER'], required: true },
  date: { type: String, required: true },
  description: { type: String },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', WorkspaceSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, default: "Aktif" },
  userCount: { type: Number, default: 0 }
}, { timestamps: true });

export { Workspace, User, Category, Transaction };