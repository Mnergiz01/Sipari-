# Menu-Istek v2 — Tasarım Spec'i

**Tarih:** 2026-05-05
**Durum:** Brainstorming tamamlandı, kullanıcı onayı bekleniyor
**Yazar:** Muzaffer Nergiz + Claude Code

---

## 1. Amaç

Türkoğlu Mado bayisi için günlük sipariş giriş ve paylaşım uygulaması. Mevcut [menu-istek.vercel.app](https://menu-istek.vercel.app/) yerine geçecek; tek kullanıcı (Muzaffer Nergiz) için, mobil öncelikli, Firebase tabanlı, modern editorial estetikle yeniden inşa edilir.

Mevcut uygulama statik bir sipariş formu — ürünler hard-coded, geçmiş yok, PDF/paylaşım yok, native `confirm()` dialog kullanıyor, `lang="en"`. Yeni uygulama bu eksikleri kapatacak ve ürün yönetimi, geçmiş, PDF, WhatsApp paylaşımı ekleyecek.

## 2. Kullanıcı & Kapsam

- **Tek kullanıcı**: sahibi (Muzaffer Nergiz), Google hesabıyla auth
- **Birincil cihaz**: telefon (sipariş yerinde girilip oradan paylaşılır)
- **İkincil cihaz**: opsiyonel — ileride PC/tablet ihtiyacı olursa Firebase senkron sayesinde hazır
- **Trafik**: günde ~1 sipariş, aylık ~30 yazma. Firebase Spark planı sınırlarının altında
- **Auth dışı kullanıcılar**: hiçbir veriye erişemez (Firestore rules ile kilitli)

## 3. Fonksiyonel Gereksinimler

### 3.1 Sipariş Oluşturma
- Tarih ve gün **otomatik dolar** (kullanıcı override edebilir)
- Kullanıcı şube/lokasyon adını girer (varsayılan: son kullandığı)
- Opsiyonel sipariş notu girer
- Tüm ürünler kategorilere göre listelenir; her satırda - / + butonlu sayı input'u (PrimeVue InputNumber, mobil keypad numerik)
- Sticky kategori barı: kategori adına tıklayınca o bölüme smooth scroll
- "Sıfırla" → ConfirmDialog ile onay
- "Kaydet ve Paylaş" → 3 adımlı modal: önizleme → kaydet → paylaş

### 3.2 Geçmiş Siparişler
- Tüm geçmiş siparişler ters kronolojik sırayla kart listesi
- Her kartta: tarih + gün, şube, kalem sayısı, butonlar
- **Görüntüle**: read-only modal'da detay
- **Şablon olarak**: o siparişi yeni sipariş ekranına yükler (tarih bugüne ayarlanır)
- **PDF tekrar üret**: aynı veriden yeniden PDF + paylaşım akışı
- Tarih filtresi + ürün adıyla arama

### 3.3 Ürün & Kategori Yönetimi
- 2 sekmeli sayfa (Ürünler / Kategoriler)
- **Ürün CRUD**: ad, kategori, birim (adet/kg), arşivle (soft delete)
- **Kategori CRUD**: ad, ikon (emoji opsiyonel), sürükle-bırak sıralama
- **Arşivlenmiş ürünleri göster** toggle
- **Fabrika ayarlarına dön**: 9 kategori + 106 ürün seed'i geri yükler (mevcut + yenileri korur, çakışanları sorar)
- Kategori silme: içinde aktif ürün varsa engellenir, kullanıcıyı yönlendirir

### 3.4 Ayarlar
- Tema: Light / Dark / Sistem (default: sistem)
- Hesap bilgisi + Çıkış Yap
- WhatsApp varsayılan kontağı (opsiyonel telefon numarası)
- Veri yedekleme: JSON Export / Import
- Sürüm bilgisi (footer)

### 3.5 PDF Üretimi
- Kütüphane: `pdfmake@0.2.x` (Türkçe karakter desteği için Roboto font embed edilir)
- A4 dikey, margin 32mm, siyah-beyaz
- **Sadece dolu ürünler** (`quantity > 0`) basılır
- Kategoriler orijinal sırayla (alfabetik değil)
- Layout: başlık (TÜRKOĞLU MADO + sipariş listesi caption) → tarih+toplam → kategorilere göre ürün listesi → not → footer (URL + zaman damgası)
- Tipografi: Roboto, kategori başlıkları uppercase tracking-wider 12pt, ürünler 10pt regular
- Dosya adı: `siparis-{ISO-tarih}-{slug-sube}.pdf`

### 3.6 WhatsApp Paylaşımı
- **Birincil yol**: Web Share API (`navigator.share` files dizisiyle PDF + summary metni)
- Otomatik özet metin: tarih, gün, şube, toplam kalem
- **Fallback**: API yoksa → PDF indir + summary'yi clipboard'a kopyala + (varsa) wa.me linki açar
- Modern Android Chrome / iOS Safari 16+ tam destek

## 4. Teknik Mimari

### 4.1 Stack
| Katman | Tercih |
|---|---|
| Framework | Vue 3.4+ (Composition API + `<script setup>`) |
| Build | Vite |
| Dil | JavaScript (TypeScript yok — AysSoft standart) |
| State | Pinia |
| UI | PrimeVue 4 Aura |
| Stil | Tailwind CSS |
| Form | VeeValidate + Zod |
| HTTP | (yok — doğrudan Firebase SDK) |
| PDF | pdfmake |
| Hata izleme | Sentry (Vue plugin) |
| Auth | Firebase Auth (Google provider) |
| DB | Firestore (offline persistence açık) |
| Test | Vitest + Vue Test Utils + Playwright |
| Hosting | Vercel (GitHub auto-deploy) |
| Deploy | Firebase rules: `firebase deploy --only firestore:rules` |

### 4.2 Klasör Yapısı

```
menu-istek-v2/
├── public/
├── src/
│   ├── main.js, App.vue
│   ├── router/index.js
│   ├── stores/                # auth, catalog, orders, ui, settings
│   ├── composables/           # useFirestore, usePdfGenerator, useShare, useTheme, useToast
│   ├── services/              # firebase init, ordersService, catalogService, pdfFonts
│   ├── views/                 # GirisView, SiparisView, GecmisView, UrunYonetimView, AyarlarView
│   ├── components/
│   │   ├── layout/            # AppShell, BottomNav, ThemeToggle
│   │   ├── siparis/           # KategoriBar, KategoriBolumu, UrunSatiri, TarihKart, KaydetPaylasModal
│   │   ├── gecmis/            # GecmisListe, GecmisKart
│   │   ├── urunler/           # UrunListe, UrunForm, KategoriListe, KategoriForm
│   │   └── shared/            # SayfaBaslik, BosListe, YuklenmeDurumu
│   ├── data/seed.js           # 9 kategori + 106 ürün başlangıç
│   ├── utils/                 # tarih, slug, validation
│   ├── styles/                # tokens.css (light/dark), tailwind.css
│   └── assets/fonts/          # Inter, JetBrains Mono (woff2)
├── firestore.rules
├── firestore.indexes.json
├── .env.example, .env.local
├── tailwind.config.js
├── vite.config.js              # TABU
├── package.json
└── README.md
```

### 4.3 Veri Modeli (Firestore)

```
categories/{categoryId}
  name: string
  order: number
  icon: string?
  createdAt, updatedAt: timestamp

products/{productId}
  name: string
  categoryId: string (categories ref)
  unit: 'adet' | 'kg'
  order: number
  archived: boolean
  createdAt, updatedAt: timestamp

orders/{orderId}
  date: string (ISO YYYY-MM-DD)
  dayName: string ('Salı')
  location: string
  note: string?
  items: Array<{
    productId: string
    productName: string      # snapshot — silinen ürünler PDF'de bozulmasın diye
    categoryName: string     # snapshot
    quantity: number
    unit: 'adet' | 'kg'
  }>
  totalCount: number          # özet için pre-computed
  createdAt: timestamp
```

**Tasarım kararları:**
- `items` snapshot — ürün/kategori silinince eski siparişler bozulmasın
- Soft delete (`archived: true`) — eski siparişler hala görünür, yeni siparişte listelenmez
- `order` alanı — sürükle-bırak sıralama için (PrimeVue OrderList)
- Real-time listener (`onSnapshot`) — manuel fetch derdi yok
- Composite index: `products` üzerinde `(archived, categoryId, order)` — listeleme sorguları için

### 4.4 Auth & Security

- **Provider**: Google Sign-In (Firebase Auth `signInWithPopup`)
- **Allowlist**: `VITE_OWNER_UID` env değişkeniyle tek UID izinli
- **Akış**:
  1. `onAuthStateChanged` listener çalışır
  2. User yoksa → `/giris` route'una yönlendir
  3. User var ama UID ≠ `OWNER_UID` → forceSignOut + "Yetkisiz" toast
  4. User var ve UID eşleşir → `/` route'una yönlendir
- **Firestore Rules**:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{db}/documents {
      function isOwner() {
        return request.auth != null
          && request.auth.uid == "<OWNER_UID>";
      }
      match /{document=**} {
        allow read, write: if isOwner();
      }
    }
  }
  ```
- **İlk kurulum**: deploy sonrası kullanıcı kendi Google hesabıyla giriş yapar → console'a UID yazılır → o UID env'e koyulup redeploy yapılır

### 4.5 State Yönetimi (Pinia)

- **`useAuthStore`**: `currentUser`, `isAuthorized` (UID allowlist check), `signIn()`, `signOut()`
- **`useCatalogStore`**: `categories[]`, `products[]`, real-time listener bağlı; CRUD action'ları (`createProduct`, `updateProduct`, `archiveProduct`, `restoreFromSeed`, …)
- **`useOrdersStore`**: `orders[]` (paginated, son 50 default), `activeDraft` (anki form state'i), `saveOrder()`, `loadAsTemplate(orderId)`
- **`useUiStore`**: `theme`, `isOnline`, `toastQueue`
- **`useSettingsStore`**: `whatsappContact`, `lastUsedLocation`, `themePreference`

State Firestore ile **otomatik senkron** — store action'ları Firestore SDK'sini çağırır, `onSnapshot` callback'i store'u günceller.

### 4.6 Tema Sistemi

**Design tokens** (`src/styles/tokens.css`):

```css
:root {
  --color-bg: #fafaf9;
  --color-surface: #ffffff;
  --color-surface-alt: #f5f5f4;
  --color-border: #e7e5e4;
  --color-text: #1c1917;
  --color-text-muted: #78716c;
  --color-accent: #0f766e;          /* deep teal */
  --color-success: #15803d;
  --color-warning: #c2410c;
  --color-error: #b91c1c;
}
[data-theme="dark"] {
  --color-bg: #0c0a09;
  --color-surface: #1c1917;
  --color-surface-alt: #292524;
  --color-border: #44403c;
  --color-text: #fafaf9;
  --color-text-muted: #a8a29e;
  --color-accent: #14b8a6;
}
```

- Tipografi: Inter (sans, variable, woff2 self-hosted), JetBrains Mono (mono, sadece tarih/sayı)
- Skala: 10/11/13/15/18/22/28/36 px (8pt grid)
- Köşe yuvarlama: 6px default
- Gölge: minimum (kart border, modal `shadow-sm`)
- Animasyon: 150ms ease-out, tema crossfade 200ms
- Kategori başlıkları: uppercase, tracking-wider, 11px (editorial vibe)
- `prefers-reduced-motion` saygı: animasyonlar kapanır

PrimeVue Aura preset üzerine custom override (`@primevue/themes` ile).

## 5. Hata Yönetimi

| Senaryo | Davranış |
|---|---|
| Firebase init hatası (env eksik) | Tam ekran hata sayfası + console detay |
| Google sign-in iptal | Toast: "Giriş iptal edildi" + login'de kal |
| Yetkisiz UID | Auto signOut + toast: "Bu hesap yetkili değil" |
| Network down | Banner: "🔌 Çevrimdışısın — siparişler internet gelince senkron olur" |
| Firestore write fail | Toast + 3x retry (exponential backoff) |
| PDF generate hatası | Toast + Sentry'ye bildiri |
| Web Share API yok | Sessiz fallback (PDF indir + clipboard) |
| Boş sipariş + paylaş | ConfirmDialog (native confirm değil): "Hiç ürün girilmedi. Devam edilsin mi?" |
| Kategori sil + içinde aktif ürün | Engellenir + toast: "X ürün var, önce taşı/arşivle" |

## 6. Test Stratejisi

**TDD disiplini.**

### Unit (Vitest)
- `utils/tarih.js` — ISO → "Salı", Türkçe ay isimleri
- `utils/slug.js` — Türkçe karakter normalize
- `utils/validation.js` — Zod şemaları
- `composables/usePdfGenerator.js` — boş ürün filtresi, kategori sırası

### Component (Vitest + Vue Test Utils)
- `UrunSatiri.vue` — +/- davranışı, min 0 sınırı
- `KategoriBar.vue` — click → emit
- `KaydetPaylasModal.vue` — boş sipariş confirm

### E2E (Playwright + Firebase Emulator)
- Login → 3 ürün gir → Kaydet ve Paylaş → Firestore'da yazıldı mı
- Geçmişe git → sipariş listede mi
- Şablon yükle → form dolu mu

CI: GitHub Actions her PR'da `npm test` + `npm run test:e2e`.

## 7. Deploy & Çevre Değişkenleri

**Vercel** üç ortam (production / preview / development):

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_OWNER_UID
VITE_SENTRY_DSN  (opsiyonel)
```

