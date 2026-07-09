import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { compileReport, getReports, getReportById, exportReportPdf } from '../controllers/research.controller';

const router = Router();

// Protect all research endpoints with JWT validation
router.use(authenticate);

// POST for synchronous research (fallback) and GET for SSE streaming (EventSource)
router.post('/', compileReport);
router.get('/stream', compileReport);  // SSE streaming endpoint: GET /api/research/stream?company=AAPL
router.get('/reports', getReports);    // renamed to avoid conflict with stream route
router.get('/:id', getReportById);
router.get('/:id/export', exportReportPdf);

export default router;
