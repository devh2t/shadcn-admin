import { createFileRoute } from '@tanstack/react-router'
import { SettingsNotifications } from '@/features/settings/notifications'

export const Route = createFileRoute('/$orgSlug/_authenticated/settings/notifications')({
  component: SettingsNotifications,
})
