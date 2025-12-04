import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware'; // Yeni Middleware
import { registerSchema, loginSchema } from '../utils/validation'; // Şemalar

const router = Router();

// Araya 'validate(schema)' ekledik
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

export default router;