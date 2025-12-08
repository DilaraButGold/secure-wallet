💸 SecureWallet - Professional FinTech Solution

SecureWallet, modern bankacılık sistemlerinin çekirdek prensiplerini (ACID Transactions, Security, Layered Architecture) simüle eden, uçtan uca (Full Stack) ve Cloud-Native bir finansal teknoloji uygulamasıdır.

Bu proje; Backend (Node.js/TypeScript) üzerinde güvenli para transferi mimarisini ve Mobile (React Native) üzerinde modern kullanıcı deneyimini birleştirir.

🚀 Canlı Demo (Live)

Backend API şu anda Render (Frankfurt) sunucularında canlı olarak çalışmaktadır.

🔗 API Base URL: https://secure-wallet-api.onrender.com
(Not: Ücretsiz sunucu olduğu için ilk istekte uyanması 30-40 saniye sürebilir)

🏗️ Mimari ve Teknoloji Yığını

Katman

Teknoloji

Açıklama

Backend

Node.js & Express

RESTful API ve İş Mantığı Katmanı.

Dil

TypeScript

Tip güvenliği ve ölçeklenebilir kod yapısı.

Veritabanı

PostgreSQL

İlişkisel veri ve Transaction yönetimi (Cloud Hosted).

ORM

Prisma

Veritabanı modelleme ve Atomik İşlemler ($transaction).

Güvenlik

JWT & Bcrypt

Stateless kimlik doğrulama ve veri şifreleme.

Mobile

React Native (Expo)

Cross-platform mobil bankacılık arayüzü.

DevOps

Render & Docker

CI/CD süreçleri ve Cloud Deployment.

💎 Kritik Teknik Yetkinlikler

1. 🛡️ ACID Uyumlu Transfer Mimarisi

Para transferleri, veritabanı seviyesinde prisma.$transaction kullanılarak atomik (bütüncül) olarak yönetilir. Olası bir sistem hatasında işlem tamamen geri alınır (Rollback), bakiye tutarsızlığı (Race Condition) oluşması engellenir.

2. 🏛️ Katmanlı Mimari (Layered Architecture)

Kod tabanı, sorumlulukların ayrılığı (SoC) ilkesine göre tasarlanmıştır:

Routes: İstek yönlendirme.

Controllers: İstek/Cevap yönetimi ve validasyon.

Services: İş mantığı ve veritabanı etkileşimi.

Middlewares: Güvenlik (Auth) ve Hata Yönetimi.

3. 🔒 Güvenlik & Validasyon

Tüm hassas rotalar JWT Middleware ile korunur.

Giriş verileri (Body) Zod kütüphanesi ile runtime'da doğrulanır.

Şifreler veritabanında Hash (Bcrypt) formatında saklanır.

🛠️ Yerel Kurulum (Local Development)

Projeyi kendi bilgisayarınızda geliştirmek isterseniz:

1. Altyapıyı Başlat

# PostgreSQL ve Adminer'ı başlatır
docker-compose up -d


2. Backend Kurulumu

cd backend
npm install
# .env dosyasını oluşturun ve DATABASE_URL ile JWT_SECRET ekleyin
npx prisma migrate dev --name init
npm run dev


3. Mobil Uygulama

cd mobile
npm install
npx expo start


📡 API Özellikleri

Method

Endpoint

Açıklama

POST

/auth/register

Yeni kullanıcı ve cüzdan oluşturma.

POST

/auth/login

Giriş ve Token alma.

GET

/accounts/:userId

(🔒) Bakiye sorgulama.

POST

/transactions/transfer

(🔒) Güvenli para transferi (ACID).

POST

/transactions/deposit

(🔒) Para yatırma (ATM Simülasyonu).

GET

/transactions/history

(🔒) Hesap hareketleri dökümü.

👨‍💻 Geliştirici Notu

Bu proje; Mid-Level Backend yetkinliklerini, özellikle Transaction Integrity, Cloud Deployment ve System Design konularını pekiştirmek amacıyla geliştirilmiştir.