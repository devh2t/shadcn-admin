import { supabase } from '@/lib/supabase'

export type OrgRole = 'owner' | 'admin' | 'member'

export type Organization = {
  id: string
  name: string
  slug: string
  created_at: string
}

export type MyOrg = {
  organization: Organization
  role: OrgRole
}

export async function getMyOrganizations(): Promise<MyOrg[]> {
  const { data, error } = await supabase
    .from('organization_memberships')
    .select(
      `
      role,
      organizations:organizations (
        id,
        name,
        slug,
        created_at
      )
    `
    )
    .is('deactivated_at', null)

  if (error) throw error

  // Normalize shape
  return (data ?? [])
    .filter((row) => row.organizations)
    .map((row: any) => ({
      role: row.role as OrgRole,
      organization: row.organizations as Organization,
    }))
}



export async function createOrganization(name: string): Promise<Organization> {
  // expects your SQL RPC: create_organization(org_name text) or create_organization(p_name text)
  const { data, error } = await supabase.rpc('create_organization', {
    p_name: name,
  })

  if (error) throw error
  return data as Organization
}