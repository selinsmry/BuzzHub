# Oy Verme Sistemi Düzeltmesi - Uygulama Rehberi

## 📋 Yapılan Değişiklikler

### Backend (`backend/`)
1. **models.js** - Post şemasına `userVotes` alanı eklendi
2. **index.js** - Oy verme ve kontrol endpointleri güncellenmiş

### Frontend (`frontend/`)
1. **PostCard.jsx** - Oy verme mantığı backend-merkezli hale getirildi

---

## 🚀 Deployment Adımları

### 1️⃣ Backend'i Güncelle ve Başlat

```bash
cd /home/cem/toplulukapp/backend
npm start
```

Veritabanında mevcut gönderileri migrate etmek için (opsiyonel):
```bash
curl -X POST http://localhost:5000/api/debug/migrate-votes
```

### 2️⃣ Frontend'i Güncelle ve Başlat

```bash
cd /home/cem/toplulukapp/frontend
npm run dev
```

---

## ✅ Test Süreci

### Test 1: Tek Hesapla Oy Verme
- [ ] Hesap 1'de giriş yap
- [ ] Bir gönderi üzerinde ⬆️ tıkla
- [ ] Oy sayısının +1 arttığını doğrula
- [ ] Aynı tuşa tekrar tıkla (oyun kaldır)
- [ ] Oy sayısının -1 azaldığını doğrula

### Test 2: Oy Değiştirme
- [ ] Hesap 1'de ⬆️ tıkla
- [ ] Sayı +1 artsın
- [ ] ⬇️ tıkla
- [ ] Sayı -2 değişsin (toplam: -1 olmasında)

### Test 3: Çoklu Hesap
- [ ] Hesap 1'de ⬆️ tıkla (toplam: +1)
- [ ] Hesap 1'den çıkış yap
- [ ] Hesap 2'ye giriş yap
- [ ] **ÖNEMLİ**: Aynı gönderi için oy durumu boş olmalı
- [ ] Hesap 2'de ⬇️ tıkla (toplam: 0 olmalı)
- [ ] Hesap 1'e geri dön
- [ ] Oy durumu hala ⬆️ olmalı

### Test 4: Sayfa Yenileme
- [ ] Hesap 1'de ⬆️ tıkla
- [ ] Sayfayı yenile (F5)
- [ ] Oy durumu korunmalı ⬆️
- [ ] Oy sayısı doğru olmalı

### Test 5: Farklı Tarayıcı/Cihaz
- [ ] Incognito penceredede giriş yap
- [ ] Aynı gönderi için oy kontrol et
- [ ] Oy durumu boş olmalı (yeni oturum)

---

## 🔍 Hata Ayıklama

### Problem: Oy sayısı değişmiyor
```
→ Browser console'da hata var mı kontrol et
→ Network tab'da request başarılı mı?
→ Backend logs'a bak: npm start çıktısında
```

### Problem: Hesap değiştiğinde oy durumu güncellenmiyor
```
→ Logout/Login'de oy durumu yenileniyor mu?
→ fetchUserVoteStatus() çağrılıyor mu?
→ JWT token doğru gönderiliyor mu?
```

### Problem: Migration hatası
```
curl -X POST http://localhost:5000/api/debug/migrate-votes
→ Dönen yanıtta kaç gönderi update edilmiş?
```

---

## 📊 API Endpoints Özeti

| Method | Endpoint | Açıklama |
|--------|----------|---------|
| PUT | `/api/votes/:id` | Oy ver veya değiştir |
| GET | `/api/votes/:id/user-vote` | Kullanıcı oy durumunu getir |
| POST | `/api/debug/migrate-votes` | Mevcut gönderileri migrate et |

### Request Body Örneği
```json
{
  "voteType": "up"  // "up", "down", or null
}
```

### Response Örneği
```json
{
  "votes": 42,
  "userVoteStatus": "up"
}
```

---

## 🎯 Beklenen Davranış

### Oy Verme Mantığı
- **İlk oy**: +1 veya -1 (voteType'a göre)
- **Aynı oya tıklamak**: -1 veya +1 (oyun kaldır)
- **Farklı oya değiştirmek**: +2 veya -2 (net değişim)
- **null gönder**: Oyun kaldırılması

### Oy Durumu (voteStatus)
- `null` → Oy yok
- `"up"` → Yukarı oy verilmiş
- `"down"` → Aşağı oy verilmiş

---

## 📝 Notlar

- ✅ Tüm oylar backend'de kalıcı olarak kaydediliyor
- ✅ Her kullanıcının oyları izole ediliyor
- ✅ localStorage artık kullanılmıyor (sadece currentUser için)
- ✅ Tarayıcı/cihaz farkı önemli değil
- ✅ JWT token otomatik gönderiliyor (axiosInstance)

---

## 🚨 Önemli

Eğer test sırasında sorun yaşarsan:
1. Backend konsolunda hataları kontrol et
2. Network tab'ında request/response kontrol et
3. Database'i temizle ve baştan başla: `curl -X POST http://localhost:5000/api/debug/reset`
4. Sonra migrate et: `curl -X POST http://localhost:5000/api/debug/migrate-votes`
