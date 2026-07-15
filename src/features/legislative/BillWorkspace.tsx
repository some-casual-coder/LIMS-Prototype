import { useParams, useSearchParams } from 'react-router-dom';
import { Lock, Calendar, UserRound, Clock, PenLine, FileSearch, ArrowRight, Check } from 'lucide-react';
import { AppShell } from '@/components/shell';
import { Panel, Button, StatusBadge } from '@/components/ui';
import { stageTone } from '@/components/ui/tone';
import { useDemoStore } from '@/store/demoStore';
import { officers } from '@/data/personas';
import { primaryBillContent } from '@/data/billContent';
import styles from './BillWorkspace.module.css';

const RIBBON = ['Instruction', 'Drafting', 'Legal Review', 'Procedural Review', 'Signature', 'Publication'];

function ribbonIndex(stage: string): number {
  if (['Instruction Received', 'Intake and Assignment', 'Intake Verification'].includes(stage)) return 0;
  if (stage === 'Drafting') return 1;
  if (['Legal Review', 'Revision Requested', 'Legal Approval'].includes(stage)) return 2;
  if (['Procedural Review', 'Awaiting Supporting Information', 'Approval'].includes(stage)) return 3;
  if (['Awaiting Signature', 'Signed and Sealed'].includes(stage)) return 4;
  return 5;
}

const officerName = (id?: string) => officers.find((o) => o.id === id)?.name ?? '—';

export function BillWorkspace() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const record = useDemoStore((s) => s.records.find((r) => r.id === id));
  const highlight = params.get('highlight');

  if (!record) {
    return (
      <AppShell breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Legislative record' }]}>
        <Panel padded>
          <p style={{ fontWeight: 600 }}>Record not found</p>
          <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>
            This legislative record is not available. Return to the <a href="#/dashboard">Command Centre</a>.
          </p>
        </Panel>
      </AppShell>
    );
  }

  const idx = ribbonIndex(record.stage);
  const returned = record.stage === 'Revision Requested';
  const isPrimary = record.isPrimary;

  return (
    <AppShell breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Legislative Work', to: '/work' }, { label: record.reference }]}>
      {/* Record header */}
      <div className={styles.header}>
        <div className={styles.headMain}>
          <div className={styles.badges}>
            <span className={styles.typeChip}>{record.workflowType}</span>
            <StatusBadge tone={stageTone[record.stage] ?? 'grey'}>{record.stage}</StatusBadge>
            <span className={styles.version}>Version {record.currentVersion} · {record.currentVersionLabel}</span>
          </div>
          <h1 className={styles.title}>{record.title}</h1>
          <div className={styles.meta}>
            <span>{record.reference}</span>
            <span className={styles.dotSep}>·</span>
            <span className={styles.classification}><Lock width={13} height={13} aria-hidden /> {record.confidentiality}</span>
            <span className={styles.dotSep}>·</span>
            <span>Owner: {officerName(record.drafterId)}</span>
          </div>
        </div>
        <div className={styles.headActions}>
          {record.stage === 'Revision Requested' || record.stage === 'Drafting' ? (
            <Button variant="primary" size="lg" to={`/legislative/${record.id}/draft`} leftIcon={<PenLine width={17} height={17} />}>
              Continue drafting
            </Button>
          ) : (
            <Button variant="primary" size="lg" to={`/legislative/${record.id}/draft?mode=review`} leftIcon={<FileSearch width={17} height={17} />}>
              Review document
            </Button>
          )}
          <Button variant="secondary" size="lg" to={`/legislative/${record.id}/versions`}>Versions</Button>
        </div>
      </div>

      {/* Lifecycle ribbon */}
      <ol className={styles.ribbon} aria-label="Legislative lifecycle">
        {RIBBON.map((phase, i) => (
          <li
            key={phase}
            className={`${styles.ribbonStep} ${i < idx ? styles.done : ''} ${i === idx ? styles.current : ''}`}
            aria-current={i === idx ? 'step' : undefined}
          >
            <span className={styles.ribbonDot} aria-hidden>{i < idx ? <Check width={13} height={13} /> : i + 1}</span>
            <span className={styles.ribbonLabel}>
              {phase}
              {i === idx && returned && <span className={styles.returnedTag}>Revision requested</span>}
            </span>
          </li>
        ))}
      </ol>

      {/* Overview */}
      <div className={styles.grid}>
        <div className={styles.left}>
          <Panel title="Overview" padded>
            <p className={styles.summary}>{record.summary}</p>
            {isPrimary && (
              <div className={`${styles.callout} ${highlight === 'clause-14' ? styles.calloutHi : ''}`}>
                <strong>Next required action</strong>
                <p>Resolve the blocking review comment on <b>Clause 14 — Protection of vulnerable users</b> raised by David Otieno, then create a corrected version and resubmit for legal review.</p>
              </div>
            )}
            <h3 className={styles.subhead}>Completion checklist</h3>
            <ul className={styles.checklist}>
              {[
                ['Draft structured and numbered', true],
                ['Required metadata complete', true],
                ['Clause 14 cross-reference confirmed', false],
                ['Legal review approved', false],
                ['Procedural review complete', false],
              ].map(([label, done]) => (
                <li key={label as string} className={done ? styles.checkDone : styles.checkPending}>
                  <span className={styles.checkMark} aria-hidden>{done ? <Check width={13} height={13} /> : ''}</span>
                  {label}
                  <span className="sr-only">{done ? ' (complete)' : ' (pending)'}</span>
                </li>
              ))}
            </ul>
            {isPrimary && (
              <p className={styles.structureNote}>
                Structured record with {primaryBillContent.clauses.length} clauses. The full workspace tabs —
                Tasks, Documents, Versions, Workflow, Public Participation and Activity &amp; Audit — open the
                complete legislative history.
              </p>
            )}
          </Panel>
        </div>

        <div className={styles.right}>
          <Panel title="Responsible officers" padded>
            <dl className={styles.dl}>
              <div><dt><UserRound width={14} height={14} /> Drafter</dt><dd>{officerName(record.drafterId)}</dd></div>
              <div><dt><UserRound width={14} height={14} /> Reviewer</dt><dd>{officerName(record.reviewerId)}</dd></div>
              {record.proceduralOfficerId && <div><dt><UserRound width={14} height={14} /> Procedural</dt><dd>{officerName(record.proceduralOfficerId)}</dd></div>}
            </dl>
          </Panel>
          <Panel title="Key dates" padded>
            <dl className={styles.dl}>
              <div><dt><Calendar width={14} height={14} /> Due</dt><dd>{record.dueDate}</dd></div>
              <div><dt><Clock width={14} height={14} /> Last updated</dt><dd>{new Date(record.lastUpdated).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</dd></div>
            </dl>
          </Panel>
          <Panel title="Related actions" padded>
            <div className={styles.relatedLinks}>
              <Button to={`/legislative/${record.id}/workflow`} variant="ghost">Workflow &amp; approvals <ArrowRight width={15} height={15} /></Button>
              {record.publicParticipation !== 'Not applicable' && (
                <Button to={`/public/bills/${record.id}`} variant="ghost">Public page preview <ArrowRight width={15} height={15} /></Button>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
