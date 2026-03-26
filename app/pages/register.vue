<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const { signUp, loading } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const errorMsg = ref('')

async function handleRegister() {
  errorMsg.value = ''

  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    errorMsg.value = 'Por favor, completá todos los campos'
    return
  }

  if (password.value.length < 6) {
    errorMsg.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Las contraseñas no coinciden'
    return
  }

  const { error, requireEmailVerification } = await signUp(
    email.value,
    password.value,
    name.value,
  )

  if (error) {
    errorMsg.value = 'Error en el registro. Es posible que el email ya esté en uso.'
    return
  }

  if (requireEmailVerification) {
    navigateTo({ path: '/verify-email', query: { email: email.value } })
  }
  else {
    navigateTo('/')
  }
}
</script>

<template>
  <div class="auth-page">
    <v-card
      class="auth-card pa-8"
      width="100%"
      max-width="420"
      elevation="5"
    >
      <div class="text-center mb-6">
        <v-icon icon="mdi-account-plus" size="48" color="primary" class="mb-3" />
        <h1 class="text-headline-medium font-weight-bold">
          Crear Cuenta
        </h1>
        <p class="text-body-medium text-medium-emphasis mt-1">
          Unite a InsForge hoy
        </p>
      </div>

      <v-alert
        v-if="errorMsg"
        type="error"
        variant="tonal"
        closable
        class="mb-4"
        @click:close="errorMsg = ''"
      >
        {{ errorMsg }}
      </v-alert>

      <v-form @submit.prevent="handleRegister">
        <v-text-field
          v-model="name"
          label="Nombre completo"
          prepend-inner-icon="mdi-account-outline"
          :disabled="loading"
          class="mb-1"
        />

        <v-text-field
          v-model="email"
          label="Correo electrónico"
          type="email"
          prepend-inner-icon="mdi-email-outline"
          :disabled="loading"
          class="mb-1"
        />

        <v-text-field
          v-model="password"
          label="Contraseña"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          :disabled="loading"
          class="mb-1"
          @click:append-inner="showPassword = !showPassword"
        />

        <v-text-field
          v-model="confirmPassword"
          label="Confirmar Contraseña"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-check-outline"
          :disabled="loading"
          class="mb-2"
        />

        <v-btn
          type="submit"
          color="primary"
          block
          size="large"
          :loading="loading"
          class="text-none font-weight-bold mb-4"
        >
          Registrarse
        </v-btn>
      </v-form>

      <div class="text-center">
        <span class="text-body-medium text-medium-emphasis">¿Ya tenés cuenta?</span>
        <NuxtLink to="/login" class="text-decoration-none text-secondary font-weight-medium ml-1">
          Iniciá sesión
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
