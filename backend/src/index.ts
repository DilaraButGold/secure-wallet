import express, { Request, Response } from 'express';
import accountRoutes from './routes/account.routes';
import transactionRoutes from './routes/transaction.routes';
import authRoutes from './routes/auth.routes';

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

// Rotalar
app.use('/auth', authRoutes);
app.use('/accounts', accountRoutes);
app.use('/transactions', transactionRoutes);

// Sağlık Kontrolü (Render bunu sık sık kontrol eder)
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: "SecureWallet API Canlıda! 🚀",
        status: "active",
        timestamp: new Date()
    });
});

app.listen(port, () => {
    console.log(`🏦 Banka şubesi port ${port} üzerinde açıldı!`);
});