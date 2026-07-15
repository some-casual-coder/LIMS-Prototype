import type { ReactNode } from 'react';
import { Scale, User as UserIcon, Building2, CalendarClock, Plus, ChevronRight } from 'lucide-react';
import { Button, StatusBadge, Popover } from '@/components/ui';
import { officers } from '@/data/personas';
import type { LegislativeRecord, RoleId } from '@/data/types';
import { taskStatusTone, reqStatusTone, type BillTaskStatus, type ReqStatus } from '@/data/billTasks';
import styles from './BillTasksControl.module.css';

export const officerName = (id?: string) =>
  id === 'system' ? 'System' : officers.find((o) => o.id === id)?.name ?? '—';
export const officerRole = (id?: string) =>
  id === 'system' ? 'Automated' : officers.find((o) => o.id === id)?.roleTitle ?? '';
export const officerInitials = (id?: string) =>
  id === 'system' ? 'SY' : officers.find((o) => o.id === id)?.initials ?? '—';

export function myRoleLabel(role: RoleId | null): string {
  switch (role) {
    case 'dls-drafter': return 'Drafter';
    case 'dls-reviewer': return 'Legal Reviewer';
    case 'dlps-officer': return 'Procedural Reviewer';
    case 'clerk': return 'Clerk';
    default: return 'Observer';
  }
}

export function TaskStatusPill({ status }: { status: BillTaskStatus }) {
  return <StatusBadge tone={taskStatusTone[status]} size="sm">{status}</StatusBadge>;
}
export function ReqStatusPill({ status }: { status: ReqStatus }) {
  return <StatusBadge tone={reqStatusTone[status]} size="sm">{status}</StatusBadge>;
}

// Shared record-identity header used by the Tasks and Workflow pages.
export function BillControlHeader({ record, roleId, stageName, stageOwner, stageDue, addTask, moreMenu }: {
  record: LegislativeRecord;
  roleId: RoleId | null;
  stageName: string;
  stageOwner: string;
  stageDue: string;
  addTask?: () => void;
  moreMenu?: ReactNode;
}) {
  return (
    <div className={styles.header}>
      <div className={styles.headerTop}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{record.title}</h1>
            <StatusBadge tone="green" icon={<Scale width={12} height={12} />}>{stageName}</StatusBadge>
          </div>
          <p className={styles.subMeta}>
            Reference: <strong>{record.reference}</strong> · Bill Type: {record.workflowType} · Sponsor: {record.sponsor ?? 'Departmental Committee'}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Popover
            align="right"
            label="More actions"
            trigger={({ toggle, ref, open }) => (
              <button ref={ref} className={styles.moreBtn} onClick={toggle} aria-expanded={open}>
                More actions <ChevronRight width={15} height={15} className={styles.moreChevron} />
              </button>
            )}
          >
            {(close) => <div className={styles.menu} onClick={close}>{moreMenu ?? <span className={styles.menuNote}>No additional actions.</span>}</div>}
          </Popover>
          {addTask && <Button variant="primary" leftIcon={<Plus width={16} height={16} />} onClick={addTask}>Add Task</Button>}
        </div>
      </div>

      <div className={styles.contextTiles}>
        <ContextTile icon={<Scale width={17} height={17} />} label="Current Stage" value={stageName} />
        <ContextTile icon={<Building2 width={17} height={17} />} label="Stage Owner" value={stageOwner} />
        <ContextTile icon={<UserIcon width={17} height={17} />} label="My Role" value={myRoleLabel(roleId)} />
        <ContextTile icon={<CalendarClock width={17} height={17} />} label="Due for This Stage" value={stageDue} />
      </div>
    </div>
  );
}

function ContextTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className={styles.contextTile}>
      <span className={styles.contextIcon} aria-hidden>{icon}</span>
      <div>
        <div className={styles.contextLabel}>{label}</div>
        <div className={styles.contextValue}>{value}</div>
      </div>
    </div>
  );
}
