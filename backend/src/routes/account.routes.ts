import { Router } from 'express';
import * as accountController from '../controllers/account.controller';

const router = Router();

// POST /accounts -> Yeni kullanıcı ve hesap oluştur
router.post('/', accountController.createAccount);

// GET /accounts/:userId -> Bakiye sorgula
router.get('/:userId', accountController.getBalance);

export default router;