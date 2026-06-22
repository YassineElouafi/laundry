import {
  LayoutDashboard,
  Package,
  CalendarClock,
  Tags,
  Users,
  Truck,
  CreditCard,
  Settings,
  UserCog,
  Palette,
  Bell,
  Monitor,
  Wrench,
  Command,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Laundry Ops',
      logo: Command,
      plan: 'Back office',
    },
  ],
  navGroups: [
    {
      title: 'Operations',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Orders',
          url: '/orders',
          icon: Package,
        },
        {
          title: 'Scheduling',
          url: '/scheduling',
          icon: CalendarClock,
        },
        {
          title: 'Catalog',
          url: '/catalog',
          icon: Tags,
        },
        {
          title: 'Customers',
          url: '/customers',
          icon: Users,
        },
        {
          title: 'Drivers',
          url: '/drivers',
          icon: Truck,
        },
        {
          title: 'Payments',
          url: '/payments',
          icon: CreditCard,
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
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
      ],
    },
  ],
}
