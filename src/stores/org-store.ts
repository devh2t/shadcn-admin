import { getMyOrganizations, type MyOrg, type OrgRole, type Organization } from '@/lib/organizations-service'
import { create } from 'zustand'

type OrgState = {
  loading: boolean
  myOrgs: MyOrg[]
  activeOrg: Organization | null
  activeRole: OrgRole | null

  loadMyOrgs: () => Promise<void>
  refreshMyOrgs: () => Promise<void>
  setActiveBySlug: (slug: string) => void
  setActiveFirst: () => void
}

const LAST_ORG_KEY = 'lastOrgSlug'

export const useOrgStore = create<OrgState>((set, get) => ({
  loading: false,
  myOrgs: [],
  activeOrg: null,
  activeRole: null,

  loadMyOrgs: async () => {
    const { loading, myOrgs } = get()
    if (loading) return
    if (myOrgs.length > 0) return

    set({ loading: true })
    try {
      const myOrgs = await getMyOrganizations()
      set({ myOrgs, loading: false })
    } catch (e) {
      set({ loading: false })
      throw e
    }
  },

  refreshMyOrgs: async () => {
    const { loading } = get()
    if (loading) return

    set({ loading: true })
    try {
      const myOrgs = await getMyOrganizations()
      set({ myOrgs, loading: false })
    } catch (e) {
      set({ loading: false })
      throw e
    }
  },

  setActiveBySlug: (slug) => {
    const row = get().myOrgs.find((x) => x.organization.slug === slug)
    if (!row) return
    localStorage.setItem(LAST_ORG_KEY, slug)
    set({ activeOrg: row.organization, activeRole: row.role })
  },

  setActiveFirst: () => {
    const first = get().myOrgs[0]
    if (!first) return
    localStorage.setItem(LAST_ORG_KEY, first.organization.slug)
    set({ activeOrg: first.organization, activeRole: first.role })
  },
}))