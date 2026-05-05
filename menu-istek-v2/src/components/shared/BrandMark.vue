<script setup>
defineProps({
  size: { type: Number, default: 32 }
})
</script>

<template>
  <div
    class="brand-mark"
    :style="{ width: size + 'px', height: size + 'px', borderRadius: (size * 0.25) + 'px' }"
    aria-hidden="true"
  >
    <span class="brand-letter" :style="{ fontSize: (size * 0.55) + 'px' }">M</span>
  </div>
</template>

<style scoped>
.brand-mark {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--grad-brand);
  color: #ffffff;
  flex: none;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.2),
              inset 0 -2px 8px rgba(0,0,0,0.12),
              0 1px 2px rgba(0,0,0,0.08);
}
.brand-mark::after {
  content: '';
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 60%);
  pointer-events: none;
}
.brand-letter {
  font-family: 'Inter Display', 'Inter', sans-serif;
  font-weight: 700;
  letter-spacing: -0.04em;
  position: relative;
  z-index: 1;
  line-height: 1;
}
</style>
