# Oy Verme Sistemi Düzeltmesi

## Problem
Bir hesaptan oy verildikten sonra başka bir hesaptan oy kullanıldığında değer doğru şekilde güncellenmiyordu. Bunun nedeni oyların tarayıcı-yerel depolama (localStorage) üzerinden takip edilmesi ve backend tarafında kullanıcı başına oyların kaydedilmemesiydi.

## Çözüm Implementasyonu

### 1. **Backend Modeli Güncellemesi** (`backend/models.js`)
Post şemasına yeni bir alan eklendi:
```javascript
userVotes: [{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  voteType: { type: String, enum: ['up', 'down'] }
}]
```
Bu, her kullanıcının her gönderi için oyunu (yukarı/aşağı) takip eder.

### 2. **Backend Oy Verme Endpointi Güncellemesi** (`backend/index.js`)

#### `PUT /api/votes/:id` - Oy Verme
Şu mantığı izler:
- Kullanıcı belirlenebilir (JWT token'dan)
- Eğer kullanıcı daha önce oy vermişse:
  - Aynı oy türüne tıklarsa: Oyunu kaldır
  - Farklı oy türüne tıklarsa: Oyunu değiştir (2 puan değişim)
- İlk oy: Doğrudan ekle (1 puan değişim)
- Yanıt: Güncellenmiş oy sayısı ve kullanıcının mevcut oy durumu

#### `GET /api/votes/:id/user-vote` - Kullanıcı Oy Durumunu Getir
Oturum açmış kullanıcının belirli bir gönderi için mevcut oy durumunu getirir.
Endpointi: `POST /api/debug/migrate-votes`

### 3. **Frontend Güncellemeleri** (`frontend/src/components/PostCard.jsx`)

#### Temel Değişiklikler:
1. **localStorage yerine Backend'den Veri Çekme**:
   - Bileşen yüklendiğinde `fetchUserVoteStatus()` çağrılır
   - Backend'ten kullanıcının mevcut oy durumu getirilir
   - Her hesap değişikliğinde otomatik yenilenir

2. **Oy Verme Mantığı Basitleştirildi**:
   - Sadece `voteType` gönderiliyor (null, 'up', 'down')
   - Backend tüm hesaplama yapıyor
   - Frontend, backend'ten dönen değerleri kullanıyor

3. **Oturum Açma Kontrolü**:
   - Oy vermeden önce kullanıcı kontrolü yapılır
   - Giriş yapmamış kullanıcılara uyarı gösterilir

## Yapılması Gereken İşlemler

### 1. Backend'i Yeniden Başlat
```bash
cd backend
npm start
```

### 2. Frontend'i Yeniden Başlat
```bash
cd frontend
npm run dev
```

### 3. Mevcut Verileri Migrate Et (Opsiyonel)
Veritabanında zaten varolan gönderiler için `userVotes` alanını başlatmak için:
```bash
curl -X POST http://localhost:5000/api/debug/migrate-votes
```

## Test Edilecek Senaryolar

1. ✅ Bir hesaptan yukarı oy ver
2. ✅ Aynı hesaptan oyunu kaldır
3. ✅ Başka bir hesaba giriş yap
4. ✅ Aynı gönderi için oyunu kontrol et (boş olmalı)
5. ✅ Yukarı oy ver
6. ✅ Aşağı oya değiştir (2 puan değişim olmalı)
7. ✅ İlk hesaba geri dön, kendi oyunu kontrol et (hala yukarı olmalı)
8. ✅ Gönderiyi yenile, oy sayısı tutarlı olmalı

## Teknik Detaylar

### Vote Status Yönetimi
- **null**: Kullanıcı oy vermedi
- **'up'**: Yukarı oy verildi
- **'down'**: Aşağı oy verildi

### Oy Hesaplaması
- Yukarı oy: +1 puan
- Aşağı oy: -1 puan
- Oy değişikliği (up ↔ down): 2 puan değişim
- Oyun kaldırılması: Ters işlem

## Avantajlar

1. **Kullanıcı-Spesifik**: Her kullanıcının oyları ayrı takip edilir
2. **Güvenli**: Backend doğrulaması yapar
3. **Gerçek Zamanlı**: Hesap değişikliklerinde otomatik güncellenir
4. **Tutarlı**: Tarayıcı/cihaz değişikliklerinde durum korunur
5. **Ölçeklenebilir**: Veritabanı sorguları indekslenmiş

## Olası Gelecek İyileştirmeler

1. WebSocket ile gerçek zamanlı oy güncellemeleri
2. Oy geçmişi ve analitiği
3. Oy spam koruması
4. Karma puanı sistemi
