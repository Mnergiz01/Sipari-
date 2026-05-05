import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const KEY = 'menu-istek-settings'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const initial = load()
  const whatsappContact = ref(initial.whatsappContact || '')
  const lastUsedLocation = ref(initial.lastUsedLocation || 'Türkoğlu Mado')

  watch([whatsappContact, lastUsedLocation], () => {
    localStorage.setItem(KEY, JSON.stringify({
      whatsappContact: whatsappContact.value,
      lastUsedLocation: lastUsedLocation.value
    }))
  })

  return { whatsappContact, lastUsedLocation }
})
