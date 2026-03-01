import { createFileRoute } from '@tanstack/react-router'
import { SettingsAppearance } from '@/features/settings/appearance'

export const Route = createFileRoute('/$orgSlug/_authenticated/settings/appearance')({
  component: SettingsAppearance,
})
