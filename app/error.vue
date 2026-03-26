<script setup lang="ts">
import { APP_CONFIG } from '~/utils/config'

const props = defineProps<{
  error: {
    statusCode: number
    message: string
  }
}>()

useHead({
  title: `${props.error.statusCode} | ${APP_CONFIG.name}`,
})

const is404 = computed(() => props.error.statusCode === 404)

const title = computed(() =>
  is404.value ? 'Pagina no encontrada' : 'Algo salio mal',
)

const subtitle = computed(() =>
  is404.value
    ? 'La pagina que buscas no existe o fue movida a otra ubicacion.'
    : props.error.message || 'Ocurrio un error inesperado. Intenta de nuevo.',
)

const ready = ref(false)
onMounted(() => {
  requestAnimationFrame(() => {
    ready.value = true
  })
})

function handleGoHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <v-app class="error-page">
    <!-- Animated background particles -->
    <div class="bg-particles">
      <div v-for="i in 20" :key="i" class="particle" :style="{ '--i': i }" />
    </div>

    <!-- Gradient orbs -->
    <div class="orb orb-1" />
    <div class="orb orb-2" />

    <v-container class="fill-height d-flex align-center justify-center position-relative" style="z-index: 1;">
      <div class="text-center" :class="{ 'content-visible': ready }">
        <!-- Giant status code with gradient -->
        <div class="status-code-wrapper">
          <div class="status-code">
            <span v-for="(digit, idx) in String(error.statusCode).split('')" :key="idx" class="digit" :style="{ '--delay': `${idx * 0.15}s` }">
              {{ digit }}
            </span>
          </div>
        </div>

        <!-- Animated icon -->
        <div class="icon-container mb-6">
          <div class="icon-ring" />
          <v-icon
            :icon="is404 ? 'mdi-compass-off-outline' : 'mdi-alert-circle-outline'"
            size="56"
            color="white"
          />
        </div>

        <!-- Text content -->
        <h1 class="error-title mb-3">
          {{ title }}
        </h1>

        <p class="error-subtitle mb-8">
          {{ subtitle }}
        </p>

        <!-- Animated button -->
        <v-btn
          color="white"
          size="x-large"
          rounded="pill"
          prepend-icon="mdi-home-outline"
          class="text-none font-weight-bold px-10 home-btn"
          variant="flat"
          @click="handleGoHome"
        >
          <span style="color: #1565C0;">Volver al inicio</span>
        </v-btn>

        <p class="mt-6 text-body-small" style="opacity: 0.4; color: white;">
          {{ APP_CONFIG.name }} &middot; v{{ APP_CONFIG.version }}
        </p>
      </div>
    </v-container>
  </v-app>
</template>

<style scoped>
.error-page {
  background: linear-gradient(135deg, #0d47a1 0%, #1565c0 30%, #1a237e 70%, #0d47a1 100%);
  background-size: 400% 400%;
  animation: gradientShift 12s ease infinite;
  overflow: hidden;
  min-height: 100vh;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Floating particles */
.bg-particles {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  bottom: -10px;
  left: calc(var(--i) * 5%);
  animation: float calc(6s + var(--i) * 0.5s) ease-in-out infinite;
  animation-delay: calc(var(--i) * -0.3s);
}

.particle:nth-child(odd) {
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(720deg);
    opacity: 0;
  }
}

/* Gradient orbs */
.orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: rgba(38, 166, 154, 0.2);
  top: -100px;
  right: -100px;
  animation: orbMove1 8s ease-in-out infinite;
}

.orb-2 {
  width: 350px;
  height: 350px;
  background: rgba(156, 39, 176, 0.15);
  bottom: -80px;
  left: -80px;
  animation: orbMove2 10s ease-in-out infinite;
}

@keyframes orbMove1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-60px, 60px) scale(1.1); }
}

@keyframes orbMove2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(60px, -40px) scale(1.15); }
}

/* Status code */
.status-code-wrapper {
  margin-bottom: 2rem;
  perspective: 800px;
}

.status-code {
  display: inline-flex;
  gap: 0.1em;
}

.digit {
  display: inline-block;
  font-size: clamp(6rem, 18vw, 12rem);
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: digitEntry 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: var(--delay);
}

@keyframes digitEntry {
  0% {
    opacity: 0;
    transform: translateY(-40px) scale(0.5) rotateX(45deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotateX(0deg);
  }
}

/* Icon with pulsing ring */
.icon-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
}

.icon-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  animation: ringPulse 2.5s ease-in-out infinite;
}

@keyframes ringPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* Text */
.error-title {
  font-size: clamp(1.5rem, 4vw, 2.2rem);
  font-weight: 800;
  color: white;
  letter-spacing: -0.02em;
}

.error-subtitle {
  font-size: clamp(0.95rem, 2vw, 1.15rem);
  color: rgba(255, 255, 255, 0.6);
  max-width: 400px;
  margin-inline: auto;
  line-height: 1.6;
}

/* Button */
.home-btn {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.home-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

/* Content entry animation */
.content-visible .status-code-wrapper {
  animation: fadeSlideUp 0.5s ease both;
}

.content-visible .icon-container {
  animation: fadeSlideUp 0.5s ease 0.2s both;
}

.content-visible .error-title {
  animation: fadeSlideUp 0.5s ease 0.35s both;
}

.content-visible .error-subtitle {
  animation: fadeSlideUp 0.5s ease 0.45s both;
}

.content-visible .home-btn {
  animation: fadeSlideUp 0.5s ease 0.55s both;
}

@keyframes fadeSlideUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
