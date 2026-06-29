import { LinkDef } from '../../../../types.ts'
import { BoltIcon, BriefcaseIcon, BuildingOffice2Icon, UserGroupIcon, UsersIcon } from '../../icons/heroicons/outline.tsx'

export const superadmin_home_page_nav_links: LinkDef[] = [
  {
    route: '/app/superadmin/patients',
    title: 'Patients',
    Icon: UsersIcon,
  },
  {
    route: '/app/superadmin/health_workers',
    title: 'Health Workers',
    Icon: UserGroupIcon,
  },
  {
    route: '/app/superadmin/organizations',
    title: 'Organizations',
    Icon: BuildingOffice2Icon,
  },
  {
    route: '/app/superadmin/employment',
    title: 'Employment',
    Icon: BriefcaseIcon,
  },
  {
    route: '/app/superadmin/events',
    title: 'Events',
    Icon: BoltIcon,
  },
]
