import { Router } from 'express';
import { getStocks, buyStock, sellStock, getPortfolio } from '../controllers/tradeController.js';
import { protect } from '../middleware/auth.js';
import { tradeValidation, validate } from '../middleware/validation.js';

const router = Router();
router.use(protect);
router.get('/stocks', getStocks);
router.post('/buy', tradeValidation, validate, buyStock);
router.post('/sell', tradeValidation, validate, sellStock);
router.get('/portfolio', getPortfolio);

export default router;