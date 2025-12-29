# Cloudflare Worker Kurulum Rehberi 🚀

Bu rehber, fotoğrafların çok daha hızlı yüklenmesi için Cloudflare Worker kurulumunu anlatıyor.

## Bu Ne İşe Yarar?

**Şu an**: Galeri açıldığında her fotoğraf 2-5 MB boyutunda indiriliyor. Yavaş internette bu çok uzun sürüyor.

**Worker ile**: Küçük resimler için 50KB, orta boy için 150KB indiriliyor. **10-20 kat daha hızlı!**

## Kurulum Adımları (5 Dakika)

### Adım 1: Cloudflare'a Giriş Yap

1. https://dash.cloudflare.com adresine git
2. Hesabına giriş yap (R2 bucket'ı oluştururken kullandığın hesap)

### Adım 2: Workers Sayfasına Git

1. Sol menüden **"Workers & Pages"** seçeneğine tıkla
2. **"Create"** butonuna tıkla (sağ üstte mavi buton)
3. **"Create Worker"** seç

### Adım 3: Worker İsmi Ver

1. İsim olarak yaz: `wedding-photos`
2. **"Deploy"** butonuna tıkla
3. Deployment tamamlandığında **"Edit code"** butonuna tıkla

### Adım 4: Kodu Yapıştır

1. Editördeki TÜM kodu sil (Ctrl+A sonra Delete)
2. Aşağıdaki kodu kopyala ve yapıştır:

```javascript
// Cloudflare Worker - Fotoğraf Küçültücü
const R2_URL = 'https://pub-b58e3b0a4909459992b84bd69903e2b7.r2.dev';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    if (path === '/') {
      return new Response('Fotoğraf servisi çalışıyor!');
    }
    
    const width = parseInt(url.searchParams.get('w')) || null;
    const quality = parseInt(url.searchParams.get('q')) || 80;
    const imageUrl = R2_URL + path;
    
    // Resmi küçült
    if (width) {
      try {
        const response = await fetch(imageUrl, {
          cf: {
            image: {
              width: width,
              quality: quality,
              fit: 'scale-down',
              format: 'auto'
            }
          }
        });
        
        return new Response(response.body, {
          headers: {
            'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (e) {
        // Hata olursa orijinali döndür
      }
    }
    
    // Orijinal resmi döndür
    const response = await fetch(imageUrl);
    return new Response(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
```

3. **"Save and Deploy"** butonuna tıkla (sağ üstte)

### Adım 5: Worker URL'ini Kopyala

Deploy ettikten sonra, sayfanın üstünde şöyle bir URL göreceksin:
```
https://wedding-photos.HESAP_ISMIN.workers.dev
```

Bu URL'i kopyala!

### Adım 6: GitHub'ı Güncelle

1. GitHub repository'ne git
2. **Settings** → **Secrets and variables** → **Actions**
3. `NEXT_PUBLIC_R2_PUBLIC_URL` secret'ını bul
4. **Update** butonuna tıkla
5. Yeni değer olarak Worker URL'ini yapıştır:
   ```
   https://wedding-photos.HESAP_ISMIN.workers.dev
   ```
6. **Save** butonuna tıkla

### Adım 7: Yeniden Deploy Et

1. GitHub'da **Actions** sekmesine git
2. Son workflow'a tıkla
3. **Re-run all jobs** butonuna tıkla

## Test Etme

Tarayıcıda şu URL'i dene (kendi worker URL'inle):

```
https://wedding-photos.HESAP_ISMIN.workers.dev/dugunden-once/foto1.jpg?w=200
```

Eğer küçük bir resim görüyorsan, her şey çalışıyor! 🎉

## Önemli Notlar

### Ücretsiz Plan Limitleri
- Günde 100,000 istek (düğün sitesi için fazlasıyla yeterli)
- Aylık 10GB veri transferi

### Image Resizing Hakkında
Cloudflare Image Resizing, **Cloudflare Pro plan** ($20/ay) gerektirir.

**Ücretsiz planda**: Worker resmi orijinal boyutta döndürür AMA önbellekleme sayesinde yine de daha hızlı olur.

**Pro planda**: Gerçek resim küçültme çalışır ve internet kullanımı 10-20x azalır.

## Sorun Giderme

### "Image Resizing çalışmıyor"
Normal! Ücretsiz planda çalışmaz. Ama progressive loading ve önbellekleme yine de yardımcı olur.

### "Worker 524 hatası veriyor"
Resim çok büyük olabilir. Orijinal resimleri 5MB altında tutmaya çalış.

### "CORS hatası"
Worker kodunda `Access-Control-Allow-Origin: *` header'ı var, bu sorunu çözmeli. Eğer hala sorun varsa, browser cache'i temizle.

---

Sorularınız için: GitHub Issues'ta yeni bir issue açabilirsiniz.
