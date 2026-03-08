import type { AuthUser, UserRole } from '~/types'

const user = ref<AuthUser | null>(null)
const role = ref<UserRole['role']>('user')
const isAuthenticated = computed(() => !!user.value)
const isAdmin = computed(() => role.value === 'admin')
const loading = ref(false)
const sessionRestored = ref(false)

export function useAuth() {
  const insforge = useInsforge()

  async function fetchRole(userId: string) {
    const { data } = await insforge.database
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()

    role.value = data?.role ?? 'user'
  }

  async function signUp(email: string, password: string, name: string) {
    loading.value = true
    try {
      const { data, error } = await insforge.auth.signUp({ email, password, name })
      if (error) return { error }

      return { data, requireEmailVerification: data?.requireEmailVerification }
    }
    finally {
      loading.value = false
    }
  }

  async function signIn(email: string, password: string) {
    loading.value = true
    try {
      const { data, error } = await insforge.auth.signInWithPassword({ email, password })
      if (error) return { error }

      if (data?.user) {
        user.value = {
          id: data.user.id,
          email: data.user.email,
          emailVerified: data.user.emailVerified,
          profile: {
            name: data.user.profile?.name ?? null,
            avatar_url: data.user.profile?.avatar_url ?? null,
          },
        }
        await fetchRole(data.user.id)
      }

      return { data }
    }
    finally {
      loading.value = false
    }
  }

  async function signOut() {
    const { error } = await insforge.auth.signOut()
    if (!error) {
      user.value = null
      role.value = 'user'
      navigateTo('/login')
    }
    return { error }
  }

  async function verifyEmail(email: string, otp: string) {
    loading.value = true
    try {
      const { data, error } = await insforge.auth.verifyEmail({ email, otp })
      if (error) return { error }

      if (data?.user) {
        user.value = {
          id: data.user.id,
          email: data.user.email,
          emailVerified: true,
          profile: {
            name: data.user.profile?.name ?? null,
            avatar_url: data.user.profile?.avatar_url ?? null,
          },
        }
        await fetchRole(data.user.id)
      }

      return { data }
    }
    finally {
      loading.value = false
    }
  }

  async function restoreSession() {
    loading.value = true
    try {
      const { data, error } = await insforge.auth.getCurrentSession()
      if (error || !data?.session) {
        user.value = null
        role.value = 'user'
        return
      }

      const sessionUser = data.session.user
      user.value = {
        id: sessionUser.id,
        email: sessionUser.email,
        emailVerified: sessionUser.emailVerified,
        profile: {
          name: sessionUser.profile?.name ?? null,
          avatar_url: sessionUser.profile?.avatar_url ?? null,
        },
      }
      await fetchRole(sessionUser.id)
    }
    finally {
      loading.value = false
      sessionRestored.value = true
    }
  }

  return {
    user: readonly(user),
    role: readonly(role),
    isAuthenticated,
    isAdmin,
    loading: readonly(loading),
    sessionRestored: readonly(sessionRestored),
    signUp,
    signIn,
    signOut,
    verifyEmail,
    restoreSession,
  }
}
