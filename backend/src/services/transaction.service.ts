import prisma from '../utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export const transferMoney = async (fromAccountId: number, toAccountId: number, amount: number) => {
    // Prisma transaction: Ya hepsi yapılır, ya hiçbiri.
    return await prisma.$transaction(async (tx) => {

        // 1. Gönderen hesabı bul ve kilitle (Race Condition önlemi - Opsiyonel ama iyi olur)
        const sender = await tx.account.findUnique({ where: { id: fromAccountId } });
        if (!sender) throw new Error("Gönderen hesap bulunamadı.");

        // 2. Yetersiz bakiye kontrolü
        // Decimal kıyaslaması (toNumber() ile çevirip bakıyoruz)
        if (sender.balance.toNumber() < amount) {
            throw new Error("Yetersiz bakiye!");
        }

        // 3. Gönderenden para düş
        await tx.account.update({
            where: { id: fromAccountId },
            data: { balance: { decrement: amount } } // Atomic decrement
        });

        // 4. Alıcıya para ekle
        await tx.account.update({
            where: { id: toAccountId },
            data: { balance: { increment: amount } } // Atomic increment
        });

        // 5. Dekont (Transaction) kaydı oluştur
        const transaction = await tx.transaction.create({
            data: {
                amount,
                type: "TRANSFER",
                status: "COMPLETED",
                fromAccountId,
                toAccountId
            }
        });

        return transaction;
    });
};

export const depositMoney = async (accountId: number, amount: number) => {
    return await prisma.$transaction(async (tx) => {
        // Para yatırma işlemi
        await tx.account.update({
            where: { id: accountId },
            data: { balance: { increment: amount } }
        });

        return await tx.transaction.create({
            data: {
                amount,
                type: "DEPOSIT",
                status: "COMPLETED",
                toAccountId: accountId
            }
        });
    });
};

// 🔥 YENİ: Hesap Hareketlerini Getir
export const getHistory = async (accountId: number) => {
    return await prisma.transaction.findMany({
        where: {
            OR: [
                { fromAccountId: accountId }, // Ben gönderdiysem
                { toAccountId: accountId }    // Bana geldiyse
            ]
        },
        orderBy: {
            createdAt: 'desc' // En yeniden eskiye
        },
        take: 10, // Son 10 işlem
        include: {
            fromAccount: { include: { user: true } }, // Kimden geldi?
            toAccount: { include: { user: true } }    // Kime gitti?
        }
    });
};