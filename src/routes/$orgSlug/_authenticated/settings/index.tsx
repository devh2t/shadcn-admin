import { createFileRoute } from '@tanstack/react-router'
import { SettingsProfile } from '@/features/settings/profile'

export const Route = createFileRoute('/$orgSlug/_authenticated/settings/')({
  component: SettingsProfile,
})
