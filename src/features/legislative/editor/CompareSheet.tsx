import { useState } from 'react';
import { Download, ChevronRight } from 'lucide-react';
import { SideSheet, Button } from '@/components/ui';
import { changeSummary } from '@/data/draftContent';
import styles from './editorSheets.module.css';

const VIEWS = ['Summary', 'Inline', 'Side-by-side', 'Changed clauses only'];
const CHANGED_CLAUSES = [
  { n: 'Clause 6 — Digital service standards', badge: 'M', count: '2 changes', tone: 'mod' },
  { n: 'Clause 9 — Data minimisation', badge: 'A', count: '1 change', tone: 'add' },
  { n: 'Clause 14 — Protection of vulnerable users', badge: '3', count: '', tone: 'multi' },
  { n: 'Schedule 1 — Inclusion and accessibility', badge: 'M', count: '1 change', tone: 'mod' },
];

export function CompareSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [view, setView] = useState('Summary');
  return (
    <SideSheet open={open} onClose={onClose} size="xxl" title="Compare Versions" subtitle="Compare differences between document versions"
      footer={<div className={styles.footer}><Button variant="secondary" leftIcon={<Download width={15} height={15} />}>Download comparison report</Button><Button variant="primary" onClick={onClose}>Close</Button></div>}>
      <div className={styles.compareVersions}>
        <div className={styles.cmpV}><span className={styles.cmpVLabel}>Version 4.0</span><span className={styles.cmpVMeta}>Saved on 12 May, 09:12 AM</span></div>
        <span className={styles.cmpVs}>vs</span>
        <div className={`${styles.cmpV} ${styles.cmpVActive}`}><span className={styles.cmpVLabel}>Version 4.1</span><span className={styles.cmpVMeta}>Current under review</span></div>
      </div>

      <div className={styles.cmpViews} role="tablist">
        {VIEWS.map((v) => <button key={v} role="tab" aria-selected={view === v} className={`${styles.cmpView} ${view === v ? styles.cmpViewActive : ''}`} onClick={() => setView(v)}>{v}</button>)}
      </div>

      <p className={styles.secLabel}>Change overview</p>
      <div className={styles.cmpOverview}>
        <div className={styles.cmpStat}><span className={styles.csAdd}>{changeSummary.additions}</span>Additions</div>
        <div className={styles.cmpStat}><span className={styles.csDel}>{changeSummary.deletions}</span>Deletions</div>
        <div className={styles.cmpStat}><span className={styles.csMod}>{changeSummary.modified}</span>Modified</div>
        <div className={styles.cmpStat}><span className={styles.csMetaN}>{changeSummary.metadata}</span>Metadata</div>
      </div>

      <p className={styles.secLabel}>Changed clauses</p>
      <ul className={styles.cmpClauses}>
        {CHANGED_CLAUSES.map((c) => (
          <li key={c.n}>
            <span className={`${styles.cmpBadge} ${styles['cmpBadge_' + c.tone]}`}>{c.badge}</span>
            <span className={styles.cmpClauseName}>{c.n}</span>
            {c.count && <span className={styles.cmpClauseCount}>{c.count}</span>}
            <ChevronRight width={15} height={15} className={styles.cmpChev} />
          </li>
        ))}
      </ul>

      <p className={styles.secLabel}>Metadata changes (2)</p>
      <dl className={styles.cmpMeta}>
        <div><dt>Version note</dt><dd>Updated</dd></div>
        <div><dt>Review status</dt><dd>Updated</dd></div>
      </dl>
    </SideSheet>
  );
}
