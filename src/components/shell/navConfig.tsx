import type { ReactNode } from 'react';
import {
  LayoutGrid, ListChecks, Bell, Scale, Vote, MessageSquare, MessageSquareQuote,
  ScrollText, PenLine, ClipboardCheck, Search, ScanLine, Library, Workflow,
} from 'lucide-react';
import type { RoleId } from '@/data/types';

export interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  /** When set, item shows an unread badge sourced from notifications. */
  badgeKey?: 'notifications';
  /** Restrict to certain roles; absent = all internal roles. */
  roles?: RoleId[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
  roles?: RoleId[];
}

const ic = { width: 18, height: 18, strokeWidth: 1.9 } as const;
const legislativeRoles: RoleId[] = ['dls-drafter', 'dls-reviewer', 'dlps-officer', 'clerk'];
const draftingRoles: RoleId[] = ['dls-drafter', 'dls-reviewer', 'dlps-officer'];

export const navGroups: NavGroup[] = [
  {
    label: 'Home',
    items: [
      { label: 'Command Centre', to: '/dashboard', icon: <LayoutGrid {...ic} /> },
      { label: 'My Work', to: '/work', icon: <ListChecks {...ic} /> },
      { label: 'Notifications', to: '/notifications', icon: <Bell {...ic} />, badgeKey: 'notifications' },
    ],
  },
  {
    label: 'Legislative Work',
    roles: legislativeRoles,
    items: [
      { label: 'Bills', to: '/work?type=Bill', icon: <Scale {...ic} /> },
      { label: 'Motions', to: '/work?type=Motion', icon: <Vote {...ic} /> },
      { label: 'Questions', to: '/work?type=Question', icon: <MessageSquare {...ic} /> },
      { label: 'Statements', to: '/work?type=Statement', icon: <MessageSquareQuote {...ic} /> },
      { label: 'Petitions', to: '/work?type=Petition', icon: <ScrollText {...ic} /> },
    ],
  },
  {
    label: 'Drafting',
    roles: draftingRoles,
    items: [
      { label: 'My Drafts', to: '/work?status=in-progress', icon: <PenLine {...ic} /> },
      { label: 'Review Queue', to: '/work?status=awaiting-review', icon: <ClipboardCheck {...ic} /> },
    ],
  },
  {
    label: 'Workflow',
    roles: ['clerk', 'ict-admin'],
    items: [
      { label: 'Workflow Catalogue', to: '/workflows', icon: <Workflow {...ic} /> },
    ],
  },
  {
    label: 'Knowledge',
    items: [
      { label: 'Search', to: '/search', icon: <Search {...ic} /> },
      { label: 'Repository', to: '/repository', icon: <Library {...ic} /> },
      { label: 'OCR & Historical Records', to: '/archive/ocr', icon: <ScanLine {...ic} /> },
    ],
  },
];
