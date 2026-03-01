import { useAuthStore } from '@/stores/auth-store'
import { useOrgStore } from '@/stores/org-store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const { auth } = useAuthStore.getState()
    if (!auth.user || !auth.accessToken) {
      throw redirect({ to: '/sign-in' })
    }

    const orgStore = useOrgStore.getState()
    await orgStore.loadMyOrgs()

    if (orgStore.myOrgs.length === 0) {
      throw redirect({ to: '/orgs/new' })
    }

    // user has orgs -> let them choose
    throw redirect({ to: '/orgs' })
  },
})