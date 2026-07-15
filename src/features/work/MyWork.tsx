import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus, Download, MoreVertical, Bookmark, ChevronDown, SlidersHorizontal, Group as GroupIcon,
  ArrowUpDown, Columns3, ListChecks, Kanban, CalendarDays, Search as SearchIcon,
  UserPlus, BellPlus, Flag, BookmarkPlus, FileDown, X,
} from 'lucide-react';
import { AppShell } from '@/components/shell';
import { Button, Popover } from '@/components/ui';
import { workItems, savedViews, moreSavedViews } from '@/data/myWork';
import { WorkIndicators } from './WorkIndicators';
import { WorkList } from './WorkList';
import { BoardView } from './BoardView';
import { CalendarView } from './CalendarView';
import { QuickViewSheet } from './sheets/QuickViewSheet';
import { FilterSheet } from './sheets/FilterSheet';
import { SaveViewSheet } from './sheets/SaveViewSheet';
import { ColumnsSheet } from './sheets/ColumnsSheet';
import { ReminderSheet } from './sheets/ReminderSheet';
import { AssignmentSheet } from './sheets/AssignmentSheet';
import { TransitionSheet, type PendingTransition } from './sheets/TransitionSheet';
import { applyFilters, sortItems, groupItems, emptyFilters, filterCount, type Filters } from './logic';
import styles from './MyWork.module.css';

const GROUP_OPTIONS = [
  { id: 'work-state', label: 'Work state' },
  { id: 'stage', label: 'Legislative stage' },
  { id: 'type', label: 'Workflow type' },
  { id: 'priority', label: 'Priority' },
  { id: 'none', label: 'No grouping' },
];
const SORT_OPTIONS = [
  { id: 'urgency', label: 'Urgency and due date' },
  { id: 'priority', label: 'Priority' },
  { id: 'title', label: 'Title' },
  { id: 'stage', label: 'Legislative stage' },
];

