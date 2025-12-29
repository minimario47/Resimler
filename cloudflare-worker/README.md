# Cloudflare Worker for Image Resizing

Bu worker, R2'deki fotoğrafları otomatik olarak küçültür. Yavaş internet bağlantılarında çok daha hızlı yükleme sağlar.

## Kurulum Adımları (5 dakika)

### 1. Cloudflare Dashboard'a Git
https://dash.cloudflare.com/ adresine git ve giriş yap.

### 2. Workers & Pages'e Git
Sol menüden "Workers & Pages" seçeneğine tıkla.

### 3. Yeni Worker Oluştur
- "Create application" butonuna tıkla
- "Create Worker" seç
- İsim ver: `wedding-photos-resizer`
- "Deploy" butonuna tıkla

### 4. Kodu Yapıştır
- Worker sayfasında "Quick edit" butonuna tıkla
- Soldaki editördeki tüm kodu sil
- `image-resizer.js` dosyasındaki kodu yapıştır
- "Save and Deploy" butonuna tıkla

### 5. Worker URL'ini Al
Deploy ettikten sonra, worker URL'in şöyle görünecek:
```
https://wedding-photos-resizer.YOUR_SUBDOMAIN.workers.dev
```

### 6. Uygulamayı Güncelle
`.env` dosyasına veya GitHub Secrets'a bu URL'i ekle:
```
NEXT_PUBLIC_R2_PUBLIC_URL=https://wedding-photos-resizer.YOUR_SUBDOMAIN.workers.dev
```

## Nasıl Çalışır?

Örnek URL'ler:
- Küçük thumbnail (200px): `/photo.jpg?w=200&q=60`
- Orta boy (400px): `/photo.jpg?w=400&q=75`
- Büyük (800px): `/photo.jpg?w=800&q=80`
- Orijinal: `/photo.jpg`

## Fiyatlandırma

- **Ücretsiz**: Günde 100,000 istek (düğün sitesi için fazlasıyla yeterli)
- **$5/ay**: Günde 10 milyon istek

## Alternatif: Image Resizing Olmadan

Eğer Cloudflare Image Resizing aktif değilse (ücretsiz Workers planında olabilir), 
worker orijinal resimleri döndürür ama yine de önbellekleme yapar.

Tam resim küçültme için:
1. Cloudflare Pro plan ($20/ay) gerekli
2. VEYA resimleri yüklemeden önce farklı boyutlarda kaydet

## Test Etme

Worker'ı deploy ettikten sonra tarayıcıda test et:
```
https://wedding-photos-resizer.YOUR_SUBDOMAIN.workers.dev/dugunden-once/photo1.jpg?w=200
```
