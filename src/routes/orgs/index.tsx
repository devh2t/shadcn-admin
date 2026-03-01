import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'
import { useOrgStore } from '@/stores/org-store'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/orgs/')({
  beforeLoad: async () => {
    const { auth } = useAuthStore.getState()
    if (!auth.user || !auth.accessToken) throw redirect({ to: '/sign-in' })

    const orgStore = useOrgStore.getState()
    await orgStore.loadMyOrgs()

    // If no orgs -> go create one
    if (orgStore.myOrgs.length === 0) {
      throw redirect({ to: '/orgs/new' })
    }
  },
  component: OrgPickerPage,
})

function OrgPickerPage() {
  const navigate = useNavigate()
  const { myOrgs, loading, setActiveBySlug } = useOrgStore()

  if (loading) {
    return <div className="p-6">Loading organizations…</div>
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Select an organization</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {myOrgs.map((row) => (
            <Button
              key={row.organization.id}
              variant="outline"
              className="justify-between"
              onClick={() => {
                setActiveBySlug(row.organization.slug)
                navigate({ to: `/${row.organization.slug}`, replace: true })
              }}
            >
              <span>{row.organization.name}</span>
              <span className="text-muted-foreground text-sm">{row.role}</span>
            </Button>
          ))}

          <div className="pt-2">
            <Button onClick={() => navigate({ to: '/orgs/new' })}>
              Create a new organization
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}