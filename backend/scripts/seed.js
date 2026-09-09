import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/database.js';
import { STOCKS } from '../src/config/constants.js';
import StockPrice from '../src/models/StockPrice.js';

dotenv.config();
await connectDB();
await Promise.all(STOCKS.map((stock) => StockPrice.findOneAndUpdate(
  { symbol: stock.symbol },
  { ...stock, previousPrice: stock.price },
  { upsert: true, new: true, setDefaultsOnInsert: true },
)));
console.log(`Seeded ${STOCKS.length} stocks`);
await mongoose.disconnect();