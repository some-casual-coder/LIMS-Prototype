import type { WorkItem } from '@/data/myWork';
import { WORK_STATES, workItemMatchesStatus } from '@/data/myWork';
import type { Tone } from '@/components/ui/tone';
import { priorityTone } from '@/components/ui/tone';

export interface Filters {
  workStates: Set<string>;
  types: Set<string>;
  stages: Set<string>;
  roles: Set<string>;
  priorities: Set<string>;
  due: string; // '', 'overdue', 'today', '48-hours', 'this-week'
  directorates: Set<string>;
  classifications: Set<string>;
}

export function emptyFilters(): Filters {
  return {
    workStates: new Set(), types: new Set(), stages: new Set(), roles: new Set(),
    priorities: new Set(), due: '', directorates: new Set(), classifications: new Set(),
  };
}

export function filterCount(f: Filters): number {
  return f.workStates.size + f.types.size + f.stages.size + f.roles.size +
    f.priorities.size + f.directorates.size + f.classifications.size + (f.due ? 1 : 0);
}

// Status shortcut (from indicators / saved views). Delegates to the shared
// matcher in data/myWork so the filtered list always agrees with the counts.
const matchStatus = workItemMatchesStatus;

export function applyFilters(
  items: WorkItem[],
  opts: { search: string; status: string; filters: Filters },
): WorkItem[] {
  const q = opts.search.trim().toLowerCase();
  const f = opts.filters;
  return items.filter((it) => {
    if (!matchStatus(it, opts.status)) return false;
    if (q && !`${it.title} ${it.reference} ${it.requiredAction} ${it.myRole} ${it.stage} ${it.type}`.toLowerCase().includes(q)) return false;
    if (f.workStates.size && !f.workStates.has(it.workState)) return false;
    if (f.types.size && !f.types.has(it.type)) return false;
    if (f.stages.size && !f.stages.has(it.stage)) return false;
    if (f.roles.size && !f.roles.has(it.myRole)) return false;
    if (f.priorities.size && !f.priorities.has(it.priority)) return false;
    if (f.directorates.size && !f.directorates.has(it.directorate)) return false;
    if (f.classifications.size && !f.classifications.has(it.confidentiality)) return false;
    if (f.due === 'overdue' && !it.overdue) return false;
    if (f.due === '48-hours' && !it.dueUrgent) return false;
    if (f.due === 'this-week' && !it.dueThisWeek) return false;
    return true;
  });
}

const PRIORITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

export function sortItems(items: WorkItem[], sort: string): WorkItem[] {
  const arr = [...items];
  switch (sort) {
    case 'priority':
      return arr.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    case 'title':
      return arr.sort((a, b) => a.title.localeCompare(b.title));
    case 'stage':
      return arr.sort((a, b) => a.stage.localeCompare(b.stage));
    default: // urgency-due
      return arr.sort((a, b) => (b.dueUrgent ? 1 : 0) - (a.dueUrgent ? 1 : 0));
  }
}

export interface Group {
  key: string;
  title: string;
  tone: Tone;
  items: WorkItem[];
  defaultCollapsed?: boolean;
}

export function groupItems(items: WorkItem[], groupBy: string): Group[] {
  if (groupBy === 'none') {
    return [{ key: 'all', title: 'All items', tone: 'grey', items }];
  }
  if (groupBy === 'priority') {
    return (['High', 'Medium', 'Low'] as const).map((p) => ({
      key: p, title: `${p} priority`, tone: priorityTone[p],
      items: items.filter((i) => i.priority === p),
    })).filter((g) => g.items.length);
  }
  if (groupBy === 'type') {
    const types = [...new Set(items.map((i) => i.type))];
    return types.map((t) => ({ key: t, title: t, tone: 'grey' as Tone, items: items.filter((i) => i.type === t) }));
  }
  if (groupBy === 'stage') {
    const stages = [...new Set(items.map((i) => i.stage))];
    return stages.map((s) => ({ key: s, title: s, tone: (items.find((i) => i.stage === s)?.stageTone ?? 'grey'), items: items.filter((i) => i.stage === s) }));
  }
  // default: work-state, in canonical order
  return WORK_STATES.map((ws) => ({
    key: ws.id,
    title: ws.listTitle,
    tone: ws.tone,
    defaultCollapsed: ws.defaultCollapsed,
    items: items.filter((i) => i.workState === ws.id),
  })).filter((g) => g.items.length);
}

export function boardColumns(items: WorkItem[]) {
  return WORK_STATES.map((ws) => ({
    meta: ws,
    items: items.filter((i) => i.workState === ws.id),
  }));
}
