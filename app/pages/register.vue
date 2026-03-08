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
    errorMsg.value = 'Please fill in all fields'
    return
  }

  if (password.value.length < 6) {
    errorMsg.value = 'Password must be at least 6 characters'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Passwords do not match'
    return
  }

  const { error, requireEmailVerification } = await signUp(
    email.value,
    password.value,
    name.value,
  )

  if (error) {
    errorMsg.value = 'Registration failed. The email may already be in use.'
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
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6" elevation="4">
          <v-card-title class="text-h5 text-center mb-4">
            Create Account
          </v-card-title>

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
              label="Full Name"
              prepend-inner-icon="mdi-account"
              :disabled="loading"
              class="mb-2"
            />

            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email"
              :disabled="loading"
              class="mb-2"
            />

            <v-text-field
              v-model="password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              :disabled="loading"
              class="mb-2"
              @click:append-inner="showPassword = !showPassword"
            />

            <v-text-field
              v-model="confirmPassword"
              label="Confirm Password"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-check"
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
              Sign Up
            </v-btn>
          </v-form>

          <v-divider class="my-4" />

          <div class="text-center">
            <span class="text-body-2">Already have an account?</span>
            <NuxtLink to="/login" class="text-decoration-none ml-1">
              Sign In
            </NuxtLink>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
