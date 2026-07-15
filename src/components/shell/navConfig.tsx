import type { ReactNode } from 'react';
import {
  LayoutGrid, ListChecks, Scale, Vote, MessageSquare, MessageSquareQuote,
  ScrollText, PenLine, ClipboardCheck, Search, ScanLine, Library,
} from 'lucide-react';
import type { RoleId } from '@/data/types';

export interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
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
    ],
  },
  {
    label: 'Legislative Work',
    roles: legislativeRoles,
    items: [
      { label: 'Bills', to: '/bills', icon: <Scale {...ic} /> },
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
    label: 'Knowledge',
    items: [
      { label: 'Search', to: '/search', icon: <Search {...ic} /> },
      { label: 'Repository', to: '/repository', icon: <Library {...ic} /> },
      { label: 'OCR & Historical Records', to: '/archive/ocr', icon: <ScanLine {...ic} /> },
    ],
  },
];
