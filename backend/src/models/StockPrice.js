import mongoose from 'mongoose';

const stockPriceSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  previousPrice: { type: Number, required: true, min: 0 },
}, { timestamps: true });

export default mongoose.model('StockPrice', stockPriceSchema);