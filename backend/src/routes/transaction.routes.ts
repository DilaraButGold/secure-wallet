import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { authenticateToken } from '../utils/authMiddleware';

const router = Router();

router.post('/transfer', authenticateToken, transactionController.transfer);
router.post('/deposit', authenticateToken, transactionController.deposit); // İstersen buna da auth ekleyebilirsin

// 🔥 YENİ: GET /transactions/history
router.get('/history', authenticateToken, transactionController.getHistory);

export default router;