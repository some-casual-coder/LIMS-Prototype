import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Upload, ChevronDown, Bookmark, SlidersHorizontal, RefreshCw, Search as SearchIcon,
  Settings2, ArrowRight, FileStack, Search as SearchIcon2,
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
import { RecentlyWorkedOn } from './RecentlyWorkedOn';
import styles from './CommandCentre.module.css';

const VIEW_OPTIONS = [
  { value: 'my-work', label: 'My Work' },
  { value: 'directorate', label: 'Directorate Work' },
  { value: 'readiness', label: 'Sitting & Publication Readiness' },
];

const SAVED_VIEWS = [
  { label: 'Awaiting my action', to: '/work?view=requires-action' },
  { label: 'Due within 48 hours', to: '/work?view=due-soon' },
  { label: 'Returned to me', to: '/work?view=returned' },
  { label: 'Confidential items', to: '/work?view=confidential' },
  { label: 'Publication queue', to: '/work?view=publication' },
];

const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];
const TYPES: WorkflowType[] = ['Bill', 'Motion', 'Petition', 'Statutory Instrument', 'Order Paper', 'Votes and Proceedings'];

const READINESS_STAGES = ['Procedural Review', 'Approval', 'Awaiting Signature', 'Awaiting Supporting Information'];

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

  const firstName = persona.name.split(' ')[0];
  const activeFilterCount = priorities.size + types.size;

  const baseGroups = useMemo<QueueGroup[]>(() => {
    if (view === 'directorate') return [...(data.directorateExtra ?? []), ...data.groups];
    if (view === 'readiness') {
      const rows = data.groups
        .flatMap((g) => g.rows)
        .filter((r) => READINESS_STAGES.includes(r.stage));
      return [{ id: 'readiness', title: 'Tracked for the next sitting', tone: 'gold', rows }];
    }
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
      {/* Page introduction */}
      <div className={styles.intro}>
        <div>
          <h1 className={styles.greeting}>{greeting()}, {firstName}</h1>
          <p className={styles.lede}>You have {data.attentionCount} legislative items requiring attention today.</p>
          <p className={styles.context}>{data.contextDate}</p>
        </div>
        <div className={styles.introActions}>
          <Button variant="primary" size="lg" to="/legislative/new" leftIcon={<Plus width={18} height={18} />}>
            New Legislative Instruction
          </Button>
          <Button variant="secondary" size="lg" to="/documents/import" leftIcon={<Upload width={17} height={17} />}>
            Import Historical Document
          </Button>
          <Popover
            label="More actions"
            trigger={({ toggle, ref }) => (
              <button ref={ref} className={styles.moreBtn} onClick={toggle} aria-label="More actions">
                <ChevronDown width={18} height={18} />
              </button>
            )}
          >
            {(close) => (
              <div className={styles.menu} onClick={close}>
                <Link to="/documents?view=templates" className={styles.menuItem}><FileStack width={16} height={16} /> Start from template</Link>
                <Link to="/search" className={styles.menuItem}><SearchIcon2 width={16} height={16} /> Search legislative records</Link>
              </div>
            )}
          </Popover>
        </div>
      </div>

      {/* View selector + controls */}
      <div className={styles.controls}>
        <SegmentedControl options={VIEW_OPTIONS} value={view} onChange={setView} ariaLabel="Dashboard view" />
        <div className={styles.controlsRight}>
          <Popover
            label="Saved views"
            trigger={({ toggle, ref, open }) => (
              <button ref={ref} className={styles.controlBtn} onClick={toggle} aria-expanded={open}>
                <Bookmark width={16} height={16} /> Saved view <ChevronDown width={14} height={14} />
              </button>
            )}
          >
            {(close) => (
              <div className={styles.menu} onClick={close}>
                <p className={styles.menuLabel}>Saved views</p>
                {SAVED_VIEWS.map((v) => (
                  <Link key={v.label} to={v.to} className={styles.menuItem}>{v.label}</Link>
                ))}
              </div>
            )}
          </Popover>

          <FilterPopover
            priorities={priorities} types={types}
            onTogglePriority={(p) => toggleSet(priorities, p, setPriorities)}
            onToggleType={(t) => toggleSet(types, t, setTypes)}
            onClear={() => { setPriorities(new Set()); setTypes(new Set()); }}
            activeCount={activeFilterCount}
          />

          <button className={styles.controlBtn} onClick={refresh} aria-label="Refresh queue">
            <RefreshCw width={16} height={16} className={loading ? styles.spin : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className={styles.cards}>
        <SummaryCards cards={data.summaryCards} />
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
                onClick={() => setCompact((c) => !c)}
                aria-pressed={compact}
                aria-label={compact ? 'Comfortable row spacing' : 'Compact row spacing'}
                title={compact ? 'Comfortable rows' : 'Compact rows'}
              >
                <Settings2 width={17} height={17} />
              </button>
            </div>
          }
        >
          <div className={styles.queueSubhead}>
            <p>Legislative items ordered by urgency, deadline and required action.</p>
            <Link to="/work" className={styles.viewAll}>View all work <ArrowRight width={14} height={14} /></Link>
          </div>
          {loading ? (
            <QueueSkeleton />
          ) : totalVisible === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No items match your filters</p>
              <p className={styles.emptyBody}>Adjust the search or filters to see legislative work.</p>
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

      {/* Recently worked on */}
      <div className={styles.recent}>
        <RecentlyWorkedOn items={data.recent} />
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
    <div className={styles.skeleton} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={styles.skelRow}>
          <div className={styles.skelBarLg} />
          <div className={styles.skelBarSm} />
        </div>
      ))}
      <span className="sr-only">Loading legislative work…</span>
    </div>
  );
}
