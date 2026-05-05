// Mevcut menu-istek.vercel.app'tan çıkarılan başlangıç verisi
// 11 kategori, 106 ürün

export const SEED_KATEGORILER = [
  { id: 'dondurma', name: 'Dondurma', order: 0, icon: '🍦' },
  { id: 'corek', name: 'Çörek', order: 1, icon: '🥨' },
  { id: 'kurabiye-fistik', name: 'Kurabiye & Fıstık', order: 2, icon: '🥜' },
  { id: 'icecek-sicaklar', name: 'İçecek & Sıcaklar', order: 3, icon: '☕' },
  { id: 'cig-urunler', name: 'Çiğ Ürünler', order: 4, icon: '🥖' },
  { id: 'reyon', name: 'Reyon Ürünleri', order: 5, icon: '🍧' },
  { id: 'ambalaj', name: 'Ambalajlar', order: 6, icon: '🛍️' },
  { id: 'kutu', name: 'Kutular', order: 7, icon: '📦' },
  { id: 'tatli-diger', name: 'Tatlı & Diğer', order: 8, icon: '🍰' },
  { id: 'baklavacilar', name: 'Baklavacılar', order: 9, icon: '🍯' },
  { id: 'pastacilar', name: 'Pastacılar', order: 10, icon: '🎂' }
]

const u = (name, categoryId, order, unit = 'adet') => ({ name, categoryId, order, unit })

