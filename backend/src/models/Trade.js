import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  symbol: { type: String, required: true, uppercase: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  realizedPnL: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Trade', tradeSchema);