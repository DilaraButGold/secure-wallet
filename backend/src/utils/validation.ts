import { z } from 'zod';

// 1. Kayıt Olma Şeması
export const registerSchema = z.object({
    fullName: z.string().min(2, "İsim en az 2 karakter olmalı"),
    email: z.string().email("Geçerli bir email adresi giriniz"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı")
});

// 2. Giriş Yapma Şeması
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

// 3. Para Transferi Şeması
export const transferSchema = z.object({
    toAccountId: z.number({ invalid_type_error: "Alıcı ID sayı olmalı" }),
    amount: z.number().positive("Transfer tutarı 0'dan büyük olmalı")
});

// 4. Para Yatırma Şeması
export const depositSchema = z.object({
    accountId: z.number(),
    amount: z.number().positive("Yatırılacak tutar pozitif olmalı")
});