import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 🔥 KESİNLEŞTİRİLMİŞ ANAHTAR
// Bu anahtarı Auth Controller'da da aynen kullanmalısın!
export const JWT_SECRET = "cok_gizli_anahtar_social_app_2024";

export interface AuthRequest extends Request {
    user?: {
        userId: number;
        email: string;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];

    // Terminale Log Atalım (Debug)
    console.log("📥 Gelen İstek:", req.path);
    console.log("🔑 Header:", authHeader);

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log("❌ Token Bulunamadı!");
        res.status(401).json({ error: "Erişim reddedildi! Token eksik." });
        return;
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            console.log("🚨 Token Geçersiz:", err.message);
            res.status(403).json({ error: "Oturum süresi dolmuş veya geçersiz token." });
            return;
        }

        console.log("✅ Giriş Başarılı:", user.email);
        req.user = user;
        next();
    });
};