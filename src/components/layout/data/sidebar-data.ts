import {
  AudioWaveform,
  Bell,
  Command,
  GalleryVerticalEnd,
  HelpCircle,
  LayoutDashboard,
  Monitor,
  Palette,
  Settings,
  UserCog,
  Users,
  Wrench
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  // user: {
  //   name: 'Mohamed',
  //   email: 'arganito@gmail.com',
  //   avatar: '/avatars/shadcn.jpg',
  // },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/$orgSlug',
          icon: LayoutDashboard,
        },
        {
          title: 'Users',
          url: '/$orgSlug/users',
          icon: Users,
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/$orgSlug/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/$orgSlug/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/$orgSlug/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/$orgSlug/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/$orgSlug/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/$orgSlug/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
