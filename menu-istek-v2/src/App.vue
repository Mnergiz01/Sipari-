<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useCatalogStore } from '@/stores/catalog'
import { useOrdersStore } from '@/stores/orders'
import AppShell from '@/components/layout/AppShell.vue'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

const route = useRoute()
const auth = useAuthStore()
const ui = useUiStore()
const catalog = useCatalogStore()
const orders = useOrdersStore()

const isPublic = computed(() => route.meta.public)

watch(() => auth.isAuthorized, (val) => {
  if (val) {
    catalog.bind()
    orders.bind()
  } else {
    catalog.unbind()
    orders.unbind()
  }
})
</script>

<template>
  <Toast position="top-center" />
  <ConfirmDialog />
  <div v-if="!ui.isOnline" class="bg-warning/15 text-warning text-xs text-center py-1.5 px-3">
    🔌 Çevrimdışısın — kayıtlar internet gelince senkron olur.
  </div>
  <AppShell v-if="!isPublic && auth.isAuthorized">
    <RouterView />
  </AppShell>
  <RouterView v-else />
</template>
