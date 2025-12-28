# Özlem & Zübeyir — Düğün Arşivi

🎊 Nusaybin'de gerçekleştirilen Özlem & Zübeyir düğün haftasının fotoğraf ve video arşivi.

![Wedding Archive](https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=400&fit=crop)

## 🌟 Özellikler

- **📱 Responsive Tasarım**: Mobil-öncelikli, tüm cihazlarda mükemmel görüntüleme
- **🖼️ Galeri**: Masonry layout ile fotoğraf ve video galerisi
- **🔍 Lightbox**: Tam ekran görüntüleme, zoom, swipe navigasyon
- **📁 Kategoriler**: Düğünden Önce, Kına Gecesi, Düğün
- **🔎 Arama**: Etiket ve anahtar kelime ile arama
- **❤️ Favoriler**: Beğenilen medyaları kaydetme
- **🔐 Admin Paneli**: Medya yönetimi için gizli admin arayüzü
- **🇹🇷 Türkçe**: Tüm arayüz Türkçe olarak hazırlanmıştır

## 🚀 Hızlı Başlangıç

### Geliştirme

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

### Derleme

```bash
# Statik site oluştur (GitHub Pages için)
npm run build

# Yerel test için derleme
npm run build:local
```

Çıktı `out` klasöründe oluşturulur.

## 🌐 GitHub Pages Dağıtımı

### Otomatik Dağıtım (Önerilen)

1. Bu depoyu GitHub'a push edin
2. Repository **Settings** > **Pages** bölümüne gidin
3. **Source** olarak **"GitHub Actions"** seçin
4. `main` branch'e push yapıldığında otomatik olarak deploy edilecektir

### Manuel Dağıtım

1. `npm run build` komutunu çalıştırın
2. `out` klasöründeki dosyaları GitHub Pages'e yükleyin

## 📁 Proje Yapısı

```
wedding-archive/
├── src/
│   ├── app/                 # Next.js sayfa rotaları
│   │   ├── page.tsx         # Ana sayfa
│   │   ├── kategori/        # Kategori sayfaları
│   │   ├── hakkinda/        # Hakkında sayfası
│   │   ├── ara/             # Arama sayfası
│   │   ├── favoriler/       # Favoriler sayfası
│   │   └── admin/           # Admin paneli (gizli)
│   ├── components/          # React bileşenleri
│   │   ├── Header.tsx       # Üst menü
│   │   ├── Hero.tsx         # Ana sayfa hero
│   │   ├── MediaGrid.tsx    # Masonry galeri
│   │   ├── Lightbox.tsx     # Tam ekran görüntüleyici
│   │   └── ...
│   ├── data/                # Mock veri
│   │   └── mock-data.ts
│   └── types/               # TypeScript tipleri
│       └── index.ts
├── public/                  # Statik dosyalar
│   ├── robots.txt
│   └── .nojekyll
└── .github/workflows/       # GitHub Actions
    └── deploy.yml           # Otomatik deploy
```

## 🎨 Renk Paleti

| Renk | Hex | Kullanım |
|------|-----|----------|
| Cream | `#F6F0EB` | Arka plan |
| Slate | `#0F172A` | Metin |
| Accent | `#C66B4F` | Vurgu rengi |

## 🔧 Teknolojiler

- **Next.js 16** - React framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animasyonlar
- **Lucide Icons** - İkonlar
- **React Masonry CSS** - Galeri layout

## 📱 Admin Paneli

Admin paneline `/admin` yolundan erişilebilir.

**Demo Giriş:**
- E-posta: `admin@example.com`
- Şifre: `admin123`

> ⚠️ Bu statik bir demo sürümüdür. Gerçek uygulamada güvenli kimlik doğrulama sistemi kullanılmalıdır.

## 📝 Önemli Notlar

### Statik Site Kısıtlamaları

GitHub Pages statik site barındırma hizmeti olduğundan:

- ❌ Sunucu tarafı API'ler çalışmaz
- ❌ Gerçek kimlik doğrulama yapılamaz
- ❌ Veritabanı bağlantısı yoktur

✅ Tam özellikli uygulama için Vercel, Railway veya kendi sunucunuzu kullanabilirsiniz.

### Gerçek Fotoğraflarınızı Ekleme

Mock verileri kendi fotoğraflarınızla değiştirmek için:

1. `src/data/mock-data.ts` dosyasını düzenleyin
2. Görsel URL'lerini kendi fotoğraflarınızla değiştirin
3. Google Drive veya iCloud'dan paylaşım linkleri kullanabilirsiniz

### ⚡ Google Drive'dan Cloudflare R2'ye Geçiş (Önerilen)

Google Drive fotoğrafları yavaş yükleniyorsa, Cloudflare R2'ye geçiş yapabilirsiniz. R2 çok daha hızlı CDN desteği sunar.

**Hızlı Başlangıç:**

1. Cloudflare R2 bucket oluşturun (ücretsiz)
2. R2 API credentials alın
3. Environment variables ayarlayın:
   ```bash
   export R2_ACCOUNT_ID='your-account-id'
   export R2_ACCESS_KEY_ID='your-access-key-id'
   export R2_SECRET_ACCESS_KEY='your-secret-key'
   export R2_BUCKET_NAME='your-bucket-name'
   export R2_PUBLIC_URL='https://your-bucket.r2.dev'
   export NEXT_PUBLIC_R2_PUBLIC_URL='https://your-bucket.r2.dev'
   ```
4. Migration script'ini çalıştırın:
   ```bash
   npm run migrate:r2
   ```

Detaylı talimatlar için `MIGRATION_GUIDE.md` dosyasına bakın.

**Otomatik Geçiş:** Uygulama otomatik olarak R2 yapılandırmasını algılar ve kullanır. R2 yoksa Google Drive'a geri döner.

### iCloud Entegrasyonu Uyarısı

iCloud paylaşımlı albüm linkleri direkt dosya erişimi sağlamayabilir. Google Drive veya Cloudflare R2 kullanmanız önerilir.

## 🔧 Özelleştirme

### Repository Adını Değiştirme

Repository adınız `wedding-archive` değilse:

1. `next.config.ts` dosyasındaki `repoName` değerini güncelleyin
2. `.github/workflows/deploy.yml` dosyasındaki `NEXT_PUBLIC_REPO_NAME` değerini güncelleyin
3. `package.json` dosyasındaki build script'ini güncelleyin

## 📄 Lisans

Bu proje MIT lisansı altında yayınlanmıştır.

---

❤️ Sevgiyle hazırlandı — Özlem & Zübeyir için
