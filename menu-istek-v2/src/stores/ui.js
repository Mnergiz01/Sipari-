import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'

const TEMA_KEY = 'menu-istek-theme'

export const useUiStore = defineStore('ui', () => {
  const themePref = ref(localStorage.getItem(TEMA_KEY) || 'system')
  const isOnline = ref(navigator.onLine)

  function applyTheme() {
    const sysPrefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    const isDark = themePref.value === 'dark' || (themePref.value === 'system' && sysPrefersDark)
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  }

  function setTheme(value) {
    themePref.value = value
    localStorage.setItem(TEMA_KEY, value)
    applyTheme()
  }

  watchEffect(() => applyTheme())
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme)
  }
  window.addEventListener('online', () => isOnline.value = true)
  window.addEventListener('offline', () => isOnline.value = false)

  return { themePref, isOnline, setTheme, applyTheme }
})
