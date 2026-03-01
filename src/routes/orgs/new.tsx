import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createOrganization } from '@/lib/organizations-service'
import { useAuthStore } from '@/stores/auth-store'
import { useOrgStore } from '@/stores/org-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Organization name is too short'),
})

export const Route = createFileRoute('/orgs/new')({
  beforeLoad: async () => {
    const { auth } = useAuthStore.getState()
    if (!auth.user || !auth.accessToken) throw redirect({ to: '/sign-in' })
  },
  component: CreateOrgPage,
})

function CreateOrgPage() {
  const navigate = useNavigate()
  const orgStore = useOrgStore()

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  })

  const onSubmit = async (values: z.infer<typeof schema>) => {
    // calls your Supabase RPC create_organization(name)
    const org = await createOrganization(values.name)

    // refresh list so picker + guards stay correct
    await orgStore.refreshMyOrgs()

    orgStore.setActiveBySlug(org.slug)
    navigate({ to: `/${org.slug}`, replace: true })
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create an organization</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Company" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Create</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/orgs' })}
              >
                Back
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}