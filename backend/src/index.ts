import express, { Request, Response } from 'express';
import accountRoutes from './routes/account.routes';
import transactionRoutes from './routes/transaction.routes';
import authRoutes from './routes/auth.routes'; // 1. Yeni Rota

const app = express();
const port = 3000;

app.use(express.json());

app.use('/auth', authRoutes); // 2. Bağla
app.use('/accounts', accountRoutes);
app.use('/transactions', transactionRoutes);

app.get('/', (req: Request, res: Response) => {
    res.json({ message: "SecureWallet API Çalışıyor! 💸", status: "active" });
});

app.listen(port, () => {
    console.log(`🏦 Banka şubesi http://localhost:${port} adresinde açıldı!`);
});