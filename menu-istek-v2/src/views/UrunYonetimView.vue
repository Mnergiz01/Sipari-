<script setup>
import { ref, computed } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { kategoriSchema, urunSchema } from '@/utils/validation'

const catalog = useCatalogStore()
const toast = useToast()
const confirm = useConfirm()

const sekme = ref('urunler') // 'urunler' | 'kategoriler'
const arsivGoster = ref(false)

// Ürün form state
const urunForm = ref(null) // null=kapalı, {} = yeni, {id, ...}=düzenle
const kategoriForm = ref(null)

const filteredUrunler = computed(() => {
  return arsivGoster.value ? catalog.products : catalog.aktifUrunler
})

const urunlerByKat = computed(() => {
  const m = new Map()
  for (const u of filteredUrunler.value) {
    if (!m.has(u.categoryId)) m.set(u.categoryId, [])
    m.get(u.categoryId).push(u)
  }
  return m
})

function yeniUrun() {
  urunForm.value = { name: '', categoryId: catalog.categories[0]?.id || '', unit: 'adet', order: 999 }
}
function urunDuzenle(u) {
  urunForm.value = { ...u }
}
async function urunKaydet() {
  const parsed = urunSchema.safeParse(urunForm.value)
  if (!parsed.success) {
    toast.add({ severity: 'warn', summary: 'Eksik bilgi', detail: parsed.error.errors[0].message, life: 3000 })
    return
  }
  try {
    if (urunForm.value.id) {
      await catalog.urunGuncelle(urunForm.value.id, parsed.data)
      toast.add({ severity: 'success', summary: 'Güncellendi', life: 2000 })
    } else {
      await catalog.urunEkle({ ...parsed.data, order: urunForm.value.order ?? 999 })
      toast.add({ severity: 'success', summary: 'Eklendi', life: 2000 })
    }
    urunForm.value = null
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Hata', detail: err.message, life: 3000 })
  }
}
function urunArsivToggle(u) {
  catalog.urunArsivle(u.id, !u.archived)
  toast.add({ severity: 'info', summary: u.archived ? 'Geri yüklendi' : 'Arşivlendi', life: 2000 })
}

function yeniKategori() { kategoriForm.value = { name: '', icon: '' } }
function kategoriDuzenle(k) { kategoriForm.value = { ...k } }
async function kategoriKaydet() {
  const parsed = kategoriSchema.safeParse(kategoriForm.value)
  if (!parsed.success) {
    toast.add({ severity: 'warn', summary: 'Eksik bilgi', detail: parsed.error.errors[0].message, life: 3000 })
    return
  }
  try {
    if (kategoriForm.value.id) {
      await catalog.kategoriGuncelle(kategoriForm.value.id, parsed.data)
    } else {
      await catalog.kategoriEkle({ ...parsed.data, order: catalog.categories.length })
    }
    toast.add({ severity: 'success', summary: 'Kaydedildi', life: 2000 })
    kategoriForm.value = null
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Hata', detail: err.message, life: 3000 })
  }
}

function kategoriSil(k) {
  const aktifUrun = catalog.aktifUrunler.filter(u => u.categoryId === k.id).length
  if (aktifUrun > 0) {
    toast.add({
      severity: 'warn',
      summary: 'Silinemez',
      detail: `Bu kategoride ${aktifUrun} aktif ürün var. Önce taşı veya arşivle.`,
      life: 4000
    })
    return
  }
  confirm.require({
    message: `"${k.name}" kategorisi silinecek. Emin misin?`,
    header: 'Kategori Sil',
    icon: 'pi pi-trash',
    acceptLabel: 'Sil',
    rejectLabel: 'Vazgeç',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await catalog.kategoriSil(k.id)
      toast.add({ severity: 'info', summary: 'Silindi', life: 2000 })
    }
  })
}

async function fabrikaAyarlari() {
  confirm.require({
    message: 'Eksik kategoriler ve ürünler eklenecek. Mevcutlar değişmez. Devam?',
    header: 'Fabrika Ayarları',
    icon: 'pi pi-sync',
    acceptLabel: 'Yükle',
    rejectLabel: 'Vazgeç',
    accept: async () => {
      try {
        await catalog.fabrikaAyarlarinaDon()
        toast.add({ severity: 'success', summary: 'Yüklendi', life: 2500 })
      } catch (err) {
        toast.add({ severity: 'error', summary: 'Hata', detail: err.message, life: 3000 })
      }
    }
  })
}
</script>

