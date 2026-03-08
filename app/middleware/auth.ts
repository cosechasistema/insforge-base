export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated, sessionRestored, restoreSession } = useAuth()

  if (!sessionRestored.value) {
    await restoreSession()
  }

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
