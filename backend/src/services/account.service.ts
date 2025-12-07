import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client'; // 🔥 1. YENİ: Tip importu

export const createUserAndAccount = async (fullName: string, email: string) => {
    // Transaction (ACID): Kullanıcı oluşursa hesabı da oluşmalı. Biri olmazsa diğeri de olmamalı.
    // 🔥 2. DÜZELTME: 'tx' değişkenine 'Prisma.TransactionClient' tipini verdik
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. Kullanıcıyı oluştur
        const user = await tx.user.create({
            data: {
                fullName,
                email,
                password: "hashlenmis_sifre_ornek", // Şimdilik sabit, sonra Auth ekleriz
            },
        });

        // 2. Kullanıcıya TRY hesabı aç (Başlangıç bakiyesi 0)
        const account = await tx.account.create({
            data: {
                userId: user.id,
                type: "TRY",
                balance: 0.00
            }
        });

        return { user, account };
    });
};

export const getAccount = async (userId: number) => {
    return await prisma.account.findFirst({
        where: { userId },
        include: { user: true } // Kullanıcı bilgisini de getir
    });
};