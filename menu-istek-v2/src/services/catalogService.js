import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  serverTimestamp, writeBatch, getDocs
} from 'firebase/firestore'
import { db } from './firebase'
import { SEED_KATEGORILER, SEED_URUNLER } from '@/data/seed'

const KATEGORI_REF = () => collection(db, 'categories')
const URUN_REF = () => collection(db, 'products')

export async function kategoriEkle(payload) {
  return await addDoc(KATEGORI_REF(), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

export async function kategoriGuncelle(id, payload) {
  await updateDoc(doc(db, 'categories', id), {
    ...payload,
    updatedAt: serverTimestamp()
  })
}

export async function kategoriSil(id) {
  await deleteDoc(doc(db, 'categories', id))
}

export async function urunEkle(payload) {
  return await addDoc(URUN_REF(), {
    ...payload,
    archived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

export async function urunGuncelle(id, payload) {
  await updateDoc(doc(db, 'products', id), {
    ...payload,
    updatedAt: serverTimestamp()
  })
}

export async function urunArsivle(id, archived = true) {
  await updateDoc(doc(db, 'products', id), {
    archived,
    updatedAt: serverTimestamp()
  })
}

export async function fabrikaAyarlarinaDon() {
  const [katSnap, urunSnap] = await Promise.all([
    getDocs(KATEGORI_REF()),
    getDocs(URUN_REF())
  ])
  const mevcutKategoriIds = new Set(
    katSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .map(k => k.id)
  )
  const mevcutKategoriExternalIds = new Map(
    katSnap.docs.map(d => [d.data().externalId, d.id])
  )
  const mevcutUrunlerByName = new Map(
    urunSnap.docs.map(d => [`${d.data().name}::${d.data().categoryId}`, d.id])
  )

  const batch = writeBatch(db)

  // Kategorileri ekle (varsa atla)
  const yeniKatIdMap = new Map()
  for (const kat of SEED_KATEGORILER) {
    const existing = mevcutKategoriExternalIds.get(kat.id)
    if (existing) {
      yeniKatIdMap.set(kat.id, existing)
      continue
    }
    const newRef = doc(KATEGORI_REF())
    batch.set(newRef, {
      name: kat.name,
      order: kat.order,
      icon: kat.icon || '',
      externalId: kat.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    yeniKatIdMap.set(kat.id, newRef.id)
  }

  // Ürünleri ekle (aynı isim+kategori varsa atla)
  for (const urun of SEED_URUNLER) {
    const realCategoryId = yeniKatIdMap.get(urun.categoryId)
    if (!realCategoryId) continue
    const key = `${urun.name}::${realCategoryId}`
    if (mevcutUrunlerByName.has(key)) continue
    const newRef = doc(URUN_REF())
    batch.set(newRef, {
      name: urun.name,
      categoryId: realCategoryId,
      unit: urun.unit,
      order: urun.order,
      archived: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  }

  await batch.commit()
}
