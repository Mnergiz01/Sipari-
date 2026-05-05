<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BrandMark from '@/components/shared/BrandMark.vue'

const router = useRouter()
const auth = useAuthStore()
const pin = ref('')
const yukleniyor = ref(false)

async function googleIle() {
  yukleniyor.value = true
  try {
    await auth.girisYap()
    if (auth.isAuthorized) router.push('/')
  } finally {
    yukleniyor.value = false
  }
}

async function pinIle() {
  if (pin.value.length < 4) return
  yukleniyor.value = true
  try {
    const ok = await auth.pinIleGir(pin.value)
    if (ok) {
      pin.value = ''
      router.push('/')
    }
  } finally {
    yukleniyor.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
    <!-- Decorative gradient blob -->
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute -top-32 -right-20 w-80 h-80 rounded-full opacity-30 blur-3xl"
           style="background: var(--grad-brand)"></div>
      <div class="absolute -bottom-32 -left-20 w-80 h-80 rounded-full opacity-20 blur-3xl"
           style="background: var(--grad-brand)"></div>
    </div>

    <div class="surface-elevated w-full max-w-sm p-8">
      <div class="flex flex-col items-center text-center mb-8">
        <BrandMark :size="56" class="mb-5" />
        <p class="editorial-caption mb-1.5">Menu İstek</p>
        <h1 class="editorial-display text-2xl mb-2">Hoş geldin</h1>
        <p class="text-sm text-text-muted leading-relaxed max-w-[260px]">
          Türkoğlu Mado günlük sipariş ve paylaşım uygulamasına giriş yap.
        </p>
      </div>

      <button
        class="btn btn-primary w-full justify-center py-2.5 text-sm"
        @click="googleIle"
        :disabled="yukleniyor"
      >
        <i :class="yukleniyor ? 'pi pi-spin pi-spinner' : 'pi pi-google'"></i>
        <span>Google ile Giriş Yap</span>
      </button>

      <div class="flex items-center gap-3 my-6">
        <div class="flex-1 h-px bg-border"></div>
        <span class="editorial-caption">VEYA PIN İLE</span>
        <div class="flex-1 h-px bg-border"></div>
      </div>

      <form @submit.prevent="pinIle">
        <input
          v-model="pin"
          type="password"
          inputmode="numeric"
          autocomplete="off"
          maxlength="6"
          placeholder="••••"
          class="input text-center text-lg font-mono tracking-[0.4em] py-3"
          :disabled="yukleniyor"
        />
        <button
          type="submit"
          class="btn btn-soft w-full justify-center mt-3 py-2.5 text-sm"
          :disabled="yukleniyor || pin.length < 4"
        >
          <i :class="yukleniyor ? 'pi pi-spin pi-spinner' : 'pi pi-key'"></i>
          <span>PIN ile Giriş</span>
        </button>
      </form>

      <p v-if="auth.error" class="text-error text-xs mt-5 text-center font-medium">
        {{ auth.error }}
      </p>
    </div>

    <p class="text-2xs text-text-subtle mt-6">menu-istek · v0.1.0</p>
  </div>
</template>
