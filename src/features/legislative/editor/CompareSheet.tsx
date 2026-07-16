import { useState } from 'react';
import { Download, ChevronRight, ChevronDown } from 'lucide-react';
import { SideSheet, Button } from '@/components/ui';
import { versionCompare, type CompareProvision } from '@/data/draftContent';
import { wordDiff } from './draftDiff';
import styles from './editorSheets.module.css';

const VIEWS = ['Summary', 'Inline', 'Side-by-side', 'Changed clauses only'];
const KIND_BADGE: Record<string, { badge: string; tone: string }> = {
  modified: { badge: 'M', tone: 'mod' },
  added: { badge: 'A', tone: 'add' },
  multi: { badge: '3', tone: 'multi' },
};

function Redline({ p }: { p: CompareProvision }) {
  if (p.kind === 'added') return <p className={styles.cmpRedline}><span className={styles.cmpRlAdd}>{p.newText}</span></p>;
  return (
    <p className={styles.cmpRedline}>
      {wordDiff(p.oldText, p.newText).map((tok, i) => (
        <span key={i} className={tok.status === 'add' ? styles.cmpRlAdd : tok.status === 'del' ? styles.cmpRlDel : undefined}>{tok.text}</span>
      ))}
    </p>
  );
}

export function CompareSheet({ open, onClose, onToast }: { open: boolean; onClose: () => void; onToast?: (m: string) => void }) {
  const [view, setView] = useState('Summary');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { from, to, summary, provisions, metadataChanges } = versionCompare;

  const toggle = (id: string) => setExpanded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  function downloadReport() {
    const lines = [
      `Version comparison — ${from.version} → ${to.version}`, '',
      `Additions: ${summary.additions}   Deletions: ${summary.deletions}   Modified: ${summary.modified}   Metadata: ${summary.metadata}`, '',
      'CHANGED PROVISIONS', '',
    ];
    provisions.forEach((p) => {
      lines.push(`${p.clause}  [${p.kind}]`);
      if (p.oldText) lines.push(`  v${from.version}: ${p.oldText}`);
      if (p.newText) lines.push(`  v${to.version}: ${p.newText}`);
      lines.push('');
    });
    lines.push('METADATA CHANGES', '');
    metadataChanges.forEach((m) => lines.push(`${m.field}: ${m.from} → ${m.to}`));
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = `NA-BILL-2026-015-comparison-${from.version}-${to.version}.txt`; a.click();
    URL.revokeObjectURL(url);
    onToast?.('Comparison report downloaded.');
  }

  const clauseList = (
    <ul className={styles.cmpClauses}>
      {provisions.map((p) => {
        const meta = KIND_BADGE[p.kind];
        const isOpen = expanded.has(p.id);
        return (
          <li key={p.id}>
            <button className={styles.cmpClauseBtn} aria-expanded={isOpen} onClick={() => toggle(p.id)}>
              <span className={`${styles.cmpBadge} ${styles['cmpBadge_' + meta.tone]}`}>{meta.badge}</span>
              <span className={styles.cmpClauseName}>{p.clause}</span>
              {p.changeCount && <span className={styles.cmpClauseCount}>{p.changeCount}</span>}
              {isOpen ? <ChevronDown width={15} height={15} className={styles.cmpChev} /> : <ChevronRight width={15} height={15} className={styles.cmpChev} />}
            </button>
            {isOpen && <div className={styles.cmpExpanded}><Redline p={p} /></div>}
          </li>
        );
      })}
    </ul>
  );

  return (
    <SideSheet open={open} onClose={onClose} size="xxl" title="Compare Versions" subtitle="Compare differences between document versions"
      footer={<div className={styles.footer}><Button variant="secondary" leftIcon={<Download width={15} height={15} />} onClick={downloadReport}>Download comparison report</Button><Button variant="primary" onClick={onClose}>Close</Button></div>}>
      <div className={styles.compareVersions}>
        <div className={styles.cmpV}><span className={styles.cmpVLabel}>Version {from.version}</span><span className={styles.cmpVMeta}>{from.savedAt}</span></div>
        <span className={styles.cmpVs}>vs</span>
        <div className={`${styles.cmpV} ${styles.cmpVActive}`}><span className={styles.cmpVLabel}>Version {to.version}</span><span className={styles.cmpVMeta}>{to.note}</span></div>
      </div>

      <div className={styles.cmpViews} role="tablist">
        {VIEWS.map((v) => <button key={v} role="tab" aria-selected={view === v} className={`${styles.cmpView} ${view === v ? styles.cmpViewActive : ''}`} onClick={() => setView(v)}>{v}</button>)}
      </div>

      {view === 'Summary' && (
        <>
          <p className={styles.secLabel}>Change overview</p>
          <div className={styles.cmpOverview}>
            <div className={styles.cmpStat}><span className={styles.csAdd}>{summary.additions}</span>Additions</div>
            <div className={styles.cmpStat}><span className={styles.csDel}>{summary.deletions}</span>Deletions</div>
            <div className={styles.cmpStat}><span className={styles.csMod}>{summary.modified}</span>Modified</div>
            <div className={styles.cmpStat}><span className={styles.csMetaN}>{summary.metadata}</span>Metadata</div>
          </div>
          <p className={styles.secLabel}>Changed clauses — select to expand</p>
          {clauseList}
          <p className={styles.secLabel}>Metadata changes ({metadataChanges.length})</p>
          <dl className={styles.cmpMeta}>
            {metadataChanges.map((m) => <div key={m.field}><dt>{m.field}</dt><dd>{m.from} → {m.to}</dd></div>)}
          </dl>
        </>
      )}

      {view === 'Inline' && (
        <>
          <p className={styles.secLabel}>Inline redline ({provisions.length} provisions)</p>
          <ul className={styles.cmpInline}>
            {provisions.map((p) => (
              <li key={p.id} className={styles.cmpInlineItem}>
                <span className={styles.cmpInlineName}>{p.clause}</span>
                <Redline p={p} />
              </li>
            ))}
          </ul>
        </>
      )}

      {view === 'Side-by-side' && (
        <>
          <p className={styles.secLabel}>Side-by-side ({provisions.length} provisions)</p>
          <ul className={styles.cmpInline}>
            {provisions.map((p) => (
              <li key={p.id} className={styles.cmpInlineItem}>
                <span className={styles.cmpInlineName}>{p.clause}</span>
                <div className={styles.cmpSbs}>
                  <div className={styles.cmpSbsCol}><span className={styles.cmpSbsLabel}>Version {from.version}</span><p>{p.oldText || <em>— not present —</em>}</p></div>
                  <div className={`${styles.cmpSbsCol} ${styles.cmpSbsNew}`}><span className={styles.cmpSbsLabel}>Version {to.version}</span><p>{p.newText || <em>— removed —</em>}</p></div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {view === 'Changed clauses only' && (
        <>
          <p className={styles.secLabel}>Changed clauses ({provisions.length}) — select to expand</p>
          {clauseList}
        </>
      )}
    </SideSheet>
  );
}
