import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore'
import { db } from '@/services/firebase'
import * as svc from '@/services/ordersService'
import { bugununTarihi, gunAdi } from '@/utils/tarih'

function bosForm() {
  const date = bugununTarihi()
  return {
    date,
    dayName: gunAdi(date),
    location: '',
    note: '',
    quantities: {} // { productId: number }
  }
}

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([])
  const draft = ref(bosForm())
  const ready = ref(false)
  let unsub = null

  function bind() {
    if (!db) return
    unbind()
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100))
    unsub = onSnapshot(q, snap => {
      orders.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      ready.value = true
    })
  }

  function unbind() {
    if (unsub) { unsub(); unsub = null }
    orders.value = []
    ready.value = false
  }

  const dolulemSayisi = computed(() => {
    return Object.values(draft.value.quantities).filter(q => Number(q) > 0).length
  })

  function adetAyarla(productId, value) {
    const v = Math.max(0, Number(value) || 0)
    if (v === 0) {
      delete draft.value.quantities[productId]
    } else {
      draft.value.quantities[productId] = v
    }
  }

  function tarihAyarla(date) {
    draft.value.date = date
    draft.value.dayName = gunAdi(date)
  }

  function sifirla() {
    draft.value = bosForm()
  }

  function sablonOlarakYukle(order) {
    const qmap = {}
    for (const item of order.items || []) {
      qmap[item.productId] = item.quantity
    }
    draft.value = {
      date: bugununTarihi(),
      dayName: gunAdi(bugununTarihi()),
      location: order.location || '',
      note: order.note || '',
      quantities: qmap
    }
  }

  async function kaydet(catalogStore) {
    const items = []
    for (const [productId, qty] of Object.entries(draft.value.quantities)) {
      if (!qty) continue
      const urun = catalogStore.products.find(p => p.id === productId)
      if (!urun) continue
      const kategori = catalogStore.kategoriById(urun.categoryId)
      items.push({
        productId,
        productName: urun.name,
        categoryName: kategori?.name || '',
        categoryId: urun.categoryId,
        quantity: Number(qty),
        unit: urun.unit
      })
    }
    const payload = {
      date: draft.value.date,
      dayName: draft.value.dayName,
      location: draft.value.location.trim(),
      note: draft.value.note.trim(),
      items,
      totalCount: items.length
    }
    return await svc.siparisKaydet(payload)
  }

  return {
    orders, draft, ready, dolulemSayisi,
    adetAyarla, tarihAyarla, sifirla, sablonOlarakYukle, kaydet,
    siparisSil: svc.siparisSil,
    bind, unbind
  }
})
