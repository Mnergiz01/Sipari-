import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

import App from './App.vue'
import { router } from './router'
import { useAuthStore } from './stores/auth'
import { useUiStore } from './stores/ui'
import { useCatalogStore } from './stores/catalog'
import { useOrdersStore } from './stores/orders'

import 'primeicons/primeicons.css'
import './styles/tailwind.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '[data-theme="dark"]',
      cssLayer: { name: 'primevue', order: 'tailwind-base, primevue, tailwind-utilities' }
    }
  }
})
app.use(ToastService)
app.use(ConfirmationService)
app.use(router)

// Tema initialize
const ui = useUiStore()
ui.applyTheme()

// Auth initialize sonra catalog/orders bind
const auth = useAuthStore()
auth.init().then(() => {
  if (auth.isAuthorized) {
    useCatalogStore().bind()
    useOrdersStore().bind()
  }
})

app.mount('#app')
