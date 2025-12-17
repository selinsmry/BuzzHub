# Postta Fotoğraf Ekleme Rehberi

## ✅ Kurulum Tamamlandı!

Uygulamanızda fotoğraf yükleme özelliği başarıyla uygulandı. İşte nasıl kullanacağınız:

## 📸 Fotoğraf Ekleme Adımları

### 1. Yeni Gönderi Oluşturma Sayfasına Gidin
- Ana sayfaya gidip "Yeni Gönderi Oluştur" butonuna tıklayın
- Veya URL'ye giderek: `/create-post`

### 2. Gönderi Türü Seçin
- **"Resim"** (🖼️) sekmesine tıklayın
- Topluluk seçin
- Gönderi başlığını yazın

### 3. Fotoğraf Yükleyin
- **"Resim Yükle"** alanına tıklayın
- Bilgisayarınızdan resim dosyası seçin
- Veya resmi sürükleyip bırakın

### 4. Desteklenen Formatlar
- ✅ JPEG
- ✅ PNG
- ✅ GIF
- ✅ WebP

### 5. Dosya Sınırları
- **Maksimum boyut:** 5MB
- **Kontrol edilecek boyut:** Yapıldı

### 6. Ön İzleme
- Yükleme sonrası, seçilen resim gösterilecek
- Resmi değiştirmek için "X" butonuna tıklayın

### 7. Gönderiyi Yayınla
- Başlık ve resmi kontrol ettikten sonra
- **"Gönderiyi Yayınla"** butonuna tıklayın

## 🔧 Teknik Detaylar

### Backend Değişiklikleri
- ✅ `multer` paketi eklendi (dosya yükleme)
- ✅ `/uploads` dizini oluşturuldu
- ✅ `uploadMiddleware.js` oluşturdu
- ✅ POST `/api/posts` endpoint'i güncellendi

### Frontend Değişiklikleri
- ✅ `CreatePost.jsx` güncellendi
- ✅ Dosya seçme fonksiyonu eklendi (`handleImageChange`)
- ✅ Resim ön izleme eklendi
- ✅ FormData ile dosya yükleme yapılandırıldı

### Dosya Yapısı
```
backend/
├── middleware/
│   └── uploadMiddleware.js (YENİ)
└── uploads/ (Yüklenen resimler buraya kaydedilir)

frontend/
└── src/pages/
    └── CreatePost.jsx (GÜNCELLENDI)
```

## 🚀 Nasıl Çalışır?

1. **Kullanıcı resim seçer** → `handleImageChange()` çalışır
2. **Ön izleme gösterilir** → Resim boyutu ve formatı kontrol edilir
3. **Gönderi yayınlandığında** → FormData kullanarak API'ye gönderilir
4. **Backend multer'a işler** → Dosya `/uploads` dizinine kaydedilir
5. **Veritabanında kayıt** → Resmin URL'si Post modeline kaydedilir
6. **Ön yüzde görünür** → Resim ProfileCards vb'de gösterilir

## 📝 Notlar

- Yüklenen resimler `http://localhost:5000/uploads/` adresinden erişilir
- Her resim kendine özgü bir dosya adı alır (timestamp + random)
- Resimler sunucu'da kalıcı olarak saklanır
- Geçersiz dosyalar (format, boyut) otomatik reddedilir

## 🐛 Sorun Giderme

**Problem:** Resim yüklenmiyor
- ✅ Backend'in çalıştığını kontrol edin
- ✅ Dosya boyutunun 5MB'dan küçük olduğunu kontrol edin
- ✅ Dosya formatının desteklendiğini kontrol edin

**Problem:** Yükleme çok yavaş
- ✅ İnternet hızınız kontrol edin
- ✅ Resim boyutunu küçültmeyi deneyin

**Problem:** "uploads" dizini yok
- ✅ Backend otomatik olarak oluşturur (npm install sonrası ilk çalıştırmada)

## ✨ Ekstra Özellikleri Etkinleştirme

Gelecek güncellemelerde eklenebilecek özellikler:
- [ ] Resim sıkıştırma
- [ ] Birden fazla resim yükleme
- [ ] Resim filtreleri
- [ ] Resim düzenleme

---

**İlk Kullanım İçin:**
1. Backend'i yeniden başlatın: `npm start`
2. Frontend'i yeniden başlatın: `npm run dev`
3. Yeni gönderi sayfasında "Resim" sekmesini deneyin!