**Firebase Console**:
- Authorized domains: `menu-istek-v2.vercel.app` + Vercel preview wildcard
- Authentication → Google provider aktif
- Firestore rules deploy: `firebase deploy --only firestore:rules`

**Performans hedefi**: bundle < 250 KB gzipped. pdfmake (~80 KB) lazy-load (sadece "Kaydet ve Paylaş" akışında dynamic import).

## 8. Kapsam Dışı (YAGNI)

- Çoklu kullanıcı / multi-tenancy
- Login olmadan kullanım
- Sipariş üzerinde yorum / takip
- Push notification
- Otomatik bulut yedekleme (manuel JSON Export var)
- Logo/marka ayarı (metin başlık yeterli — Soru 8/A)
- Sipariş istatistikleri / dashboard (Soru 10/B seçildi, C reddedildi)
- Adım adım wizard UI (Yaklaşım C reddedildi)
- TypeScript

## 9. Açık Sorular / Karar Bekleyenler

Yok — brainstorming aşamasında 13 soru ile tüm kararlar netleşti.

## 10. Sonraki Adım

Bu spec onaylandıktan sonra `superpowers:writing-plans` skill'ine geçilecek; orada bu spec implementasyon planına (görev listesi, test stratejisi, sıralama) dönüştürülecek.
