import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, ClipboardCheck, ListChecks, ScanLine, Workflow, ShieldCheck, MoreHorizontal,
} from 'lucide-react';
import { AppShell } from '@/components/shell';
import { Button, SegmentedControl, Popover } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import { allPersonas } from '@/data/personas';
import { getCommandCentre } from '@/data/commandCentre';
import type { QueueGroup } from '@/data/commandCentre';
import { greeting } from '@/lib/format';
import { ImmediateActions } from './ImmediateActions';
import { SummaryCards } from './SummaryCards';
import { ReadinessRail } from './ReadinessRail';
import { CommandOverview } from './CommandOverview';
import styles from './CommandCentre.module.css';

const VIEW_OPTIONS = [
  { value: 'my-work', label: 'My Work' },
  { value: 'directorate', label: 'Directorate Work' },
];

export function CommandCentre() {
  const role = useDemoStore((s) => s.currentRole);
  const persona = allPersonas.find((p) => p.id === role) ?? allPersonas[0];
  const data = useMemo(() => getCommandCentre(role), [role]);

  const [view, setView] = useState('my-work');

  const firstName = persona.name === 'Office of the Clerk' ? 'Clerk' : persona.name.split(' ')[0];
  const primaryAction = getPrimaryAction(role);
  const secondaryActions = getSecondaryActions(role);

  const baseGroups = useMemo<QueueGroup[]>(() => {
    if (view === 'directorate') return [...(data.directorateExtra ?? []), ...data.groups];
    return data.groups;
  }, [view, data]);

  return (
    <AppShell breadcrumb={[{ label: 'Command Centre' }]}>
      <div className={styles.intro}>
        <div>
          <p className={styles.welcome}>{greeting()}, {firstName}</p>
          <h1 className={styles.greeting}>Command Centre</h1>
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

      <div className={styles.layout}>
        <div className={styles.mainCol}>
          <SummaryCards cards={data.summaryCards.filter((card) => !card.repeatsQueue)} />
          <CommandOverview data={data} />
          <ImmediateActions groups={baseGroups} />
        </div>

        <div className={styles.railCol}>
          <ReadinessRail data={data} />
        </div>
      </div>
    </AppShell>
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
