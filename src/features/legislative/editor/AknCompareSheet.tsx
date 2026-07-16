import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { SideSheet, Button } from '@/components/ui';
import type { StructuredBillDraft } from '@/data/types';
import { diffSections, wordDiff } from './draftDiff';
import styles from './AknCompareSheet.module.css';

const KIND_META: Record<string, { badge: string; label: string; cls: string }> = {
  added: { badge: 'A', label: 'Added', cls: styles.add },
  removed: { badge: 'D', label: 'Removed', cls: styles.del },
  modified: { badge: 'M', label: 'Modified', cls: styles.mod },
};

// Real version comparison for a structured Bill draft: diffs the working copy
// against a chosen saved version and shows a word-level redline per provision.
export function AknCompareSheet({ open, onClose, draft, onToast }: {
  open: boolean; onClose: () => void; draft: StructuredBillDraft; onToast?: (m: string) => void;
}) {
  const revisions = draft.revisions;
  const [baselineId, setBaselineId] = useState(revisions[revisions.length - 1]?.id ?? '');
  const baseline = revisions.find((r) => r.id === baselineId) ?? revisions[revisions.length - 1];

  const diff = useMemo(
    () => (baseline ? diffSections(baseline.sections, draft.sections) : null),
    [baseline, draft.sections],
  );

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      size="xxl"
      title="Compare Versions"
      subtitle="Differences between a saved version and the working copy"
      footer={(
        <div className={styles.footer}>
          <Button variant="secondary" leftIcon={<Download width={15} height={15} />} onClick={() => onToast?.('Preparing the comparison report…')}>Download comparison report</Button>
          <Button variant="primary" onClick={onClose}>Close</Button>
        </div>
      )}
    >
      {!baseline || !diff ? (
        <div className={styles.empty}><p>Save a version first to compare against it.</p></div>
      ) : (
        <>
          <div className={styles.versions}>
            <label className={styles.picker}>
              <span>Baseline</span>
              <select name="compare-baseline" aria-label="Baseline version" value={baseline.id} onChange={(e) => setBaselineId(e.target.value)}>
                {revisions.map((r) => (
                  <option key={r.id} value={r.id}>Version {r.version} · {new Date(r.savedAt).toLocaleString('en-KE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</option>
                ))}
              </select>
            </label>
            <span className={styles.vs}>vs</span>
            <div className={`${styles.versionCard} ${styles.versionActive}`}>
              <span className={styles.versionLabel}>Working copy</span>
              <span className={styles.versionMeta}>Current, unsaved edits</span>
            </div>
          </div>

          <p className={styles.secLabel}>Change overview</p>
          <div className={styles.overview}>
            <div className={styles.stat}><span className={styles.statAdd}>{diff.additions}</span>Additions</div>
            <div className={styles.stat}><span className={styles.statDel}>{diff.deletions}</span>Deletions</div>
            <div className={styles.stat}><span className={styles.statMod}>{diff.modifications}</span>Modified</div>
          </div>

          {diff.changes.length === 0 ? (
            <div className={styles.empty}><p>No differences — the working copy matches Version {baseline.version}.</p></div>
          ) : (
            <>
              <p className={styles.secLabel}>Changed provisions ({diff.changes.length})</p>
              <ul className={styles.changes}>
                {diff.changes.map((change) => {
                  const meta = KIND_META[change.kind];
                  return (
                    <li key={change.blockId} className={styles.change}>
                      <div className={styles.changeHead}>
                        <span className={`${styles.badge} ${meta.cls}`}>{meta.badge}</span>
                        <span className={styles.changeName}>{change.label}</span>
                        <span className={styles.changeTag}>&lt;{change.sectionTag}&gt;</span>
                        <span className={styles.changeKind}>{meta.label}</span>
                      </div>
                      <p className={styles.redline}>
                        {change.kind === 'added' && <span className={styles.rlAdd}>{change.newText || <em>(empty provision)</em>}</span>}
                        {change.kind === 'removed' && <span className={styles.rlDel}>{change.oldText || <em>(empty provision)</em>}</span>}
                        {change.kind === 'modified' && wordDiff(change.oldText, change.newText).map((tok, i) => (
                          <span key={i} className={tok.status === 'add' ? styles.rlAdd : tok.status === 'del' ? styles.rlDel : undefined}>{tok.text}</span>
                        ))}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </>
      )}
    </SideSheet>
  );
}
