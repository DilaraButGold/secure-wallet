import { Request, Response } from 'express';
import * as accountService from '../services/account.service';

export const createAccount = async (req: Request, res: Response) => {
    // ... (Bu fonksiyon kullanılmıyor, Auth içinden yapıyoruz ama dursun)
    res.status(501).json({ error: "Lütfen /auth/register kullanın" });
};

export const getBalance = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId);
        const account = await accountService.getAccount(userId);

        if (!account) {
            res.status(404).json({ error: "Hesap bulunamadı." });
            return;
        }

        res.json({
            id: account.id, // 🔥 BURASI ÇOK ÖNEMLİ: Cüzdan No'yu Frontend'e gönderiyoruz
            fullName: account.user.fullName,
            balance: account.balance,
            currency: account.type
        });
    } catch (error) {
        res.status(500).json({ error: "Bakiye getirilemedi." });
    }
};