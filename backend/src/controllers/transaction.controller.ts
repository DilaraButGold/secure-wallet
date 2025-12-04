import { Response } from 'express';
import { AuthRequest } from '../utils/authMiddleware'; // AuthRequest tipini buradan alıyoruz
import * as transactionService from '../services/transaction.service';
import prisma from '../utils/prisma';

export const transfer = async (req: AuthRequest, res: Response) => {
    try {
        // DİKKAT: Artık 'fromAccountId' body'den gelmiyor!
        // Token'dan gelen userId'yi kullanıyoruz.
        const userId = req.user?.userId;
        const { toAccountId, amount } = req.body;

        if (!userId) {
            res.status(401).json({ error: "Kimlik doğrulanamadı." });
            return;
        }

        // Kullanıcının kendi hesabını bul (TRY hesabı varsayıyoruz)
        const myAccount = await prisma.account.findFirst({
            where: { userId: userId, type: "TRY" }
        });

        if (!myAccount) {
            res.status(404).json({ error: "Hesabınız bulunamadı." });
            return;
        }

        if (myAccount.id === toAccountId) {
            res.status(400).json({ error: "Kendine para gönderemezsin!" });
            return;
        }

        const result = await transactionService.transferMoney(myAccount.id, toAccountId, amount);
        res.json({ message: "Transfer başarılı! 💸", transaction: result });

    } catch (error: any) {
        res.status(400).json({ error: error.message || "Transfer başarısız." });
    }
};

export const deposit = async (req: AuthRequest, res: Response) => {
    // Deposit işleminde auth şart değil (ATM gibi) ama biz yine de ekleyebiliriz.
    // Şimdilik serbest bırakıyoruz.
    try {
        const { accountId, amount } = req.body;
        const result = await transactionService.depositMoney(accountId, amount);
        res.json({ message: "Para yatırıldı! 💰", transaction: result });
    } catch (error: any) {
        res.status(500).json({ error: "Yatırma işlemi başarısız." });
    }
};

// 🔥 YENİ: Geçmişi Listele
export const getHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        // Kullanıcının hesabını bul
        const account = await prisma.account.findFirst({ where: { userId } });
        if (!account) { res.status(404).json({ error: "Hesap yok" }); return; }

        const history = await transactionService.getHistory(account.id);
        res.json({ history });

    } catch (error) {
        res.status(500).json({ error: "Geçmiş alınamadı." });
    }
};