<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import { useOrdersStore } from '@/stores/orders'
import { useSettingsStore } from '@/stores/settings'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { usePdfGenerator } from '@/composables/usePdfGenerator'
import { useShare } from '@/composables/useShare'
import { kisaTarih } from '@/utils/tarih'

const catalog = useCatalogStore()
const orders = useOrdersStore()
const settings = useSettingsStore()
const toast = useToast()
const confirm = useConfirm()
const { generate } = usePdfGenerator()
const { paylas, indir } = useShare()

const aktifKategoriId = ref(null)
const paylasiyor = ref(false)
const indiriliyor = ref(false)

const kategoriler = computed(() => [...catalog.categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))

onMounted(() => {
  if (!orders.draft.location) {
    orders.draft.location = settings.lastUsedLocation
  }
})

function adetDegistir(productId, delta) {
  const cur = Number(orders.draft.quantities[productId] || 0)
  orders.adetAyarla(productId, cur + delta)
}

async function kategoriyeKaydir(id) {
  aktifKategoriId.value = id
  await nextTick()
  document.getElementById(`kat-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function sifirla() {
  confirm.require({
    message: 'Tüm girilen adetler ve form silinecek. Emin misin?',
    header: 'Sıfırla',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sıfırla',
    rejectLabel: 'Vazgeç',
    accept: () => {
      orders.sifirla()
      toast.add({ severity: 'info', summary: 'Sıfırlandı', life: 2000 })
    }
  })
}

function buildOrderObject() {
  return {
    ...orders.draft,
    items: Object.entries(orders.draft.quantities).map(([pid, qty]) => {
      const u = catalog.products.find(p => p.id === pid)
      const k = catalog.kategoriById(u?.categoryId)
      return {
        productId: pid,
        productName: u?.name || '',
        categoryName: k?.name || '',
        quantity: Number(qty),
        unit: u?.unit || 'adet'
      }
    }),
    totalCount: orders.dolulemSayisi
  }
}

async function pdfIndir() {
  if (orders.dolulemSayisi === 0) {
    toast.add({ severity: 'warn', summary: 'Boş sipariş', detail: 'En az bir ürüne adet gir.', life: 2500 })
    return
  }
  indiriliyor.value = true
  try {
    const order = buildOrderObject()
    const { blob, filename } = await generate(order)
    indir({ blob, filename })
    toast.add({ severity: 'success', summary: 'PDF indirildi', life: 2500 })
  } catch (err) {
    toast.add({ severity: 'error', summary: 'PDF üretilemedi', detail: err.message, life: 4000 })
  } finally {
    indiriliyor.value = false
  }
}

async function kaydetVePaylas() {
  if (!orders.draft.location?.trim()) {
    toast.add({ severity: 'warn', summary: 'Şube adı zorunlu', life: 3000 })
    return
  }
  if (orders.dolulemSayisi === 0) {
    confirm.require({
      message: 'Hiç ürün girilmedi. Yine de kaydedip paylaşmak istiyor musun?',
      header: 'Boş sipariş',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Devam',
      rejectLabel: 'İptal',
      accept: () => doKaydetVePaylas()
    })
  } else {
    await doKaydetVePaylas()
  }
}

async function doKaydetVePaylas() {
  paylasiyor.value = true
  try {
    settings.lastUsedLocation = orders.draft.location
    const orderId = await orders.kaydet(catalog)
    const order = { id: orderId, ...buildOrderObject() }
    const { blob, filename } = await generate(order)
    const result = await paylas({ blob, filename, order, defaultContact: settings.whatsappContact })
    if (result.method === 'fallback-download') {
      toast.add({ severity: 'success', summary: 'PDF indirildi', detail: 'Mesaj kopyalandı, WhatsApp\'a yapıştırabilirsin.', life: 4000 })
    } else if (result.method !== 'share-cancelled') {
      toast.add({ severity: 'success', summary: 'Sipariş kaydedildi', life: 2500 })
    }
    orders.sifirla()
    if (orders.draft) orders.draft.location = settings.lastUsedLocation
  } catch (err) {
    console.error(err)
    toast.add({ severity: 'error', summary: 'Hata', detail: err.message || 'Bilinmeyen hata', life: 4000 })
  } finally {
    paylasiyor.value = false
  }
}
</script>

<template>
  <div v-if="!catalog.ready" class="text-center text-text-muted py-16">
    <i class="pi pi-spin pi-spinner text-2xl"></i>
    <p class="mt-3 text-sm">Yükleniyor...</p>
  </div>

  <div v-else-if="catalog.categories.length === 0" class="surface-elevated p-8 text-center">
    <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-accent-soft flex items-center justify-center">
      <i class="pi pi-box text-accent"></i>
    </div>
    <h3 class="font-semibold mb-1">Henüz ürün yok</h3>
    <p class="text-sm text-text-muted mb-5">
      Ürün yönetimine git ve fabrika ayarlarını yükle — 11 kategori, 106 ürün hemen hazır.
    </p>
    <RouterLink to="/urunler" class="btn btn-primary inline-flex">
      <i class="pi pi-arrow-right"></i> Ürün Yönetimine Git
    </RouterLink>
  </div>

  <template v-else>
    <!-- Tarih + form alanları -->
    <section class="surface p-5 mb-5">
      <div class="grid grid-cols-2 gap-3 mb-3">
        <label class="block">
          <span class="editorial-caption block mb-1.5">Tarih</span>
          <input
            type="date"
            :value="orders.draft.date"
            @input="e => orders.tarihAyarla(e.target.value)"
            class="input input-soft tabular"
          />
        </label>
        <div>
          <span class="editorial-caption block mb-1.5">Gün</span>
          <p class="text-sm font-medium font-mono px-3 py-2.5 bg-surface-alt rounded-sm border border-transparent">
            {{ orders.draft.dayName }}
          </p>
        </div>
      </div>
      <label class="block mb-3">
        <span class="editorial-caption block mb-1.5">Şube</span>
        <input
          v-model="orders.draft.location"
          type="text"
          placeholder="Türkoğlu Mado"
          class="input input-soft"
        />
      </label>
      <label class="block">
        <span class="editorial-caption block mb-1.5">Not <span class="text-text-subtle font-normal lowercase">(opsiyonel)</span></span>
        <textarea
          v-model="orders.draft.note"
          rows="2"
          placeholder="Reyon az kalmış, takviye lazım..."
          class="input input-soft resize-none"
        />
      </label>
    </section>

    <!-- Sticky kategori bar -->
    <div class="sticky top-[68px] z-20 -mx-4 px-4 py-2.5 bg-bg/85 backdrop-blur-xl border-b border-border">
      <div class="flex gap-2 overflow-x-auto no-scrollbar">
        <button
          v-for="kat in kategoriler" :key="kat.id"
          @click="kategoriyeKaydir(kat.id)"
          class="chip"
          :class="aktifKategoriId === kat.id ? 'chip-active' : 'hover:text-text'"
        >
          <span v-if="kat.icon">{{ kat.icon }}</span>
          <span>{{ kat.name }}</span>
        </button>
      </div>
    </div>

    <!-- Kategori listeleri -->
    <section
      v-for="kat in kategoriler"
      :key="kat.id"
      :id="`kat-${kat.id}`"
      class="surface p-5 mb-4 scroll-mt-36"
    >
      <header class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <span v-if="kat.icon" class="text-base">{{ kat.icon }}</span>
          <h2 class="editorial-display text-base">{{ kat.name }}</h2>
        </div>
        <span class="editorial-caption">
          {{ catalog.urunlerByKategori(kat.id).length }} ürün
        </span>
      </header>
      <div v-if="catalog.urunlerByKategori(kat.id).length === 0" class="text-xs text-text-muted py-2">
        Bu kategoride ürün yok.
      </div>
      <ul v-else class="divide-y divide-hairline -my-2">
        <li
          v-for="urun in catalog.urunlerByKategori(kat.id)"
          :key="urun.id"
          class="flex items-center justify-between gap-3 py-2.5"
        >
          <span class="text-sm flex-1 leading-tight">{{ urun.name }}</span>
          <div class="flex items-center gap-1.5">
            <button
              @click="adetDegistir(urun.id, -1)"
              class="qty-btn"
              :aria-label="`${urun.name} adetini azalt`"
            >−</button>
            <input
              type="number"
              min="0"
              :value="orders.draft.quantities[urun.id] || 0"
              @input="e => orders.adetAyarla(urun.id, e.target.value)"
              class="qty-input"
              :aria-label="`${urun.name} adet`"
              inputmode="numeric"
            />
            <button
              @click="adetDegistir(urun.id, 1)"
              class="qty-btn"
              style="border-color: var(--color-accent-line); color: var(--color-accent);"
              :aria-label="`${urun.name} adetini artır`"
            >+</button>
            <span class="text-3xs text-text-subtle uppercase tracking-wider w-8 text-right font-medium">{{ urun.unit }}</span>
          </div>
        </li>
      </ul>
    </section>

    <!-- Footer floating -->
    <div class="fixed bottom-16 md:bottom-4 inset-x-0 px-4 z-20 pointer-events-none">
      <div class="surface-elevated max-w-3xl mx-auto p-3 flex items-center gap-2 pointer-events-auto">
        <div class="flex-1 min-w-0 px-1">
          <p class="text-xs text-text-muted leading-tight">
            <span class="font-mono text-sm font-semibold text-text tabular">{{ orders.dolulemSayisi }}</span>
            <span class="ml-1">kalem</span>
            <span class="mx-1.5 text-text-subtle">·</span>
            <span class="tabular">{{ kisaTarih(orders.draft.date) }}</span>
          </p>
        </div>
        <button
          class="btn btn-ghost btn-icon"
          @click="sifirla"
          :disabled="paylasiyor || indiriliyor"
          aria-label="Sıfırla"
          title="Sıfırla"
        >
          <i class="pi pi-refresh"></i>
        </button>
        <button
          class="btn btn-ghost btn-icon"
          @click="pdfIndir"
          :disabled="paylasiyor || indiriliyor"
          aria-label="PDF indir"
          title="PDF indir"
        >
          <i :class="indiriliyor ? 'pi pi-spin pi-spinner' : 'pi pi-download'"></i>
        </button>
        <button
          class="btn btn-primary"
          @click="kaydetVePaylas"
          :disabled="paylasiyor || indiriliyor"
        >
          <i :class="paylasiyor ? 'pi pi-spin pi-spinner' : 'pi pi-share-alt'"></i>
          <span class="hidden sm:inline">Kaydet & Paylaş</span>
        </button>
      </div>
    </div>
  </template>
</template>
