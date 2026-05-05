import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  onAuthStateChanged, signInWithPopup, signInAnonymously, signOut as fbSignOut
} from 'firebase/auth'
import { auth, googleProvider, OWNER_UID, isConfigured } from '@/services/firebase'

const APP_PIN = '7980'
const PIN_FLAG_KEY = 'menu-istek-pin-ok'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const ready = ref(false)
  const error = ref(null)
  const pinAuthorized = ref(localStorage.getItem(PIN_FLAG_KEY) === '1')

  const isAuthorized = computed(() => {
    if (!user.value) return false
    if (pinAuthorized.value && user.value.isAnonymous) return true
    if (!OWNER_UID) return true // dev mode
    return user.value.uid === OWNER_UID
  })

  function init() {
    if (!isConfigured) {
      ready.value = true
      error.value = 'Firebase yapılandırılmamış. .env.local dosyasını doldur.'
      return Promise.resolve(null)
    }
    return new Promise(resolve => {
      onAuthStateChanged(auth, (u) => {
        user.value = u
        ready.value = true
        resolve(u)
      })
    })
  }

  async function girisYap() {
    if (!isConfigured) {
      error.value = 'Firebase yapılandırılmamış.'
      return
    }
    error.value = null
    try {
      const result = await signInWithPopup(auth, googleProvider)
      if (OWNER_UID && result.user.uid !== OWNER_UID) {
        await fbSignOut(auth)
        error.value = 'Bu hesap yetkili değil.'
        console.info('[auth] Yetkisiz UID:', result.user.uid)
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        error.value = err.message || 'Giriş başarısız'
      }
    }
  }

  async function pinIleGir(pin) {
    error.value = null
    if (String(pin).trim() !== APP_PIN) {
      error.value = 'PIN hatalı'
      return false
    }
    if (!isConfigured) {
      error.value = 'Firebase yapılandırılmamış.'
      return false
    }
    try {
      await signInAnonymously(auth)
      localStorage.setItem(PIN_FLAG_KEY, '1')
      pinAuthorized.value = true
      return true
    } catch (err) {
      error.value = err.message || 'PIN ile giriş başarısız'
      return false
    }
  }

  async function cikisYap() {
    localStorage.removeItem(PIN_FLAG_KEY)
    pinAuthorized.value = false
    if (auth) await fbSignOut(auth)
  }

  return { user, ready, error, isAuthorized, pinAuthorized, init, girisYap, pinIleGir, cikisYap }
})