<template>
  <!-- Sekme bar -->
  <div class="flex gap-1 mb-5 p-1 bg-surface-alt rounded-lg border border-border">
    <button
      @click="sekme = 'urunler'"
      class="flex-1 py-2 text-sm font-medium rounded-md transition-all"
      :class="sekme === 'urunler' ? 'bg-surface text-text shadow-xs' : 'text-text-muted hover:text-text'"
    >Ürünler <span class="text-2xs ml-1 tabular text-text-subtle">{{ catalog.aktifUrunler.length }}</span></button>
    <button
      @click="sekme = 'kategoriler'"
      class="flex-1 py-2 text-sm font-medium rounded-md transition-all"
      :class="sekme === 'kategoriler' ? 'bg-surface text-text shadow-xs' : 'text-text-muted hover:text-text'"
    >Kategoriler <span class="text-2xs ml-1 tabular text-text-subtle">{{ catalog.categories.length }}</span></button>
  </div>

  <!-- ÜRÜNLER -->
  <template v-if="sekme === 'urunler'">
    <div class="flex flex-wrap gap-2 mb-3">
      <button class="btn btn-primary" @click="yeniUrun"><i class="pi pi-plus"></i> Yeni Ürün</button>
      <label class="btn btn-ghost cursor-pointer">
        <input type="checkbox" v-model="arsivGoster" class="mr-1" /> Arşivi Göster
      </label>
      <button class="btn btn-ghost ml-auto" @click="fabrikaAyarlari">
        <i class="pi pi-sync"></i> Fabrika Ayarları
      </button>
    </div>

    <div v-if="catalog.categories.length === 0" class="surface p-6 text-center text-sm text-text-muted">
      Henüz kategori yok. Önce kategori ekle veya "Fabrika Ayarları" ile seed verisi yükle.
    </div>

    <section v-for="kat in catalog.categories" :key="kat.id" class="surface p-4 mb-3">
      <h3 class="editorial-caption mb-2">{{ kat.icon }} {{ kat.name }}</h3>
      <ul v-if="urunlerByKat.get(kat.id)?.length" class="divide-y divide-border">
        <li v-for="u in urunlerByKat.get(kat.id)" :key="u.id" class="flex items-center justify-between py-2">
          <div class="flex-1">
            <p class="text-sm" :class="u.archived && 'text-text-muted line-through'">{{ u.name }}</p>
            <p class="text-2xs text-text-muted">{{ u.unit }}</p>
          </div>
          <div class="flex gap-1">
            <button class="btn btn-ghost px-2 py-1" @click="urunDuzenle(u)" aria-label="Düzenle">
              <i class="pi pi-pencil text-xs"></i>
            </button>
            <button class="btn btn-ghost px-2 py-1" @click="urunArsivToggle(u)" :aria-label="u.archived ? 'Geri yükle' : 'Arşivle'">
              <i :class="['pi', u.archived ? 'pi-undo' : 'pi-eye-slash', 'text-xs']"></i>
            </button>
          </div>
        </li>
      </ul>
      <p v-else class="text-xs text-text-muted">Bu kategoride ürün yok.</p>
    </section>
  </template>

  <!-- KATEGORİLER -->
  <template v-else>
    <div class="flex gap-2 mb-3">
      <button class="btn btn-primary" @click="yeniKategori"><i class="pi pi-plus"></i> Yeni Kategori</button>
    </div>
    <ul class="surface divide-y divide-border">
      <li v-for="k in catalog.categories" :key="k.id" class="flex items-center gap-3 p-3">
        <span class="text-xl">{{ k.icon || '📁' }}</span>
        <div class="flex-1">
          <p class="text-sm font-medium">{{ k.name }}</p>
          <p class="text-2xs text-text-muted">
            {{ catalog.aktifUrunler.filter(u => u.categoryId === k.id).length }} ürün
          </p>
        </div>
        <button class="btn btn-ghost px-2 py-1" @click="kategoriDuzenle(k)"><i class="pi pi-pencil text-xs"></i></button>
        <button class="btn btn-ghost px-2 py-1" @click="kategoriSil(k)"><i class="pi pi-trash text-xs text-error"></i></button>
      </li>
    </ul>
  </template>

  <!-- Ürün form modal -->
  <div v-if="urunForm" class="fixed inset-0 bg-black/60 z-40 flex items-end md:items-center justify-center p-4" @click.self="urunForm = null">
    <div class="surface w-full max-w-md p-5">
      <h3 class="text-base font-semibold mb-4">{{ urunForm.id ? 'Ürün Düzenle' : 'Yeni Ürün' }}</h3>
      <label class="block mb-3">
        <span class="editorial-caption block mb-1">Ürün Adı</span>
        <input v-model="urunForm.name" type="text" class="w-full bg-surface-alt border border-border rounded px-3 py-2 text-sm" />
      </label>
      <label class="block mb-3">
        <span class="editorial-caption block mb-1">Kategori</span>
        <select v-model="urunForm.categoryId" class="w-full bg-surface-alt border border-border rounded px-3 py-2 text-sm">
          <option v-for="k in catalog.categories" :key="k.id" :value="k.id">{{ k.icon }} {{ k.name }}</option>
        </select>
      </label>
      <label class="block mb-4">
        <span class="editorial-caption block mb-1">Birim</span>
        <select v-model="urunForm.unit" class="w-full bg-surface-alt border border-border rounded px-3 py-2 text-sm">
          <option value="adet">adet</option>
          <option value="kg">kg</option>
        </select>
      </label>
      <div class="flex gap-2 justify-end">
        <button class="btn btn-ghost" @click="urunForm = null">İptal</button>
        <button class="btn btn-primary" @click="urunKaydet">Kaydet</button>
      </div>
    </div>
  </div>

  <!-- Kategori form modal -->
  <div v-if="kategoriForm" class="fixed inset-0 bg-black/60 z-40 flex items-end md:items-center justify-center p-4" @click.self="kategoriForm = null">
    <div class="surface w-full max-w-md p-5">
      <h3 class="text-base font-semibold mb-4">{{ kategoriForm.id ? 'Kategori Düzenle' : 'Yeni Kategori' }}</h3>
      <label class="block mb-3">
        <span class="editorial-caption block mb-1">Ad</span>
        <input v-model="kategoriForm.name" type="text" class="w-full bg-surface-alt border border-border rounded px-3 py-2 text-sm" />
      </label>
      <label class="block mb-4">
        <span class="editorial-caption block mb-1">İkon (Emoji, opsiyonel)</span>
        <input v-model="kategoriForm.icon" type="text" placeholder="🍦" class="w-full bg-surface-alt border border-border rounded px-3 py-2 text-sm" />
      </label>
      <div class="flex gap-2 justify-end">
        <button class="btn btn-ghost" @click="kategoriForm = null">İptal</button>
        <button class="btn btn-primary" @click="kategoriKaydet">Kaydet</button>
      </div>
    </div>
  </div>
</template>
