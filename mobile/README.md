💸 SecureWallet - Professional FinTech Solution

SecureWallet, modern bankacılık sistemlerinin çekirdek prensiplerini (ACID Transactions, Security, Layered Architecture) simüle eden, uçtan uca (Full Stack) bir finansal teknoloji uygulamasıdır.

Bu proje; Backend (Node.js/TypeScript) üzerinde güvenli para transferi mimarisini ve Mobile (React Native) üzerinde modern kullanıcı deneyimini birleştirir.

 Mimari ve Teknoloji Yığını

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

İlişkisel veri ve Transaction yönetimi.

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

Docker

Veritabanı ve yönetim paneli konteynerizasyonu.

🚀 Kritik Teknik Yetkinlikler

1. 🛡️ ACID Uyumlu Transfer Mimarisi

Para transferleri, veritabanı seviyesinde prisma.$transaction kullanılarak atomik (bütüncül) olarak yönetilir. Olası bir sistem hatasında işlem tamamen geri alınır (Rollback), bakiye tutarsızlığı (Race Condition) oluşması engellenir.

2. 🏛️ Katmanlı Mimari (Layered Architecture)

Kod tabanı, sorumlulukların ayrılığı (SoC) ilkesine göre tasarlanmıştır:

Routes: İstek yönlendirme.

Controllers: İstek/Cevap yönetimi ve validasyon.

Services: İş mantığı ve veritabanı etkileşimi.

Middlewares: Güvenlik (Auth) ve Hata Yönetimi.

3. 🔒 Güvenlik Standartları

Tüm hassas rotalar JWT Middleware ile korunur.

Kullanıcı, sadece kendi hesap ID'si üzerinden işlem yapabilir (Authorization).

Şifreler veritabanında Hash (Bcrypt) formatında saklanır.

🛠️ Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için:

1. Altyapıyı Başlat (Docker)

Ana dizinde:

docker-compose up -d


2. Backend'i Başlat

cd backend
npm install
npx prisma migrate dev --name init
npm run dev


API http://localhost:3000 adresinde çalışır.

3. Mobil Uygulamayı Başlat

Yeni bir terminalde:

cd mobile
npm install
npx expo start


Android emülatör için 'a' tuşuna basın.

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

(🔒) Güvenli para transferi.

POST

/transactions/deposit

(🔒) Para yatırma (ATM Simülasyonu).

GET

/transactions/history

(🔒) Hesap hareketleri dökümü.

👨‍💻 Geliştirici Notu

Bu proje; Mid-Level Backend yetkinliklerini, özellikle Transaction Integrity ve System Design konularını pekiştirmek amacıyla geliştirilmiştir.