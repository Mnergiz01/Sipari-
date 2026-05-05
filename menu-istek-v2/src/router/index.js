import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/giris', name: 'giris', component: () => import('@/views/GirisView.vue'), meta: { public: true } },
  { path: '/', name: 'siparis', component: () => import('@/views/SiparisView.vue') },
  { path: '/gecmis', name: 'gecmis', component: () => import('@/views/GecmisView.vue') },
  { path: '/urunler', name: 'urunler', component: () => import('@/views/UrunYonetimView.vue') },
  { path: '/ayarlar', name: 'ayarlar', component: () => import('@/views/AyarlarView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.ready) await auth.init()
  if (to.meta.public) {
    if (auth.isAuthorized) return { name: 'siparis' }
    return true
  }
  if (!auth.isAuthorized) return { name: 'giris' }
  return true
})
