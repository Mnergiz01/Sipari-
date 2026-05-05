<script setup>
import { computed } from 'vue'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
const cycle = ['system', 'light', 'dark']
const next = computed(() => cycle[(cycle.indexOf(ui.themePref) + 1) % cycle.length])
const icon = computed(() => ({
  system: 'pi-desktop',
  light: 'pi-sun',
  dark: 'pi-moon'
}[ui.themePref]))
const label = computed(() => ({
  system: 'Sistem',
  light: 'Aydınlık',
  dark: 'Karanlık'
}[ui.themePref]))
</script>

<template>
  <button
    @click="ui.setTheme(next)"
    class="btn-icon btn btn-ghost"
    :title="`Tema: ${label}`"
    aria-label="Tema değiştir"
  >
    <i :class="['pi', icon]"></i>
  </button>
</template>
