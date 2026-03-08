<script setup lang="ts">
import { APP_CONFIG } from '~/utils/config'

definePageMeta({
  middleware: ['auth'],
})

const { user } = useAuth()
const insforge = useInsforge()

const usersCount = ref(0)
const itemsCount = ref(0)
const apiStatus = ref('...')

async function fetchStats() {
  const [usersRes, itemsRes] = await Promise.all([
    insforge.database.from('user_roles').select('*', { count: 'exact', head: true }),
    insforge.database.from('items').select('*', { count: 'exact', head: true }),
  ])

  usersCount.value = usersRes.count ?? 0
  itemsCount.value = itemsRes.count ?? 0
  apiStatus.value = (usersRes.error || itemsRes.error) ? 'Error' : 'OK'
}

onMounted(fetchStats)
</script>

<template>
  <div data-testid="dashboard-page">
    <div class="d-flex align-center ga-3 mb-6">
      <v-icon :icon="APP_CONFIG.icon" size="40" color="primary" />
      <h1 class="text-h4">
        Dashboard
      </h1>
    </div>

    <v-card class="pa-6 mb-6" data-testid="dashboard-welcome">
      <v-card-title class="text-h5">
        Welcome, {{ user?.profile.name ?? user?.email }}
      </v-card-title>
      <v-card-subtitle>
        {{ APP_CONFIG.description }}
      </v-card-subtitle>
    </v-card>

    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 text-center" rounded="lg" data-testid="stat-users">
          <v-icon icon="mdi-account-group" size="36" color="primary" class="mb-2" />
          <div class="text-h4 font-weight-bold">
            {{ usersCount }}
          </div>
          <div class="text-body-2 text-grey">
            Users
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 text-center" rounded="lg" data-testid="stat-records">
          <v-icon icon="mdi-database" size="36" color="info" class="mb-2" />
          <div class="text-h4 font-weight-bold">
            {{ itemsCount }}
          </div>
          <div class="text-body-2 text-grey">
            Records
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 text-center" rounded="lg" data-testid="stat-api">
          <v-icon icon="mdi-cloud-check" size="36" color="success" class="mb-2" />
          <div class="text-h4 font-weight-bold">
            {{ apiStatus }}
          </div>
          <div class="text-body-2 text-grey">
            API Status
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 text-center" rounded="lg" data-testid="stat-version">
          <v-icon icon="mdi-information" size="36" color="warning" class="mb-2" />
          <div class="text-h4 font-weight-bold">
            {{ APP_CONFIG.version }}
          </div>
          <div class="text-body-2 text-grey">
            Version
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