export const SEED_URUNLER = [
  // Dondurma
  u('Kiloluk', 'dondurma', 0),
  u('Yarımlık', 'dondurma', 1),
  u('Tulumba', 'dondurma', 2),
  u('Kol Dondurma', 'dondurma', 3),
  u('Kase Dondurma', 'dondurma', 4),
  u('250 Gram Dondurma', 'dondurma', 5),
  u('Parmak Dondurma (Çikolata)', 'dondurma', 6),
  u('Parmak Dondurma (Frambuaz)', 'dondurma', 7),
  u('Çikolata Baton', 'dondurma', 8),
  u('Fıstıklı Baton', 'dondurma', 9),
  u('Meyveli Baton', 'dondurma', 10),
  u('Ç-F-S', 'dondurma', 11),

  // Çörek
  u('Kiloluk Tuzlu Çörek', 'corek', 0),
  u('Kiloluk Şekerli Çörek', 'corek', 1),
  u('Yarımlık Tuzlu Çörek', 'corek', 2),
  u('Yarımlık Şekerli Çörek', 'corek', 3),

  // Kurabiye & Fıstık
  u('Fıstıklı Maraş Kurabiyesi', 'kurabiye-fistik', 0),
  u('Sade Maraş Kurabiyesi', 'kurabiye-fistik', 1),
  u('Kiloluk Tuzlu Fıstık', 'kurabiye-fistik', 2),
  u('Yarımlık Tuzlu Fıstık', 'kurabiye-fistik', 3),
  u('Kiloluk Fıstık Ezmesi', 'kurabiye-fistik', 4),
  u('Yarımlık Fıstık Ezmesi', 'kurabiye-fistik', 5),
  u('250 Gram Fıstık Ezmesi', 'kurabiye-fistik', 6),
  u('100 Gram Fıstık Ezmesi', 'kurabiye-fistik', 7),
  u('Tuzlu Kurabiye', 'kurabiye-fistik', 8),
  u('Şekerli Kurabiye', 'kurabiye-fistik', 9),

  // İçecek & Sıcaklar
  u('Türk Kahvesi (500 gr)', 'icecek-sicaklar', 0),
  u('Türk Kahvesi (100 gr)', 'icecek-sicaklar', 1),
  u('Salep Cam Şişe', 'icecek-sicaklar', 2),
  u('UHT Salep', 'icecek-sicaklar', 3),
  u('Tekli Salep Fıstıklı', 'icecek-sicaklar', 4),
  u('Sıcak Çikolata Cam Şişe', 'icecek-sicaklar', 5),
  u('Sıcak Çikolata Kutu', 'icecek-sicaklar', 6),
  u('Granür Salep', 'icecek-sicaklar', 7),

  // Çiğ Ürünler
  u('Çiğ Açma Simit', 'cig-urunler', 0),
  u('Çiğ Açma Sade', 'cig-urunler', 1),
  u('Çiğ Açma Peynirli', 'cig-urunler', 2),
  u('Çiğ Poğaça Sade', 'cig-urunler', 3),
  u('Çiğ Poğaça Peynirli', 'cig-urunler', 4),
  u('Çiğ Poğaça Patatesli', 'cig-urunler', 5),

  // Reyon Ürünleri
  u('Reyon Çikolata', 'reyon', 0),
  u('Reyon Limon', 'reyon', 1),
  u('Reyon Frambuaz', 'reyon', 2),
  u('Reyon Karamel', 'reyon', 3),
  u('Reyon İtalyan Karameli', 'reyon', 4),
  u('Reyon Böğürtlen', 'reyon', 5),
  u('Reyon Karadut', 'reyon', 6),
  u('Reyon Çilek', 'reyon', 7),
  u('Reyon Portakal', 'reyon', 8),
  u('Reyon Damla Sakızlı', 'reyon', 9),
  u('Reyon Hindistan Cevizi', 'reyon', 10),
  u('Reyon Frutti', 'reyon', 11),
  u('Reyon Kavun', 'reyon', 12),
  u('Reyon Mango', 'reyon', 13),
  u('Reyon Muz', 'reyon', 14),

  // Ambalajlar
  u('Tekli Bez Çanta', 'ambalaj', 0),
  u('Çiftli Bez Çanta', 'ambalaj', 1),
  u('Mado Bant', 'ambalaj', 2),
  u('Termos Çanta', 'ambalaj', 3),
  u('Tepsi Çantası (650 gr)', 'ambalaj', 4),
  u('Tepsi Çantası (1000 gr)', 'ambalaj', 5),
  u('Kiloluk Ezme Çantası', 'ambalaj', 6),
  u('Yarımlık Ezme Çantası', 'ambalaj', 7),

  // Kutular
  u('Kiloluk Kuru Pasta Kutusu', 'kutu', 0),
  u('Yarımlık Kuru Pasta Kutusu', 'kutu', 1),
  u('Kiloluk Tatlı Kutusu', 'kutu', 2),
  u('Yarımlık Tatlı Kutusu', 'kutu', 3),
  u('250 Gram Tatlı Kutusu', 'kutu', 4),
  u('Pasta Kutusu', 'kutu', 5),

  // Tatlı & Diğer
  u('Künefe', 'tatli-diger', 0),
  u('Peynirli Su Böreği', 'tatli-diger', 1),
  u('Su Böreği', 'tatli-diger', 2),
  u('Tarhana', 'tatli-diger', 3),
  u('Fırın Sütlaç', 'tatli-diger', 4),
  u('Kazandibi', 'tatli-diger', 5),
  u('Profiterol', 'tatli-diger', 6),
  u('Supangle', 'tatli-diger', 7),
  u('Künefe Şerbeti', 'tatli-diger', 8, 'kg'),
  u('Toz Fıstık', 'tatli-diger', 9, 'kg'),
  u('Künefe Yağı', 'tatli-diger', 10, 'kg'),

  // Baklavacılar
  u('Fıstıklı Baklava (650 gr)', 'baklavacilar', 0),
  u('Fıstıklı Baklava (1000 gr)', 'baklavacilar', 1),
  u('Fıstıklı Kadayıf (650 gr)', 'baklavacilar', 2),
  u('Fıstıklı Kadayıf (1000 gr)', 'baklavacilar', 3),
  u('Bülbül Yuvası (650 gr)', 'baklavacilar', 4),
  u('Bülbül Yuvası (1000 gr)', 'baklavacilar', 5),
  u('Fıstıklı Midye', 'baklavacilar', 6),
  u('Fıstıklı Şöbiyet', 'baklavacilar', 7),
  u('Fıstıklı Burma (650 gr)', 'baklavacilar', 8),
  u('Fıstıklı Burma (1000 gr)', 'baklavacilar', 9),
  u('Burma Kadayıf', 'baklavacilar', 10),
  u('Havuç Dilimi', 'baklavacilar', 11),
  u('Fıstıklı Kıvrım', 'baklavacilar', 12),
  u('Cevizli Kıvrım', 'baklavacilar', 13),
  u('Cevizli Baklava (650 gr)', 'baklavacilar', 14),
  u('Künefe Şerbeti (Baklavacı)', 'baklavacilar', 15, 'kg'),
  u('Künefe Yağı (Baklavacı)', 'baklavacilar', 16, 'kg'),
  u('Soğuk Baklava (650 gr)', 'baklavacilar', 17),

  // Pastacılar
  u('Ekler (650 gr)', 'pastacilar', 0),
  u('Tekli Pasta (Çikolata)', 'pastacilar', 1),
  u('Tekli Pasta (Oreo)', 'pastacilar', 2),
  u('Tekli Pasta (Frambuaz)', 'pastacilar', 3),
  u('Tekli Pasta (Çilek)', 'pastacilar', 4),
  u('Tekli Pasta (Meyveli)', 'pastacilar', 5),
  u('Meyveli Turta', 'pastacilar', 6),
  u('Çikolata Turta', 'pastacilar', 7)
]
