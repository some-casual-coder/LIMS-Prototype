import { useEffect, useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CircleHelp, Clock3, FileText, PanelLeftClose, PanelLeftOpen, Settings, X } from 'lucide-react';
import { navGroups } from './navConfig';
import { LogoMark } from './LogoMark';
import { useDemoStore } from '@/store/demoStore';
import type { Persona } from '@/data/types';
import styles from './Sidebar.module.css';

interface Props {
  collapsed: boolean;
  mobileOpen?: boolean;
  onCloseNavigation?: () => void;
  onToggleCollapse: () => void;
  persona: Persona;
}

function isExact(to: string, pathname: string, search: string): boolean {
  const [path, query] = to.split('?');
  if (pathname !== path) return false;
  if (!query) return search === '' || search === '?';
  const want = new URLSearchParams(query);
  const have = new URLSearchParams(search);
  for (const [k, v] of want) if (have.get(k) !== v) return false;
  return true;
}

// The path-only nav item that is the longest prefix of the current path — used
// to keep a section root (e.g. Repository) highlighted on its sub-routes when no
// item matches exactly.
function bestPrefix(pathname: string, tos: string[]): string | null {
  let best: string | null = null;
  for (const to of tos) {
    if (to.includes('?')) continue;
    if (pathname === to || pathname.startsWith(to + '/')) {
      if (!best || to.length > best.length) best = to;
    }
  }
  return best;
}

export function Sidebar({ collapsed, mobileOpen = false, onCloseNavigation, onToggleCollapse, persona }: Props) {
  const { pathname, search } = useLocation();
  const records = useDemoStore((state) => state.records);
  const recentlyOpened = useDemoStore((state) => state.recentlyOpened);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (mobileOpen) closeRef.current?.focus();
  }, [mobileOpen]);
  const visibleGroups = useMemo(() => navGroups
    .filter((group) => !group.roles || group.roles.includes(persona.id))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || item.roles.includes(persona.id)),
    }))
    .filter((group) => group.items.length > 0), [persona.id]);

  const allTos = useMemo(() => visibleGroups.flatMap((g) => g.items.map((i) => i.to)), [visibleGroups]);
  const recentRecords = useMemo(() => recentlyOpened
    .map((id) => records.find((record) => record.id === id))
    .filter((record): record is NonNullable<typeof record> => Boolean(record))
    .slice(0, 3), [recentlyOpened, records]);
  // If any item matches the URL exactly, only exact items highlight; otherwise
  // fall back to the longest path prefix so section roots stay active.
  const hasExact = visibleGroups.some((g) => g.items.some((i) => isExact(i.to, pathname, search)));
  const prefixTo = hasExact ? null : bestPrefix(pathname, allTos);

  return (
    <nav className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`} aria-label="Primary">
      <div className={styles.brand}>
        <Link to="/dashboard" className={styles.brandLink} aria-label="LIMS, National Assembly of Kenya, home" onClick={onCloseNavigation}>
          <LogoMark size={collapsed ? 36 : 40} framed />
          {!collapsed && <span className={styles.brandDivider} aria-hidden />}
          {!collapsed && (
            <span className={styles.brandText}>
              <span className={styles.brandName}>LIMS</span>
              <span className={styles.brandOrg}>National Assembly of Kenya</span>
            </span>
          )}
        </Link>
        <button ref={closeRef} className={styles.mobileClose} onClick={onCloseNavigation} aria-label="Close navigation">
          <X width={20} height={20} />
        </button>
      </div>

      <div className={styles.scroll}>
        {visibleGroups.map((group) => (
          <div key={group.label} className={styles.group}>
            {!collapsed && <p className={styles.groupLabel}>{group.label}</p>}
            <ul>
              {group.items.map((item) => {
                const active = isExact(item.to, pathname, search) || item.to === prefixTo;
                return (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      onClick={onCloseNavigation}
                      className={`${styles.item} ${active ? styles.active : ''}`}
                      aria-current={active ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className={styles.itemIcon} aria-hidden>{item.icon}</span>
                      {!collapsed && <span className={styles.itemLabel}>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {!collapsed && recentRecords.length > 0 && (
          <div className={`${styles.group} ${styles.recentGroup}`}>
            <p className={styles.groupLabel}><Clock3 width={12} height={12} aria-hidden /> Recently viewed</p>
            <ul>
              {recentRecords.map((record) => (
                <li key={record.id}>
                  <Link
                    to={record.workflowType === 'Bill' ? `/legislative/${record.id}/draft` : `/legislative/${record.id}`}
                    className={styles.recordItem}
                    title={record.title}
                    onClick={onCloseNavigation}
                  >
                    <FileText width={15} height={15} className={styles.recordIcon} aria-hidden />
                    <span className={styles.recordLabel}>{record.shortTitle}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>

      <div className={styles.bottom}>
        <Link to="/help" className={styles.utilityItem} onClick={onCloseNavigation} title={collapsed ? 'Help and training' : undefined}>
          <CircleHelp width={18} height={18} aria-hidden />
          {!collapsed && <span>Help and training</span>}
        </Link>
        {(persona.id === 'clerk' || persona.id === 'ict-admin') && (
          <Link to="/workflows" className={styles.utilityItem} onClick={onCloseNavigation} title={collapsed ? 'Workflow settings' : undefined}>
            <Settings width={18} height={18} aria-hidden />
            {!collapsed && <span>Workflow settings</span>}
          </Link>
        )}
        <button className={styles.collapseBtn} onClick={onToggleCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <PanelLeftOpen width={18} height={18} /> : <PanelLeftClose width={18} height={18} />}
        </button>
      </div>
    </nav>
  );
}
