<script setup>
import { useRoute } from 'vue-router'
import BottomNav from './BottomNav.vue'
import ThemeToggle from './ThemeToggle.vue'
import BrandMark from '@/components/shared/BrandMark.vue'

const route = useRoute()
const TITLES = {
  siparis: 'Yeni Sipariş',
  gecmis: 'Geçmiş Siparişler',
  urunler: 'Ürün Yönetimi',
  ayarlar: 'Ayarlar'
}
const SUBTITLES = {
  siparis: 'Bugünün listesini hazırla',
  gecmis: 'Önceki siparişlerin',
  urunler: 'Kategori ve ürünleri yönet',
  ayarlar: 'Tema ve hesap'
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-30 backdrop-blur-xl bg-bg/85 border-b border-border">
      <div class="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        <BrandMark :size="36" />
        <div class="flex-1 min-w-0">
          <p class="editorial-caption">{{ SUBTITLES[route.name] || 'Menu İstek' }}</p>
          <h1 class="editorial-display text-base leading-tight mt-0.5 truncate">
            {{ TITLES[route.name] || 'Menu İstek' }}
          </h1>
        </div>
        <ThemeToggle />
      </div>
    </header>

    <main class="flex-1 pb-24 md:pb-8">
      <div class="max-w-3xl mx-auto px-4 py-5">
        <slot />
      </div>
    </main>

    <BottomNav class="md:hidden" />
  </div>
</template>
