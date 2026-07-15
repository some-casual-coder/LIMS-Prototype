import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, SlidersHorizontal, RefreshCw, Search as SearchIcon, AlignJustify,
  ClipboardCheck, ListChecks, ScanLine, Workflow, ShieldCheck, Bookmark, MoreHorizontal,
} from 'lucide-react';
import { AppShell } from '@/components/shell';
import { Button, Panel, SegmentedControl, Popover } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import { allPersonas } from '@/data/personas';
import { getCommandCentre } from '@/data/commandCentre';
import type { QueueGroup } from '@/data/commandCentre';
import type { Priority, WorkflowType } from '@/data/types';
import { greeting } from '@/lib/format';
import { WorkQueue } from './WorkQueue';
import { SummaryCards } from './SummaryCards';
import { ReadinessRail } from './ReadinessRail';
import styles from './CommandCentre.module.css';

const VIEW_OPTIONS = [
  { value: 'my-work', label: 'My Work' },
  { value: 'directorate', label: 'Directorate Work' },
];

const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];
const TYPES: WorkflowType[] = ['Bill', 'Motion', 'Petition', 'Statutory Instrument', 'Order Paper', 'Votes and Proceedings'];

const SAVED_VIEWS = [
  { label: 'Awaiting my action', to: '/work?status=requires-action' },
  { label: 'Due within 48 hours', to: '/work?status=due-48' },
  { label: 'Returned to me', to: '/work?status=returned' },
  { label: 'Awaiting another officer', to: '/work?status=waiting-on-others' },
  { label: 'Recently completed', to: '/work?status=completed' },
];

const roleIntro: Record<string, string> = {
  'dls-drafter': 'Drafting priorities, deadlines and work requiring your decision.',
  'dls-reviewer': 'Legal reviews, blocking issues and decisions awaiting approval.',
  'dlps-officer': 'Procedural work, sitting deadlines and publication readiness.',
  clerk: 'Authorisations, institutional risk and publication readiness.',
  'records-officer': 'Digitisation, verification and records awaiting archival action.',
  'ict-admin': 'Workflow configuration, service health and operational exceptions.',
  'participation-officer': 'Assigned legislative work and records requiring follow-up.',
};

