import { PrismaClient } from '@prisma/client';

// Veritabanı bağlantısını oluştur
const prisma = new PrismaClient();

export default prisma;