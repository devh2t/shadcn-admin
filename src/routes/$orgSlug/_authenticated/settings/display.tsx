import { createFileRoute } from '@tanstack/react-router'
import { SettingsDisplay } from '@/features/settings/display'

export const Route = createFileRoute('/$orgSlug/_authenticated/settings/display')({
  component: SettingsDisplay,
})
