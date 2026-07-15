import type { ReactNode } from 'react';
import {
  Scale, Vote, MessageSquare, MessageSquareQuote, ScrollText, ClipboardList,
  ListChecks, FileText, FileCog, Coins, FileBarChart, ScanLine, FileCode, Code2, Accessibility,
} from 'lucide-react';
import type { LegislativeRecord, OutputFormat, WorkflowType } from '@/data/types';
import styles from './shared.module.css';

// --- Matched-phrase highlighting -------------------------------------------
// Wraps each highlight phrase in a <mark>. Case-insensitive, non-overlapping.
export function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const escaped = terms
    .filter(Boolean)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length);
  if (!escaped.length) return <>{text}</>;
  const re = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(re);
  return (
    <>
      {parts.map((part, i) =>
        re.test(part) && terms.some((t) => t.toLowerCase() === part.toLowerCase())
          ? <mark key={i} className={styles.mark}>{part}</mark>
          : <span key={i}>{part}</span>,
      )}
    </>
  );
}

// --- Record type icons ------------------------------------------------------
const TYPE_ICONS: Record<WorkflowType, ReactNode> = {
  Bill: <Scale />,
  Motion: <Vote />,
  Question: <MessageSquare />,
  Statement: <MessageSquareQuote />,
  Petition: <ScrollText />,
  'Order Paper': <ClipboardList />,
  'Votes and Proceedings': <ListChecks />,
  'Papers Laid': <FileText />,
  'Statutory Instrument': <FileCog />,
  Supply: <Coins />,
  Report: <FileBarChart />,
};

export function recordIcon(r: LegislativeRecord): ReactNode {
  if (r.recordSource === 'Historical scan') return <ScanLine />;
  return TYPE_ICONS[r.workflowType] ?? <FileText />;
}

// --- Format chips -----------------------------------------------------------
const FORMAT_META: Record<OutputFormat, { label: string; icon: ReactNode; cls: string }> = {
  PDF: { label: 'PDF', icon: <FileText />, cls: styles.fmtPdf },
  HTML: { label: 'HTML', icon: <Code2 />, cls: styles.fmtHtml },
  'AKN XML': { label: 'XML', icon: <FileCode />, cls: styles.fmtXml },
  'Accessible HTML': { label: 'Accessible HTML', icon: <Accessibility />, cls: styles.fmtHtml },
  Scan: { label: 'Scan', icon: <ScanLine />, cls: styles.fmtScan },
  'OCR Text': { label: 'OCR Text', icon: <FileText />, cls: styles.fmtScan },
};

export function FormatChips({ formats, max }: { formats: OutputFormat[]; max?: number }) {
  const shown = max ? formats.slice(0, max) : formats;
  const extra = max ? formats.length - shown.length : 0;
  return (
    <div className={styles.formats}>
      {shown.map((f) => {
        const m = FORMAT_META[f];
        return (
          <span key={f} className={`${styles.fmt} ${m.cls}`}>
            <span className={styles.fmtIcon} aria-hidden>{m.icon}</span>
            {m.label}
          </span>
        );
      })}
      {extra > 0 && <span className={styles.fmt}>+{extra}</span>}
    </div>
  );
}

// Short directorate label shown on cards.
export const dirLabel = (d: string) =>
  d.includes('Legal Services') ? 'DLS'
    : d.includes('Legislative and Procedural') ? 'DLPS'
      : d.includes('Clerk') ? 'Office of the Clerk' : 'PLPU';

export const visLabel = (r: LegislativeRecord) =>
  r.restricted ? 'Restricted' : r.confidentiality === 'Public' ? 'Public' : r.confidentiality === 'Confidential' ? 'Confidential' : 'Internal';
