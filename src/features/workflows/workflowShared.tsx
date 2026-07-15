import type { ComponentType } from 'react';
import {
  ClipboardList, PenLine, Scale, ClipboardCheck, Signature, Globe, FileText,
  Search, CheckCircle2, ShieldCheck, Inbox, Landmark, Users, CalendarClock,
  MessagesSquare, Tags, Archive, Lock, MessageSquare, MessageSquareQuote,
  Circle, CircleDot, AlertCircle, PencilRuler, type LucideProps,
} from 'lucide-react';
import type {
  WorkflowConfigStatus, WorkflowPublishState, WorkflowTone, WorkflowType, RoleId,
} from '@/data/types';

// Resolve a stage/icon name (stored as a string in seed data) to a lucide icon.
const ICONS: Record<string, ComponentType<LucideProps>> = {
  ClipboardList, PenLine, Scale, ClipboardCheck, Signature, Globe, FileText,
  Search, CheckCircle2, ShieldCheck, Inbox, Landmark, Users, CalendarClock,
  MessagesSquare, Tags, Archive, Lock, MessageSquare, MessageSquareQuote,
};

export function StageIcon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = ICONS[name] ?? Circle;
  return <Cmp {...props} />;
}

// Catalogue-row icon + tone per workflow type (pastel-tinted icon box).
export const TYPE_META: Record<WorkflowType, { icon: string; tone: WorkflowTone }> = {
  'Order Paper': { icon: 'FileText', tone: 'green' },
  'Votes and Proceedings': { icon: 'CheckCircle2', tone: 'green' },
  Question: { icon: 'MessageSquare', tone: 'blue' },
  Statement: { icon: 'MessageSquareQuote', tone: 'blue' },
  Petition: { icon: 'Users', tone: 'gold' },
  Motion: { icon: 'Scale', tone: 'green' },
  'Papers Laid': { icon: 'FileText', tone: 'gold' },
  Bill: { icon: 'FileText', tone: 'green' },
  'Statutory Instrument': { icon: 'Lock', tone: 'grey' },
  Supply: { icon: 'Landmark', tone: 'gold' },
  Report: { icon: 'FileText', tone: 'grey' },
};

// Configuration status → pastel tone + a distinct icon so status never relies on
// colour alone. "Needs Review" and "Draft" use gold; "Active"/"Complete" green.
export function configStatusMeta(status: WorkflowConfigStatus): {
  tone: WorkflowTone; icon: ComponentType<LucideProps>;
} {
  switch (status) {
    case 'Active': return { tone: 'green', icon: CircleDot };
    case 'Complete': return { tone: 'green', icon: CheckCircle2 };
    case 'Needs Review': return { tone: 'gold', icon: AlertCircle };
    case 'Draft': return { tone: 'gold', icon: PencilRuler };
  }
}

export function publishMeta(state: WorkflowPublishState): {
  tone: WorkflowTone; icon: ComponentType<LucideProps>;
} {
  return state === 'Published'
    ? { tone: 'green', icon: CheckCircle2 }
    : { tone: 'gold', icon: PencilRuler };
}

// Workflow configuration is administered by ICT (with Clerk oversight); every
// other role sees the catalogue and templates read-only.
export function canConfigureWorkflows(role: RoleId | null): boolean {
  return role === 'ict-admin' || role === 'clerk';
}

export const CONFIGURE_HINT =
  'Workflow configuration is available to the ICT Administrator.';
