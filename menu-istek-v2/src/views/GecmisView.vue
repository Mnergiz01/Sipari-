<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useCatalogStore } from '@/stores/catalog'
import { useSettingsStore } from '@/stores/settings'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { usePdfGenerator } from '@/composables/usePdfGenerator'
import { useShare } from '@/composables/useShare'
import { kisaTarih, uzunTarih } from '@/utils/tarih'

const router = useRouter()
const orders = useOrdersStore()
const catalog = useCatalogStore()
const settings = useSettingsStore()
const toast = useToast()
const confirm = useConfirm()
const { generate } = usePdfGenerator()
const { paylas, indir } = useShare()

const arama = ref('')
const detay = ref(null)

const filtreliSiparisler = computed(() => {
  const q = arama.value.trim().toLowerCase()
  if (!q) return orders.orders
  return orders.orders.filter(o =>
    o.location?.toLowerCase().includes(q)
    || o.date?.includes(q)
    || (o.items || []).some(i => i.productName?.toLowerCase().includes(q))
  )
})

function sablonOlarakKullan(o) {
  orders.sablonOlarakYukle(o)
  toast.add({ severity: 'success', summary: 'Şablon yüklendi', detail: `${o.totalCount} kalem`, life: 2500 })
  router.push('/')
}

async function pdfTekrarUret(o) {
  try {
    const { blob, filename } = await generate(o)
    await paylas({ blob, filename, order: o, defaultContact: settings.whatsappContact })
  } catch (err) {
    toast.add({ severity: 'error', summary: 'PDF üretilemedi', detail: err.message, life: 4000 })
  }
}

async function pdfIndir(o) {
  try {
    const { blob, filename } = await generate(o)
    indir({ blob, filename })
    toast.add({ severity: 'success', summary: 'PDF indirildi', life: 2500 })
  } catch (err) {
    toast.add({ severity: 'error', summary: 'PDF üretilemedi', detail: err.message, life: 4000 })
  }
}

function sil(o) {
  confirm.require({
    message: `${kisaTarih(o.date)} tarihli sipariş silinecek. Geri alınamaz.`,
    header: 'Sipariş Sil',
    icon: 'pi pi-trash',
    acceptLabel: 'Sil',
    rejectLabel: 'Vazgeç',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await orders.siparisSil(o.id)
      toast.add({ severity: 'info', summary: 'Silindi', life: 2000 })
    }
  })
}
</script>

<template>
  <div class="relative mb-5">
    <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle text-xs"></i>
    <input
      v-model="arama"
      type="search"
      placeholder="Şube, tarih veya ürün ara..."
      class="input pl-9"
    />
  </div>

  <div v-if="!orders.ready" class="text-center text-text-muted py-16">
    <i class="pi pi-spin pi-spinner text-2xl"></i>
  </div>

  <div v-else-if="filtreliSiparisler.length === 0" class="surface p-8 text-center text-sm text-text-muted">
    <i class="pi pi-inbox text-2xl text-text-subtle mb-2 block"></i>
    {{ orders.orders.length === 0 ? 'Henüz sipariş yok. İlk siparişini girip kaydedince burada listelenecek.' : 'Aramaya uygun sipariş bulunamadı.' }}
  </div>

  <ul v-else class="space-y-3">
    <li v-for="o in filtreliSiparisler" :key="o.id" class="surface p-5 group hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between gap-3 mb-4">
        <div class="min-w-0 flex-1">
          <div class="flex items-baseline gap-2 mb-1">
            <h3 class="editorial-display text-base">{{ uzunTarih(o.date) }}</h3>
            <span class="text-2xs text-text-muted">· {{ o.dayName }}</span>
          </div>
          <div class="flex flex-wrap gap-x-3 gap-y-0.5 text-2xs text-text-muted">
            <span class="inline-flex items-center gap-1"><i class="pi pi-map-marker text-3xs"></i> {{ o.location }}</span>
            <span class="inline-flex items-center gap-1 tabular"><i class="pi pi-shopping-cart text-3xs"></i> {{ o.totalCount }} kalem</span>
          </div>
        </div>
        <button class="btn btn-icon btn-ghost opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                @click="sil(o)" aria-label="Sil">
          <i class="pi pi-trash text-error text-xs"></i>
        </button>
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="btn btn-soft" @click="detay = o">
          <i class="pi pi-eye"></i> Görüntüle
        </button>
        <button class="btn btn-soft" @click="sablonOlarakKullan(o)">
          <i class="pi pi-copy"></i> Şablon
        </button>
        <button class="btn btn-soft" @click="pdfIndir(o)">
          <i class="pi pi-download"></i> PDF
        </button>
        <button class="btn btn-primary" @click="pdfTekrarUret(o)">
          <i class="pi pi-share-alt"></i> Paylaş
        </button>
      </div>
    </li>
  </ul>

  <!-- Detay modal -->
  <div v-if="detay" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-end md:items-center justify-center p-4" @click.self="detay = null">
    <div class="surface-elevated w-full max-w-md max-h-[80vh] overflow-y-auto p-6">
      <div class="flex items-start justify-between mb-4">
        <div>
          <p class="editorial-caption">Sipariş Detayı</p>
          <h3 class="editorial-display text-lg mt-0.5">{{ uzunTarih(detay.date) }}</h3>
          <p class="text-xs text-text-muted mt-0.5">{{ detay.dayName }} · {{ detay.location }}</p>
        </div>
        <button class="btn btn-icon btn-ghost" @click="detay = null"><i class="pi pi-times"></i></button>
      </div>
      <ul class="divide-y divide-hairline text-sm -my-2">
        <li v-for="(it, i) in detay.items" :key="i" class="py-2.5 flex justify-between gap-3">
          <span class="flex-1">
            {{ it.productName }}
            <span class="text-3xs text-text-subtle ml-1">{{ it.categoryName }}</span>
          </span>
          <span class="font-mono tabular text-text font-medium">{{ it.quantity }} <span class="text-text-subtle text-2xs ml-0.5">{{ it.unit }}</span></span>
        </li>
      </ul>
      <p v-if="detay.note" class="mt-5 pt-4 border-t border-hairline text-xs italic text-text-muted">
        <span class="editorial-caption block mb-1.5 not-italic">Not</span>
        {{ detay.note }}
      </p>
    </div>
  </div>
</template>
