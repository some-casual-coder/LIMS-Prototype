import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Panel } from '@/components/ui';
import { ShelledPage } from '@/features/common/ShelledPage';
import { WorkQueue } from '@/features/dashboard/WorkQueue';
import { useDemoStore } from '@/store/demoStore';
import { getCommandCentre, type QueueGroup } from '@/data/commandCentre';

const VIEW_LABELS: Record<string, string> = {
  'requires-action': 'Awaiting my action',
  'due-soon': 'Due within 48 hours',
  returned: 'Returned to me',
  'awaiting-review': 'Awaiting my review',
  'my-drafts': 'My drafts',
  'review-queue': 'Review queue',
  confidential: 'Confidential items',
  publication: 'Publication queue',
};

export function MyWork() {
  const role = useDemoStore((s) => s.currentRole);
  const data = useMemo(() => getCommandCentre(role), [role]);
  const [params] = useSearchParams();
  const view = params.get('view') ?? '';
  const type = params.get('type') ?? '';

  const groups = useMemo<QueueGroup[]>(() => {
    let gs = [...data.groups, ...(data.directorateExtra ?? [])].map((g) => ({ ...g, collapsed: false }));
    if (view === 'requires-action') gs = gs.filter((g) => g.id === 'requires-action');
    if (view === 'returned') {
      gs = gs.map((g) => ({ ...g, rows: g.rows.filter((r) => r.stage === 'Revision Requested') }));
    }
    if (view === 'due-soon') {
      gs = gs.map((g) => ({ ...g, rows: g.rows.filter((r) => r.dueUrgent) }));
    }
    if (type) {
      gs = gs.map((g) => ({ ...g, rows: g.rows.filter((r) => r.type === type) }));
    }
    return gs.filter((g) => g.rows.length > 0);
  }, [data, view, type]);

  const subtitle = view && VIEW_LABELS[view]
    ? `Saved view · ${VIEW_LABELS[view]}`
    : type
      ? `Filtered by type · ${type}`
      : 'Your complete operational queue across all legislative work.';

  return (
    <ShelledPage
      breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'My Work' }]}
      title="My Work"
      subtitle={subtitle}
    >
      <Panel padded={false}>
        {groups.length > 0 ? (
          <WorkQueue groups={groups} />
        ) : (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontWeight: 600, color: 'var(--text-strong)' }}>Nothing in this view right now</p>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>There are no legislative items matching this saved view.</p>
          </div>
        )}
      </Panel>
    </ShelledPage>
  );
}
