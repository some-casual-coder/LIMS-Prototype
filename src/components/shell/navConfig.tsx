import type { ReactNode } from 'react';
import {
  LayoutGrid, ListChecks, Bell, Scale, Vote, MessageSquare, MessageSquareQuote,
  ScrollText, PenLine, ClipboardCheck, LayoutTemplate, Search, Archive, ScanLine,
  Inbox, Megaphone, BarChart3, ShieldCheck, Library, Bookmark, FolderOpen, History,
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
    items: [
      { label: 'My Drafts', to: '/work?view=my-drafts', icon: <PenLine {...ic} /> },
      { label: 'Review Queue', to: '/work?view=review-queue', icon: <ClipboardCheck {...ic} /> },
      { label: 'Templates', to: '/documents?view=templates', icon: <LayoutTemplate {...ic} /> },
    ],
  },
  {
    label: 'Search & Knowledge',
    items: [
      { label: 'Search', to: '/search', icon: <Search {...ic} /> },
      { label: 'Repository', to: '/repository', icon: <Library {...ic} /> },
      { label: 'OCR & Historical Records', to: '/archive/ocr', icon: <ScanLine {...ic} /> },
      { label: 'Saved Searches', to: '/search/saved', icon: <Bookmark {...ic} /> },
      { label: 'Research Collections', to: '/research', icon: <FolderOpen {...ic} /> },
      { label: 'Recent Research', to: '/search/recent', icon: <History {...ic} /> },
    ],
  },
  {
    label: 'Documents',
    items: [
      { label: 'Document Archive', to: '/documents', icon: <Archive {...ic} /> },
    ],
  },
  {
    label: 'Public Participation',
    items: [
      { label: 'Submission Inbox', to: '/participation', icon: <Inbox {...ic} /> },
      { label: 'Active Consultations', to: '/participation?view=active', icon: <Megaphone {...ic} /> },
    ],
  },
  {
    label: 'Oversight',
    items: [
      { label: 'Analytics', to: '/analytics', icon: <BarChart3 {...ic} /> },
      { label: 'Audit & Compliance', to: '/audit', icon: <ShieldCheck {...ic} /> },
    ],
  },
];
