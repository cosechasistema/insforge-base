<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const { signIn, loading } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''

  if (!email.value || !password.value) {
    errorMsg.value = 'Por favor, completá todos los campos'
    return
  }

  const { error } = await signIn(email.value, password.value)

  if (error) {
    errorMsg.value = 'Credenciales inválidas. Revisá tu email y contraseña.'
    return
  }

  navigateTo('/')
}
</script>

<template>
  <div class="auth-page">
    <v-card
      class="auth-card pa-8"
      width="100%"
      max-width="420"
      elevation="12"
      data-testid="login-card"
    >
      <div class="text-center mb-6">
        <v-icon icon="mdi-shield-lock" size="48" color="primary" class="mb-3" />
        <h1 class="text-h5 font-weight-bold">
          Iniciar Sesión
        </h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Bienvenido de nuevo a InsForge
        </p>
      </div>

      <v-alert
        v-if="errorMsg"
        type="error"
        variant="tonal"
        closable
        class="mb-4"
        data-testid="login-error"
        @click:close="errorMsg = ''"
      >
        {{ errorMsg }}
      </v-alert>

      <v-form @submit.prevent="handleLogin">
        <v-text-field
          v-model="email"
          label="Correo electrónico"
          type="email"
          prepend-inner-icon="mdi-email-outline"
          :disabled="loading"
          class="mb-1"
          autocomplete="email"
          data-testid="login-email"
        />

        <v-text-field
          v-model="password"
          label="Contraseña"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          :disabled="loading"
          class="mb-2"
          autocomplete="current-password"
          data-testid="login-password"
          @click:append-inner="showPassword = !showPassword"
        />

        <v-btn
          type="submit"
          color="primary"
          block
          size="large"
          :loading="loading"
          class="text-none font-weight-bold mb-4"
          data-testid="login-submit"
        >
          Iniciar Sesión
        </v-btn>
      </v-form>

      <div class="text-center">
        <span class="text-body-2 text-medium-emphasis">¿No tenés cuenta?</span>
        <NuxtLink to="/register" class="text-decoration-none text-secondary font-weight-medium ml-1">
          Registrate
        </NuxtLink>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #1565C0 0%, #0D47A1 50%, #26A69A 100%);
}

.auth-card {
  border-radius: 16px !important;
}
</style>
