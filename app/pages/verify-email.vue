<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const { verifyEmail, loading } = useAuth()

const email = ref((route.query.email as string) ?? '')
const otp = ref('')
const errorMsg = ref('')
const successMsg = ref('')

async function handleVerify() {
  errorMsg.value = ''

  if (!email.value || !otp.value) {
    errorMsg.value = 'Por favor, ingresá tu email y código de verificación'
    return
  }

  if (otp.value.length !== 6) {
    errorMsg.value = 'El código debe tener 6 dígitos'
    return
  }

  const { error } = await verifyEmail(email.value, otp.value)

  if (error) {
    errorMsg.value = 'Código inválido o expirado. Por favor, intentá de nuevo.'
    return
  }

  successMsg.value = '¡Email verificado exitosamente!'
  setTimeout(() => navigateTo('/login'), 1500)
}
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6" elevation="4">
          <v-card-title class="text-h5 text-center mb-2">
            Verificar Email
          </v-card-title>

          <v-card-subtitle class="text-center mb-4">
            Ingresá el código de 6 dígitos que enviamos a tu email
          </v-card-subtitle>

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

          <v-alert
            v-if="successMsg"
            type="success"
            variant="tonal"
            class="mb-4"
          >
            {{ successMsg }}
          </v-alert>

          <v-form @submit.prevent="handleVerify">
            <v-text-field
              v-model="email"
              label="Correo electrónico"
              type="email"
              prepend-inner-icon="mdi-email"
              :disabled="loading || !!route.query.email"
              class="mb-2"
            />

            <v-text-field
              v-model="otp"
              label="Código de verificación"
              placeholder="123456"
              prepend-inner-icon="mdi-shield-key"
              maxlength="6"
              :disabled="loading"
              class="mb-4"
            />

            <v-btn
              type="submit"
              color="secondary"
              block
              size="large"
              :loading="loading"
              class="text-uppercase font-weight-bold"
            >
              Verificar
            </v-btn>
          </v-form>

          <v-divider class="my-4" />

          <div class="text-center">
            <NuxtLink to="/login" class="text-decoration-none">
              Volver a Iniciar Sesión
            </NuxtLink>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
