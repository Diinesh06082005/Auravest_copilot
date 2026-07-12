import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getDashboardData, addWatchlistTicker, removeWatchlistTicker, getNewsForTicker } from '../controllers/dashboard.controller';

const router = Router();

// Protect all dashboard endpoints with JWT token validation
router.use(authenticate);

router.get('/', getDashboardData);
router.get('/news', getNewsForTicker);
router.post('/watchlist', addWatchlistTicker);
router.delete('/watchlist/:ticker', removeWatchlistTicker);

export default router;
