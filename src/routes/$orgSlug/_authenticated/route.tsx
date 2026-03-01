import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'
import { useOrgStore } from '@/stores/org-store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/$orgSlug/_authenticated')({
  beforeLoad: async ({ params, location }) => {
    const { auth } = useAuthStore.getState()

    // 1) Require login
    if (!auth.user || !auth.accessToken) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }

    const orgStore = useOrgStore.getState()

    // 2) Ensure organizations are loaded
    if (orgStore.myOrgs.length === 0 && !orgStore.loading) {
      await orgStore.loadMyOrgs()
    }

    const slug = params.orgSlug
    const found = orgStore.myOrgs.find((x) => x.organization.slug === slug)

    // 3) If not a member of this org, redirect to first available org
    if (!found) {
      const firstSlug = orgStore.myOrgs[0]?.organization.slug
      if (!firstSlug) {
        throw redirect({
          to: '/sign-in',
          search: { redirect: location.href },
        })
      }
      throw redirect({ to: '/orgs' })
    }

    // 4) Set active org (used by pages + sidebar)
    orgStore.setActiveBySlug(slug)
  },
  component: AuthenticatedLayout,
})