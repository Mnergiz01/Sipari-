# Menu İstek v2

Türkoğlu Mado için günlük sipariş giriş ve paylaşım uygulaması.

## Stack

Vue 3 + Vite · Pinia · PrimeVue 4 Aura · Tailwind · VeeValidate + Zod · pdfmake · Firebase (Auth + Firestore) · Sentry

## Kurulum

```bash
cd menu-istek-v2
npm install
cp .env.example .env.local
# .env.local dosyasını Firebase Console'dan aldığın değerlerle doldur
npm run dev
```

## Firebase Kurulumu

1. [Firebase Console](https://console.firebase.google.com/) → yeni proje oluştur (veya mevcut menu-istek projesini kullan)
2. **Authentication** → "Sign-in method" → **Google** sağlayıcısını etkinleştir
3. **Authentication** → "Settings" → "Authorized domains" → Vercel domain'ini ekle
4. **Firestore Database** → veritabanı oluştur (production mode, en yakın bölge)
5. Web uygulaması ekle → config'i kopyala → `.env.local`'e yapıştır
6. İlk girişten sonra `auth.user.uid`'ı al → `.env.local`'e `VITE_OWNER_UID` olarak yaz, projeyi yeniden başlat
7. `firestore.rules` dosyasındaki `REPLACE_WITH_OWNER_UID` yerine kendi UID'ini koy
8. Firebase CLI ile rules'u deploy et:
   ```bash
   npm i -g firebase-tools
   firebase login
   firebase use <project-id>
   firebase deploy --only firestore:rules
   ```

## İlk Çalıştırma

1. `/giris` ekranında Google ile giriş yap
2. `/urunler` ekranına git, **"Fabrika Ayarları"** butonuna bas — 11 kategori + 106 ürün seed olarak yüklenir
3. `/` (sipariş) ekranına dön, ilk siparişini gir, "Kaydet & Paylaş" tıkla

## Komutlar

```bash
npm run dev      # development server
npm run build    # production build
npm run preview  # build önizleme
npm test         # vitest unit testler
npm run test:e2e # playwright e2e (kurulum sonrası)
```

## Klasör Yapısı

```
src/
├── main.js, App.vue
├── router/                 # Vue Router + auth guard
├── stores/                 # Pinia (auth, catalog, orders, ui, settings)
├── composables/            # usePdfGenerator, useShare
├── services/               # firebase init, catalogService, ordersService
├── views/                  # 5 sayfa
├── components/layout/      # AppShell, BottomNav, ThemeToggle
├── data/seed.js            # 11 kategori + 106 ürün
├── utils/                  # tarih, slug, validation (Zod)
└── styles/                 # tokens.css (light/dark), tailwind.css
```

## Deploy (Vercel)

```bash
vercel --prod
```

Vercel Project Settings → Environment Variables'a `.env.local` içeriğini ekle.

## Notlar

- **TABU dosyalar**: `vite.config.js`, `package.json` dependencies (yeni dep eklemeden önce sor)
- **Test e-posta**: `muzaffernergiz0@gmail.com`
- **Tek kullanıcı**: `VITE_OWNER_UID` env değişkeniyle kilitli; rules sadece o UID'i kabul eder
- **Çevrimdışı**: Firestore offline persistence açık, internet yokken sipariş girilebilir, gelince senkron olur
- **WhatsApp paylaşım**: Web Share API + fallback (PDF indir + clipboard)
