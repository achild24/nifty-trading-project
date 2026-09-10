import User from '../models/User.js';
import Trade from '../models/Trade.js';
import StockPrice from '../models/StockPrice.js';
import { STOCKS } from '../config/constants.js';
import { nextPrice } from '../utils/priceGenerator.js';

const ensureStocks = async () => {
  await Promise.all(STOCKS.map((stock) => StockPrice.updateOne(
    { symbol: stock.symbol },
    {
      $set: { name: stock.name },
      $setOnInsert: { symbol: stock.symbol, price: stock.price, previousPrice: stock.price },
    },
    { upsert: true },
  )));
};

export const getStocks = async (_req, res, next) => {
  try {
    await ensureStocks();
    const storedStocks = await StockPrice.find({ symbol: { $in: STOCKS.map((stock) => stock.symbol) } });
    const updated = await Promise.all(STOCKS.map(async (configuredStock) => {
      const stock = storedStocks.find((item) => item.symbol === configuredStock.symbol)
        || await StockPrice.create({ ...configuredStock, previousPrice: configuredStock.price });
      const basePrice = Number.isFinite(stock.price) && stock.price > 0 ? stock.price : configuredStock.price;
      const price = nextPrice(basePrice);
      stock.previousPrice = basePrice;
      stock.name = configuredStock.name;
      stock.price = price;
      await stock.save();
      return stock;
    }));
    res.json({ success: true, stocks: updated.sort((a, b) => a.symbol.localeCompare(b.symbol)) });
  } catch (error) { next(error); }
};

const findStock = async (symbol) => StockPrice.findOne({ symbol: symbol.toUpperCase() });

export const buyStock = async (req, res, next) => {
  try {
    await ensureStocks();
    const symbol = req.body.symbol.toUpperCase();
    const quantity = Number(req.body.quantity);
    const stock = await findStock(symbol);
    if (!stock) return res.status(404).json({ success: false, message: 'Stock not found' });
    const total = stock.price * quantity;
    if (!Number.isInteger(quantity) || quantity < 1 || !Number.isFinite(total) || total <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a valid positive integer' });
    }
    if (!Number.isFinite(req.user.balance) || req.user.balance < total) {
      return res.status(400).json({ success: false, message: 'Insufficient balance for this order' });
    }
    const position = req.user.portfolio.find((item) => item.symbol === symbol);
    let realizedPnL = 0;
    if (position?.quantity < 0) {
      const coveredQuantity = Math.min(quantity, Math.abs(position.quantity));
      realizedPnL = (position.avgPrice - stock.price) * coveredQuantity;
      req.user.marginUsed = Math.max(0, req.user.marginUsed - (position.avgPrice * coveredQuantity));
      position.quantity += coveredQuantity;
      if (position.quantity === 0) req.user.portfolio = req.user.portfolio.filter((item) => item.symbol !== symbol);
      const remainingQuantity = quantity - coveredQuantity;
      if (remainingQuantity > 0) req.user.portfolio.push({ symbol, quantity: remainingQuantity, avgPrice: stock.price });
    } else if (position) {
      position.avgPrice = ((position.avgPrice * position.quantity) + total) / (position.quantity + quantity);
      position.quantity += quantity;
    } else req.user.portfolio.push({ symbol, quantity, avgPrice: stock.price });
    req.user.balance -= total;
    req.user.totalPnL += realizedPnL;
    req.user.trades += 1;
    req.user.rewardPoints += quantity;
    if (realizedPnL > 0) req.user.winningTrades += 1;
    await req.user.save();
    await Trade.create({ user: req.user._id, symbol, type: 'BUY', quantity, price: stock.price, total, realizedPnL });
    res.json({ success: true, message: 'Stock purchased successfully', user: req.user, trade: { symbol, quantity, price: stock.price, type: 'BUY' } });
  } catch (error) { next(error); }
};

export const sellStock = async (req, res, next) => {
  try {
    await ensureStocks();
    const symbol = req.body.symbol.toUpperCase();
    const quantity = Number(req.body.quantity);
    const stock = await findStock(symbol);
    const position = req.user.portfolio.find((item) => item.symbol === symbol);
    if (!stock) return res.status(404).json({ success: false, message: 'Stock not found' });
    if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ success: false, message: 'Quantity must be a valid positive integer' });
    const total = stock.price * quantity;
    let realizedPnL = 0;
    const wasLong = position?.quantity > 0;
    const shortQuantity = !position
      ? quantity
      : wasLong
        ? Math.max(0, quantity - position.quantity)
        : quantity;
    const availableMargin = Math.max(0, req.user.balance - (req.user.marginUsed || 0));
    const marginRequired = stock.price * shortQuantity;
    if (marginRequired > availableMargin) {
      return res.status(400).json({ success: false, message: 'Insufficient margin for this short sell' });
    }
    if (!position) {
      // Open a new short position below.
    } else if (position.quantity > 0) {
      const closedQuantity = Math.min(quantity, position.quantity);
      realizedPnL = (stock.price - position.avgPrice) * closedQuantity;
      position.quantity -= closedQuantity;
      if (position.quantity === 0) req.user.portfolio = req.user.portfolio.filter((item) => item.symbol !== symbol);
    } else {
      const existingShortQuantity = Math.abs(position.quantity);
      position.avgPrice = ((position.avgPrice * existingShortQuantity) + total) / (existingShortQuantity + quantity);
      shortQuantity = quantity;
    }
    if (!position) req.user.portfolio.push({ symbol, quantity: -quantity, avgPrice: stock.price });
    else if (wasLong && shortQuantity > 0) req.user.portfolio.push({ symbol, quantity: -shortQuantity, avgPrice: stock.price });
    else if (position.quantity < 0) {
      position.quantity -= quantity;
    }
    req.user.marginUsed = (req.user.marginUsed || 0) + marginRequired;
    req.user.balance += total;
    req.user.totalPnL += realizedPnL;
    req.user.trades += 1;
    if (realizedPnL > 0) req.user.winningTrades += 1;
    await req.user.save();
    await Trade.create({ user: req.user._id, symbol, type: 'SELL', quantity, price: stock.price, total, realizedPnL });
    res.json({ success: true, message: 'Stock sold successfully', user: req.user, trade: { symbol, quantity, price: stock.price, type: 'SELL', realizedPnL } });
  } catch (error) { next(error); }
};

export const getPortfolio = async (req, res, next) => {
  try {
    await ensureStocks();
    const prices = await StockPrice.find({ symbol: { $in: req.user.portfolio.map((item) => item.symbol) } });
    const portfolio = req.user.portfolio.map((position) => {
      const stock = prices.find((item) => item.symbol === position.symbol);
      const currentPrice = stock?.price || position.avgPrice;
      const isShort = position.quantity < 0;
      const quantity = Math.abs(position.quantity);
      return { ...position.toObject(), quantity, side: isShort ? 'SHORT' : 'LONG', currentPrice, pnl: (isShort ? position.avgPrice - currentPrice : currentPrice - position.avgPrice) * quantity };
    });
    res.json({ success: true, portfolio });
  } catch (error) { next(error); }
};

