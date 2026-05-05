<script setup>
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useSettingsStore } from '@/stores/settings'
import { useCatalogStore } from '@/stores/catalog'
import { useOrdersStore } from '@/stores/orders'
import { useToast } from 'primevue/usetoast'

const auth = useAuthStore()
const ui = useUiStore()
const settings = useSettingsStore()
const catalog = useCatalogStore()
const orders = useOrdersStore()
const toast = useToast()

function exportData() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories: catalog.categories,
    products: catalog.products,
    orders: orders.orders,
    settings: {
      whatsappContact: settings.whatsappContact,
      lastUsedLocation: settings.lastUsedLocation
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `menu-istek-yedek-${new Date().toISOString().slice(0,10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  toast.add({ severity: 'success', summary: 'Yedek indirildi', life: 2500 })
}

function importData(ev) {
  const file = ev.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      console.log('Import edilen veri:', data)
      toast.add({
        severity: 'info',
        summary: 'Henüz uygulanmadı',
        detail: 'Import sadece dosya okudu. Firestore\'a yazma v0.2\'de eklenecek.',
        life: 5000
      })
    } catch {
      toast.add({ severity: 'error', summary: 'Geçersiz dosya', life: 3000 })
    }
  }
  reader.readAsText(file)
}
</script>

<template>
  <!-- Tema -->
  <section class="surface p-5 mb-4">
    <h3 class="editorial-caption mb-3">Tema</h3>
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="opt in ['system', 'light', 'dark']" :key="opt"
        class="btn"
        :class="ui.themePref === opt ? 'btn-primary' : 'btn-ghost'"
        @click="ui.setTheme(opt)"
      >
        <i :class="['pi', opt === 'system' ? 'pi-desktop' : opt === 'light' ? 'pi-sun' : 'pi-moon']"></i>
        {{ { system: 'Sistem', light: 'Aydınlık', dark: 'Karanlık' }[opt] }}
      </button>
    </div>
  </section>

  <!-- Hesap -->
  <section class="surface p-5 mb-4">
    <h3 class="editorial-caption mb-3">Hesap</h3>
    <div class="flex items-center gap-3 mb-4">
      <img v-if="auth.user?.photoURL" :src="auth.user.photoURL" alt="" class="w-10 h-10 rounded-full ring-2 ring-border" />
      <div v-else class="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
        <i class="pi pi-user"></i>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">
          {{ auth.user?.displayName || (auth.pinAuthorized ? 'PIN ile bağlı' : 'Kullanıcı') }}
        </p>
        <p class="text-xs text-text-muted truncate">{{ auth.user?.email || (auth.pinAuthorized ? 'Anonim oturum' : '') }}</p>
      </div>
    </div>
    <button class="btn btn-ghost" @click="auth.cikisYap">
      <i class="pi pi-sign-out"></i> Çıkış Yap
    </button>
  </section>

  <!-- WhatsApp -->
  <section class="surface p-5 mb-4">
    <h3 class="editorial-caption mb-3">Varsayılan WhatsApp</h3>
    <input
      v-model="settings.whatsappContact"
      type="tel"
      placeholder="905551112233"
      inputmode="numeric"
      class="input"
    />
    <p class="text-2xs text-text-muted mt-2">
      Ülke kodu dahil, sadece rakam. Boş bırakırsan paylaşım menüsünde her seferinde kontak seçeceksin.
    </p>
  </section>

  <!-- Veri yedekleme -->
  <section class="surface p-5 mb-4">
    <h3 class="editorial-caption mb-3">Veri Yedekleme</h3>
    <div class="flex flex-wrap gap-2">
      <button class="btn btn-ghost" @click="exportData">
        <i class="pi pi-download"></i> JSON Export
      </button>
      <label class="btn btn-ghost cursor-pointer">
        <i class="pi pi-upload"></i> JSON Import
        <input type="file" accept="application/json" @change="importData" class="hidden" />
      </label>
    </div>
    <p class="text-2xs text-text-muted mt-2">
      Veriler Firebase'de zaten yedekli; bu sadece ekstra güvence için.
    </p>
  </section>

  <p class="text-2xs text-text-subtle text-center mt-8 tabular">menu-istek · v0.1.0</p>
</template>
