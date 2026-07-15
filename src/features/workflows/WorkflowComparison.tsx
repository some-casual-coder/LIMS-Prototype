import { TriangleAlert } from 'lucide-react';
import { ShelledPage } from '@/features/common/ShelledPage';
import { Button, StatusBadge, toneVars } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import { paths } from '@/routes/paths';
import { StageIcon, TYPE_META, publishMeta } from './workflowShared';
import type { WorkflowTemplate, WorkflowType } from '@/data/types';
import styles from './WorkflowComparison.module.css';

const COMPARE_SLUGS = ['bills', 'order-paper', 'supply'];

const ROWS: Array<{ label: string; get: (t: WorkflowTemplate) => React.ReactNode }> = [
  { label: 'Primary Directorate', get: (t) => t.comparison.directorate },
  { label: 'Current Version', get: (t) => t.comparison.version },
  { label: 'Status', get: (t) => { const pm = publishMeta(t.comparison.status); return <StatusBadge tone={pm.tone} size="sm" icon={<pm.icon width={12} height={12} />}>{t.comparison.status}</StatusBadge>; } },
  { label: 'Stages', get: (t) => t.comparison.stages },
  { label: 'Active Records', get: (t) => t.comparison.activeRecords },
  { label: 'Approvals Required', get: (t) => t.comparison.approvals },
  { label: 'PBO / Financial Dependency', get: (t) => t.comparison.pboDependency },
  { label: 'Key Document Requirements', get: (t) => <ul className={styles.docList}>{t.comparison.keyDocuments.map((d) => <li key={d}>{d}</li>)}</ul> },
  { label: 'Typical Duration (indicative)', get: (t) => t.comparison.duration },
];

export function WorkflowComparison() {
  const templates = useDemoStore((s) => s.workflowTemplates);
  const cols = COMPARE_SLUGS
    .map((slug) => templates.find((t) => t.slug === slug))
    .filter((t): t is WorkflowTemplate => Boolean(t));

  return (
    <ShelledPage
      breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Workflow Catalogue', to: paths.workflows }, { label: 'Comparison' }]}
      title="Workflow Comparison"
      subtitle="Compare key aspects of the Bills, Order Paper and Supply workflows to show how each is configured differently."
    >
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.rowHead}>Workflow</th>
              {cols.map((t) => {
                const tm = TYPE_META[t.type as WorkflowType];
                return (
                  <th key={t.slug} className={styles.colHead}>
                    <span className={styles.colIcon} style={{ background: toneVars[tm.tone].bg, color: toneVars[tm.tone].fg }} aria-hidden>
                      <StageIcon name={tm.icon} width={20} height={20} />
                    </span>
                    <span className={styles.colName}>{t.name}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.label}>
                <th className={styles.rowHead} scope="row">{r.label}</th>
                {cols.map((t) => <td key={t.slug} className={styles.cell}>{r.get(t)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.disclaimer} role="note">
        <TriangleAlert width={17} height={17} aria-hidden />
        <span>Comparative information is illustrative. Final workflow details, approvals and dependencies will be confirmed against National Assembly SOPs during inception.</span>
      </div>

      <div className={styles.actions}>
        {cols.map((t, i) => (
          <Button key={t.slug} variant={i === cols.length - 1 ? 'primary' : 'secondary'} to={paths.workflowTemplate(t.slug)}>
            View {t.name.replace(' Workflow', '')} workflow
          </Button>
        ))}
      </div>
    </ShelledPage>
  );
}
