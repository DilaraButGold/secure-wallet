import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = "cok_gizli_anahtar_social_app_2024";

export const register = async (req: Request, res: Response) => {
    try {
        const { fullName, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: { fullName, email, password: hashedPassword }
            });
            const account = await tx.account.create({
                data: { userId: user.id, type: "TRY", balance: 0.00 }
            });
            return { user, account };
        });

        // Kayıt olurken de hesap ID'sini dönüyoruz
        res.status(201).json({
            message: "Kayıt başarılı!",
            data: result,
            accountId: result.account.id // 🔥 EKLEME
        });

    } catch (error: any) {
        if (error.code === 'P2002') return res.status(409).json({ error: "Email zaten kayıtlı." });
        res.status(500).json({ error: "Kayıt olunamadı." });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) { res.status(401).json({ error: "Kullanıcı bulunamadı." }); return; }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) { res.status(401).json({ error: "Şifre hatalı." }); return; }

        // 🔥 EKLEME: Giriş yaparken kullanıcının hesabını da bul
        const account = await prisma.account.findFirst({ where: { userId: user.id } });

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: "Giriş başarılı!",
            token,
            user: { id: user.id, fullName: user.fullName },
            accountId: account?.id // 🔥 Cüzdan Numarasını da gönderiyoruz
        });

    } catch (error) {
        res.status(500).json({ error: "Giriş yapılamadı." });
    }
};