export function CommandCentre() {
  const role = useDemoStore((s) => s.currentRole);
  const persona = allPersonas.find((p) => p.id === role) ?? allPersonas[0];
  const data = useMemo(() => getCommandCentre(role), [role]);

  const [view, setView] = useState('my-work');
  const [query, setQuery] = useState('');
  const [priorities, setPriorities] = useState<Set<Priority>>(new Set());
  const [types, setTypes] = useState<Set<WorkflowType>>(new Set());
  const [compact, setCompact] = useState(false);
  const [loading, setLoading] = useState(false);

  const firstName = persona.name === 'Office of the Clerk' ? 'Clerk' : persona.name.split(' ')[0];
  const activeFilterCount = priorities.size + types.size;
  const primaryAction = getPrimaryAction(role);
  const secondaryActions = getSecondaryActions(role);

  const baseGroups = useMemo<QueueGroup[]>(() => {
    if (view === 'directorate') return [...(data.directorateExtra ?? []), ...data.groups];
    return data.groups;
  }, [view, data]);

  const groups = useMemo<QueueGroup[]>(() => {
    const q = query.trim().toLowerCase();
    const filtered = baseGroups.map((g) => ({
      ...g,
      rows: g.rows.filter((r) => {
        if (q && !`${r.title} ${r.reference} ${r.requiredAction} ${r.ownerName}`.toLowerCase().includes(q)) return false;
        if (priorities.size && !priorities.has(r.priority)) return false;
        if (types.size && !types.has(r.type)) return false;
        return true;
      }),
    }));
    const anyFilter = q || activeFilterCount > 0;
    return anyFilter ? filtered.filter((g) => g.rows.length > 0) : filtered;
  }, [baseGroups, query, priorities, types, activeFilterCount]);

  function refresh() {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 750);
  }

  function toggleSet<T>(set: Set<T>, value: T, setter: (s: Set<T>) => void) {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    setter(next);
  }

  const totalVisible = groups.reduce((n, g) => n + g.rows.length, 0);

  return (
    <AppShell breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Command Centre' }]}>
      <div className={styles.intro}>
        <div>
          <p className={styles.welcome}>{greeting()}, {firstName}</p>
          <h1 className={styles.greeting}>Command Centre</h1>
          <p className={styles.lede}>{roleIntro[role ?? ''] ?? 'Priority work, deadlines and decisions in one operational view.'}</p>
          <p className={styles.context}>{data.contextDate}</p>
        </div>
        <div className={styles.introActions}>
          <Button variant="primary" size="lg" to={primaryAction.to} leftIcon={primaryAction.icon}>
            {primaryAction.label}
          </Button>
          <Popover
            label="More Command Centre actions"
            trigger={({ toggle, ref, open }) => (
              <button
                ref={ref}
                className={styles.moreBtn}
                onClick={toggle}
                aria-label="More Command Centre actions"
                aria-expanded={open}
                title="More actions"
              >
                <MoreHorizontal width={19} height={19} />
              </button>
            )}
          >
            {(close) => (
              <div className={styles.menu} onClick={close}>
                {secondaryActions.map((action) => (
                  <Link key={action.label} to={action.to} className={styles.menuItem}>{action.label}</Link>
                ))}
              </div>
            )}
          </Popover>
        </div>
      </div>

      <div className={styles.controls}>
        <SegmentedControl options={VIEW_OPTIONS} value={view} onChange={setView} ariaLabel="Dashboard view" />
      </div>

      <div className={styles.cards}>
        <SummaryCards cards={data.summaryCards.filter((card) => !card.repeatsQueue)} />
      </div>

      {/* Main + rail */}
      <div className={styles.layout}>
        <Panel
          className={styles.queuePanel}
          padded={false}
          title="Priority Work"
          actions={
            <div className={styles.queueControls}>
              <label className={styles.queueSearch}>
                <SearchIcon width={15} height={15} aria-hidden />
                <input
                  type="text"
                  name="queue-search"
                  placeholder="Search this queue"
                  aria-label="Search this queue"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <Popover
                label="Saved queue views"
                trigger={({ toggle, ref, open }) => (
                  <button
                    ref={ref}
                    className={styles.iconControl}
                    onClick={toggle}
                    aria-label="Saved queue views"
                    aria-expanded={open}
                    title="Saved queue views"
                  >
                    <Bookmark width={17} height={17} />
                  </button>
                )}
              >
                {(close) => (
                  <div className={styles.menu} onClick={close}>
                    <p className={styles.menuLabel}>Saved views</p>
                    {SAVED_VIEWS.map((savedView) => (
                      <Link key={savedView.label} to={savedView.to} className={styles.menuItem}>{savedView.label}</Link>
                    ))}
                    <Link to="/work?sheet=save-view" className={styles.menuItem}>Save current view</Link>
                  </div>
                )}
              </Popover>
              <FilterPopover
                priorities={priorities} types={types}
                onTogglePriority={(p) => toggleSet(priorities, p, setPriorities)}
                onToggleType={(t) => toggleSet(types, t, setTypes)}
                onClear={() => { setPriorities(new Set()); setTypes(new Set()); }}
                activeCount={activeFilterCount}
                compactTrigger
              />
              <button
                className={styles.iconControl}
                onClick={refresh}
                aria-label={loading ? 'Refreshing priority work' : 'Refresh priority work'}
                title="Refresh priority work"
                disabled={loading}
              >
                <RefreshCw width={17} height={17} className={loading ? styles.spin : ''} />
              </button>
              <button
                className={styles.iconControl}
                onClick={() => setCompact((c) => !c)}
                aria-pressed={compact}
                aria-label={compact ? 'Comfortable row spacing' : 'Compact row spacing'}
                title={compact ? 'Comfortable rows' : 'Compact rows'}
              >
                <AlignJustify width={17} height={17} />
              </button>
            </div>
          }
        >
          <div className={styles.queueSubhead}>
            <p>{totalVisible} item{totalVisible === 1 ? '' : 's'}, ordered by urgency and deadline.</p>
            <Link to="/work" className={styles.viewAll}>Open My Work</Link>
          </div>
          {loading ? (
            <QueueSkeleton />
          ) : totalVisible === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No items match your filters</p>
              <p className={styles.emptyBody}>Adjust the search or filters to see legislative work.</p>
              <button
                className={styles.emptyAction}
                onClick={() => { setQuery(''); setPriorities(new Set()); setTypes(new Set()); }}
              >
                Clear search and filters
              </button>
            </div>
          ) : (
            <div className={compact ? styles.compact : ''}>
              <WorkQueue groups={groups} />
            </div>
          )}
        </Panel>

        <div className={styles.railCol}>
          <ReadinessRail data={data} />
        </div>
      </div>
    </AppShell>
  );
}

