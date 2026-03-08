import { createClient } from '@insforge/sdk'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const insforge = createClient({
    baseUrl: config.public.insforgeUrl,
    anonKey: config.public.insforgeKey,
  })

  return {
    provide: {
      insforge,
    },
  }
})
