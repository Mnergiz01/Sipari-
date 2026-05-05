<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const items = [
  { to: '/', icon: 'pi pi-pencil', label: 'Sipariş', name: 'siparis' },
  { to: '/gecmis', icon: 'pi pi-history', label: 'Geçmiş', name: 'gecmis' },
  { to: '/urunler', icon: 'pi pi-box', label: 'Ürünler', name: 'urunler' },
  { to: '/ayarlar', icon: 'pi pi-cog', label: 'Ayarlar', name: 'ayarlar' }
]
</script>

<template>
  <nav class="fixed bottom-0 inset-x-0 z-30 backdrop-blur-xl bg-surface/90 border-t border-border">
    <div class="grid grid-cols-4 max-w-3xl mx-auto">
      <RouterLink
        v-for="it in items" :key="it.to" :to="it.to"
        class="relative flex flex-col items-center gap-1 py-2.5 text-2xs font-medium transition-colors"
        :class="route.name === it.name ? 'text-accent' : 'text-text-muted hover:text-text'"
      >
        <span
          v-if="route.name === it.name"
          class="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full"
        ></span>
        <i :class="it.icon" class="text-base"></i>
        <span>{{ it.label }}</span>
      </RouterLink>
    </div>
    <div class="h-[env(safe-area-inset-bottom)]"></div>
  </nav>
</template>