function FilterPopover(props: {
  priorities: Set<Priority>;
  types: Set<WorkflowType>;
  onTogglePriority: (p: Priority) => void;
  onToggleType: (t: WorkflowType) => void;
  onClear: () => void;
  activeCount: number;
  compactTrigger?: boolean;
}) {
  return (
    <Popover
      label="Filter work items"
      trigger={({ toggle, ref, open }) => (
        <button ref={ref} className={styles.controlBtn} onClick={toggle} aria-expanded={open}>
          <SlidersHorizontal width={16} height={16} /> Filter
          {props.activeCount > 0 && <span className={styles.filterCount}>{props.activeCount}</span>}
        </button>
      )}
    >
      {() => (
        <div className={styles.filterPanel}>
          <p className={styles.menuLabel}>Priority</p>
          {PRIORITIES.map((p) => (
            <label key={p} className={styles.check}>
              <input type="checkbox" checked={props.priorities.has(p)} onChange={() => props.onTogglePriority(p)} />
              {p}
            </label>
          ))}
          <p className={styles.menuLabel}>Workflow type</p>
          {TYPES.map((t) => (
            <label key={t} className={styles.check}>
              <input type="checkbox" checked={props.types.has(t)} onChange={() => props.onToggleType(t)} />
              {t}
            </label>
          ))}
          <button className={styles.clearBtn} onClick={props.onClear}>Clear filters</button>
        </div>
      )}
    </Popover>
  );
}

function QueueSkeleton() {
  return (
    <div className={styles.skeleton} role="status" aria-live="polite">
      <div aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.skelRow}>
            <div className={styles.skelBarLg} />
            <div className={styles.skelBarSm} />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading priority work.</span>
    </div>
  );
}

function getPrimaryAction(role: string | null) {
  switch (role) {
    case 'dls-drafter':
      return { label: 'New legislative instruction', to: '/legislative/new', icon: <Plus width={18} height={18} /> };
    case 'dls-reviewer':
      return { label: 'Open legal review', to: '/legislative/NA-BILL-2026-015/review', icon: <ClipboardCheck width={18} height={18} /> };
    case 'dlps-officer':
      return { label: 'Open Bill workflow', to: '/legislative/NA-BILL-2026-015/workflow', icon: <ListChecks width={18} height={18} /> };
    case 'clerk':
      return { label: 'Open publication centre', to: '/legislative/NA-BILL-2026-015/publish', icon: <ShieldCheck width={18} height={18} /> };
    case 'records-officer':
      return { label: 'Open verification queue', to: '/archive/ocr', icon: <ScanLine width={18} height={18} /> };
    case 'ict-admin':
      return { label: 'Open workflow catalogue', to: '/workflows', icon: <Workflow width={18} height={18} /> };
    default:
      return { label: 'Open My Work', to: '/work', icon: <ListChecks width={18} height={18} /> };
  }
}

function getSecondaryActions(role: string | null) {
  const actions = [{ label: 'Search legislative records', to: '/search' }];
  if (role === 'dls-reviewer' || role === 'dlps-officer' || role === 'ict-admin') {
    actions.unshift({ label: 'New legislative instruction', to: '/legislative/new' });
  }
  if (role === 'records-officer') {
    actions.unshift({ label: 'Import historical document', to: '/documents/import' });
  }
  return actions;
}
