import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { STARTING_BALANCE } from '../config/constants.js';

const positionSchema = new mongoose.Schema({
  symbol: { type: String, required: true, uppercase: true },
  quantity: { type: Number, required: true, min: 0 },
  avgPrice: { type: Number, required: true, min: 0 },
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  balance: { type: Number, default: STARTING_BALANCE, min: 0 },
  totalPnL: { type: Number, default: 0 },
  rewardPoints: { type: Number, default: 0 },
  trades: { type: Number, default: 0 },
  winningTrades: { type: Number, default: 0 },
  portfolio: { type: [positionSchema], default: [] },
}, { timestamps: true, toJSON: { transform: (_doc, ret) => { delete ret.password; delete ret.__v; return ret; } } });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);