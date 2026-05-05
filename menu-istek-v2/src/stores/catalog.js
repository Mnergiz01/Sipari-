import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/services/firebase'
import * as svc from '@/services/catalogService'

export const useCatalogStore = defineStore('catalog', () => {
  const categories = ref([])
  const products = ref([])
  const ready = ref(false)
  let unsubKat = null
  let unsubUrun = null

  function bind() {
    if (!db) return
    unbind()
    const katQ = query(collection(db, 'categories'), orderBy('order', 'asc'))
    unsubKat = onSnapshot(katQ, snap => {
      categories.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      ready.value = true
    })
    const urunQ = query(collection(db, 'products'), orderBy('order', 'asc'))
    unsubUrun = onSnapshot(urunQ, snap => {
      products.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
  }

  function unbind() {
    if (unsubKat) { unsubKat(); unsubKat = null }
    if (unsubUrun) { unsubUrun(); unsubUrun = null }
    categories.value = []
    products.value = []
    ready.value = false
  }

  const aktifUrunler = computed(() => products.value.filter(p => !p.archived))
  const arsivUrunler = computed(() => products.value.filter(p => p.archived))

  function urunlerByKategori(categoryId, includeArchived = false) {
    return products.value
      .filter(p => p.categoryId === categoryId && (includeArchived || !p.archived))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }

  function kategoriById(id) {
    return categories.value.find(c => c.id === id)
  }

  return {
    categories, products, ready,
    aktifUrunler, arsivUrunler,
    urunlerByKategori, kategoriById,
    bind, unbind,
    // CRUD direkt servis çağrıları
    kategoriEkle: svc.kategoriEkle,
    kategoriGuncelle: svc.kategoriGuncelle,
    kategoriSil: svc.kategoriSil,
    urunEkle: svc.urunEkle,
    urunGuncelle: svc.urunGuncelle,
    urunArsivle: svc.urunArsivle,
    fabrikaAyarlarinaDon: svc.fabrikaAyarlarinaDon
  }
})
