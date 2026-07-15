import { Clock, Loader2, UserCheck, ShieldCheck, CheckCircle2, BadgeCheck, AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
import { StatusBadge } from '@/components/ui';
import type { Tone } from '@/components/ui/tone';
import type { OcrStatus } from '@/data/types';
import { officers } from '@/data/personas';

// OCR status → pastel tone. NO blue/purple: Processing & Quality Review use the
// repurposed neutral-charcoal token, differentiated by icon + text label.
export const ocrStatusTone: Record<OcrStatus, Tone> = {
  'Awaiting Processing': 'grey',
  Processing: 'blue',
  'Needs Verification': 'gold',
  'Quality Review': 'blue',
  'Ready to Archive': 'green',
  Verified: 'green',
  'Attention Required': 'red',
};

const STATUS_ICON: Record<OcrStatus, ReactNode> = {
  'Awaiting Processing': <Clock width={12} height={12} />,
  Processing: <Loader2 width={12} height={12} className="spin" />,
  'Needs Verification': <UserCheck width={12} height={12} />,
  'Quality Review': <ShieldCheck width={12} height={12} />,
  'Ready to Archive': <CheckCircle2 width={12} height={12} />,
  Verified: <BadgeCheck width={12} height={12} />,
  'Attention Required': <AlertTriangle width={12} height={12} />,
};

export function OcrStatusBadge({ status, size = 'sm' }: { status: OcrStatus; size?: 'sm' | 'md' }) {
  return <StatusBadge tone={ocrStatusTone[status]} size={size} icon={STATUS_ICON[status]}>{status}</StatusBadge>;
}

// Extraction-confidence banding (always paired with the number + label).
export function confidenceMeta(pct: number): { tone: Tone; label: string } {
  if (pct >= 90) return { tone: 'green', label: 'High' };
  if (pct >= 70) return { tone: 'amber', label: 'Medium' };
  return { tone: 'red', label: 'Low' };
}

export function officerName(id?: string): string {
  if (!id) return 'Unassigned';
  return officers.find((o) => o.id === id)?.name ?? id;
}

export function officerInitials(id?: string): string {
  if (!id) return '—';
  return officers.find((o) => o.id === id)?.initials ?? '?';
}

export const relTime = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? 'yesterday' : new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
