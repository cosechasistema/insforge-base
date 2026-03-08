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
    errorMsg.value = 'Please fill in all fields'
    return
  }

  const { error } = await signIn(email.value, password.value)

  if (error) {
    errorMsg.value = 'Invalid credentials. Please check your email and password.'
    return
  }

  navigateTo('/')
}
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6" elevation="4" data-testid="login-card">
          <v-card-title class="text-h5 text-center mb-4">
            Sign In
          </v-card-title>

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
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email"
              :disabled="loading"
              class="mb-2"
              autocomplete="email"
              data-testid="login-email"
            />

            <v-text-field
              v-model="password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              :disabled="loading"
              class="mb-4"
              autocomplete="current-password"
              data-testid="login-password"
              @click:append-inner="showPassword = !showPassword"
            />

            <v-btn
              type="submit"
              color="secondary"
              block
              size="large"
              :loading="loading"
              class="text-uppercase font-weight-bold"
              data-testid="login-submit"
            >
              Sign In
            </v-btn>
          </v-form>

          <v-divider class="my-4" />

          <div class="text-center">
            <span class="text-body-2">Don't have an account?</span>
            <NuxtLink to="/register" class="text-decoration-none ml-1">
              Sign Up
            </NuxtLink>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
