import {
  collection, doc, addDoc, deleteDoc, serverTimestamp,
  query, orderBy, limit, getDocs
} from 'firebase/firestore'
import { db } from './firebase'

const ORDERS_REF = () => collection(db, 'orders')

export async function siparisKaydet(payload) {
  const ref = await addDoc(ORDERS_REF(), {
    ...payload,
    createdAt: serverTimestamp()
  })
  return ref.id
}

export async function siparisSil(id) {
  await deleteDoc(doc(db, 'orders', id))
}

export async function sonSiparisler(maxN = 50) {
  const q = query(ORDERS_REF(), orderBy('createdAt', 'desc'), limit(maxN))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