export function MyWork() {
  const [params, setParams] = useSearchParams();
  const view = (params.get('view') as 'list' | 'board' | 'calendar') || 'list';
  const quickItemId = params.get('item') || '';
  const sheet = params.get('sheet') || '';

  const [status, setStatus] = useState(params.get('status') || 'all');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>(emptyFilters());
  const [groupBy, setGroupBy] = useState('work-state');
  const [sort, setSort] = useState('urgency');
  const [compact, setCompact] = useState(false);
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ completed: true });
  const [pending, setPending] = useState<PendingTransition | null>(null);

  const setView = (v: string) => setParams((p) => { p.set('view', v); p.delete('item'); return p; }, { replace: true });
  const openSheet = (s: string) => setParams((p) => { p.set('sheet', s); return p; });
  const closeSheet = () => setParams((p) => { p.delete('sheet'); return p; }, { replace: true });
  const openItem = (id: string) => setParams((p) => { p.set('item', id); return p; });
  const closeItem = () => setParams((p) => { p.delete('item'); return p; }, { replace: true });

  const filtered = useMemo(() => sortItems(applyFilters(workItems, { search, status, filters }), sort), [search, status, filters, sort]);
  const groups = useMemo(() => groupItems(filtered, groupBy), [filtered, groupBy]);
  const activeFilters = filterCount(filters);
  const quickItem = workItems.find((i) => i.recordId === quickItemId) || null;

  function toggleSelect(id: string) {
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleSelectGroup(ids: string[], select: boolean) {
    setSelected((s) => { const n = new Set(s); ids.forEach((id) => (select ? n.add(id) : n.delete(id))); return n; });
  }
  function toggleGroup(key: string) {
    setCollapsed((c) => ({ ...c, [key]: !(c[key] ?? key === 'completed') }));
  }

  const savedViewActive = (id: string) => (id === 'all' ? status === 'all' : status === id);

  return (
    <AppShell breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'My Work' }]}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Work</h1>
          <p className={styles.supporting}>Manage legislative items assigned to you, awaiting your review or involving your directorate.</p>
          <p className={styles.context}>Grace Wanjiku · Senior Legal Counsel · Directorate of Legal Services</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" size="lg" leftIcon={<Download width={16} height={16} />}>Export Worklist</Button>
          <Button variant="primary" size="lg" to="/legislative/new" leftIcon={<Plus width={18} height={18} />}>New Legislative Instruction</Button>
          <Popover label="More actions" trigger={({ toggle, ref }) => (
            <button ref={ref} className={styles.moreBtn} onClick={toggle} aria-label="More actions"><MoreVertical width={18} height={18} /></button>
          )}>
            {(close) => (
              <div className={styles.menu} onClick={close}>
                <Link to="/documents/import" className={styles.menuItem}>Import historical document</Link>
                <button className={styles.menuItem} onClick={() => openSheet('save-view')}>Manage saved views</button>
                <button className={styles.menuItem} onClick={() => { setFilters(emptyFilters()); setSearch(''); setStatus('all'); }}>Reset filters</button>
              </div>
            )}
          </Popover>
        </div>
      </div>

      {/* Workload indicators */}
      <WorkIndicators activeStatus={status} onSelect={(f) => setStatus((s) => (s === f ? 'all' : f))} />

      {/* Saved views strip */}
      <div className={styles.savedViews}>
        <div className={styles.savedChips}>
          {savedViews.map((v) => (
            <button key={v.id} className={`${styles.chip} ${savedViewActive(v.id) ? styles.chipActive : ''}`} onClick={() => setStatus(v.id === 'all' ? 'all' : v.id)}>
              {v.label}{v.count != null && <span className={styles.chipCount}>{v.count}</span>}
            </button>
          ))}
          <Popover label="More views" trigger={({ toggle, ref }) => (
            <button ref={ref} className={styles.chip} onClick={toggle}>More views <ChevronDown width={13} height={13} /></button>
          )}>
            {(close) => (
              <div className={styles.menu} onClick={close}>
                <p className={styles.menuLabel}>Saved views</p>
                {moreSavedViews.map((v) => (
                  <button key={v.id} className={styles.menuItem} onClick={() => setStatus('all')}><Bookmark width={14} height={14} /> {v.label}</button>
                ))}
              </div>
            )}
          </Popover>
        </div>
        <button className={styles.saveCurrent} onClick={() => openSheet('save-view')}><Plus width={14} height={14} /> Save current view</button>
      </div>

      {/* View switcher + control bar */}
      <div className={styles.controlBar}>
        <div className={styles.viewSwitch} role="tablist" aria-label="View">
          <button role="tab" aria-selected={view === 'list'} className={`${styles.viewTab} ${view === 'list' ? styles.viewTabActive : ''}`} onClick={() => setView('list')}><ListChecks width={16} height={16} /> List View</button>
          <button role="tab" aria-selected={view === 'board'} className={`${styles.viewTab} ${view === 'board' ? styles.viewTabActive : ''}`} onClick={() => setView('board')}><Kanban width={16} height={16} /> Board View</button>
          <button role="tab" aria-selected={view === 'calendar'} className={`${styles.viewTab} ${view === 'calendar' ? styles.viewTabActive : ''}`} onClick={() => setView('calendar')}><CalendarDays width={16} height={16} /> Calendar View</button>
        </div>
        <div className={styles.controlsRight}>
          <label className={styles.search}>
            <SearchIcon width={15} height={15} aria-hidden />
            <input name="mywork-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search my legislative work" aria-label="Search my legislative work" />
          </label>
          <button className={styles.control} onClick={() => openSheet('filters')}>
            <SlidersHorizontal width={16} height={16} /> Filter{activeFilters > 0 && <span className={styles.ctlCount}>{activeFilters}</span>}
          </button>
          <Popover label="Group by" trigger={({ toggle, ref }) => (
            <button ref={ref} className={styles.control} onClick={toggle}><GroupIcon width={16} height={16} /> Group by</button>
          )}>
            {(close) => (
              <div className={styles.menu} onClick={close}>
                {GROUP_OPTIONS.map((o) => (
                  <button key={o.id} className={`${styles.menuItem} ${groupBy === o.id ? styles.menuItemActive : ''}`} onClick={() => setGroupBy(o.id)}>{o.label}</button>
                ))}
              </div>
            )}
          </Popover>
          <Popover label="Sort" trigger={({ toggle, ref }) => (
            <button ref={ref} className={styles.control} onClick={toggle}><ArrowUpDown width={16} height={16} /> Sort</button>
          )}>
            {(close) => (
              <div className={styles.menu} onClick={close}>
                {SORT_OPTIONS.map((o) => (
                  <button key={o.id} className={`${styles.menuItem} ${sort === o.id ? styles.menuItemActive : ''}`} onClick={() => setSort(o.id)}>{o.label}</button>
                ))}
              </div>
            )}
          </Popover>
          <button className={styles.control} onClick={() => openSheet('columns')} disabled={view !== 'list'} title={view !== 'list' ? 'Columns are available in List View' : undefined}>
            <Columns3 width={16} height={16} /> Columns
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div className={styles.workspace}>
        {view === 'list' && (
          filtered.length === 0 ? (
            <EmptyState onClear={() => { setFilters(emptyFilters()); setSearch(''); setStatus('all'); }} search={search} />
          ) : (
            <div className={styles.listPanel}>
              <WorkList
                groups={groups}
                collapsed={collapsed}
                onToggleGroup={toggleGroup}
                selected={selected}
                onToggleSelect={toggleSelect}
                onToggleSelectGroup={toggleSelectGroup}
                onOpenItem={openItem}
                compact={compact}
                hidden={hiddenCols}
              />
            </div>
          )
        )}
        {view === 'board' && <BoardView items={filtered} onOpenItem={openItem} onTransition={setPending} />}
        {view === 'calendar' && <CalendarView onOpenItem={openItem} />}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className={styles.bulkBar} role="region" aria-label="Bulk actions">
          <span className={styles.bulkCount}>{selected.size} item{selected.size > 1 ? 's' : ''} selected</span>
          <button className={styles.bulkClear} onClick={() => setSelected(new Set())}>Clear selection</button>
          <span className={styles.bulkDivider} />
          <button className={styles.bulkAction} onClick={() => openSheet('assignment')}><UserPlus width={15} height={15} /> Assign</button>
          <button className={styles.bulkAction} onClick={() => openSheet('reminder')}><BellPlus width={15} height={15} /> Add reminder</button>
          <Popover label="Change priority" align="left" trigger={({ toggle, ref }) => (
            <button ref={ref} className={styles.bulkAction} onClick={toggle}><Flag width={15} height={15} /> Change priority <ChevronDown width={13} height={13} /></button>
          )}>
            {(close) => (
              <div className={styles.menu} onClick={close}>
                {['High', 'Medium', 'Low'].map((p) => (
                  <button key={p} className={styles.menuItem} onClick={() => setSelected(new Set())}>Set to {p}</button>
                ))}
              </div>
            )}
          </Popover>
          <button className={styles.bulkAction} onClick={() => openSheet('save-view')}><BookmarkPlus width={15} height={15} /> Add to saved view</button>
          <button className={styles.bulkAction} onClick={() => setSelected(new Set())}><FileDown width={15} height={15} /> Export selected</button>
          <button className={styles.bulkClose} onClick={() => setSelected(new Set())} aria-label="Dismiss"><X width={16} height={16} /></button>
        </div>
      )}

      {/* Side sheets */}
      <QuickViewSheet item={quickItem} open={!!quickItem} onClose={closeItem} />
      <FilterSheet open={sheet === 'filters'} onClose={closeSheet} filters={filters} onChange={setFilters} resultCount={filtered.length} />
      <SaveViewSheet open={sheet === 'save-view'} onClose={closeSheet} filters={filters} status={status} />
      <ColumnsSheet
        open={sheet === 'columns'}
        onClose={closeSheet}
        compact={compact}
        onToggleCompact={() => setCompact((c) => !c)}
        hidden={hiddenCols}
        onToggleColumn={(k) => setHiddenCols((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; })}
        onReset={() => { setHiddenCols(new Set()); setCompact(false); }}
      />
      <ReminderSheet open={sheet === 'reminder'} onClose={closeSheet} />
      <AssignmentSheet open={sheet === 'assignment'} onClose={closeSheet} />
      <TransitionSheet pending={pending} onClose={() => setPending(null)} />
    </AppShell>
  );
}

function EmptyState({ onClear, search }: { onClear: () => void; search: string }) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>{search ? `No records found for “${search}”` : 'No legislative work matches this view'}</p>
      <p className={styles.emptyBody}>{search ? 'Search by title, reference, clause or document type.' : 'Try removing a filter or opening All My Work.'}</p>
      <div className={styles.emptyActions}>
        <Button variant="secondary" onClick={onClear}>Clear filters</Button>
        <Button variant="primary" onClick={onClear}>View all work</Button>
      </div>
    </div>
  );
}
