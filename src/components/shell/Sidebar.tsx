import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { navGroups } from './navConfig';
import { LogoMark } from './LogoMark';
import type { Persona } from '@/data/types';
import styles from './Sidebar.module.css';

interface Props {
  collapsed: boolean;
  onToggleCollapse: () => void;
  unreadCount: number;
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

export function Sidebar({ collapsed, onToggleCollapse, unreadCount, persona }: Props) {
  const { pathname, search } = useLocation();
  const visibleGroups = useMemo(() => navGroups
    .filter((group) => !group.roles || group.roles.includes(persona.id))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || item.roles.includes(persona.id)),
    }))
    .filter((group) => group.items.length > 0), [persona.id]);

  const allTos = useMemo(() => visibleGroups.flatMap((g) => g.items.map((i) => i.to)), [visibleGroups]);
  // If any item matches the URL exactly, only exact items highlight; otherwise
  // fall back to the longest path prefix so section roots stay active.
  const hasExact = visibleGroups.some((g) => g.items.some((i) => isExact(i.to, pathname, search)));
  const prefixTo = hasExact ? null : bestPrefix(pathname, allTos);

  return (
    <nav className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`} aria-label="Primary">
      <div className={styles.brand}>
        <Link to="/dashboard" className={styles.brandLink} aria-label="LIMS, National Assembly of Kenya, home">
          <LogoMark size={collapsed ? 36 : 40} />
          {!collapsed && <span className={styles.brandDivider} aria-hidden />}
          {!collapsed && (
            <span className={styles.brandText}>
              <span className={styles.brandName}>LIMS</span>
              <span className={styles.brandOrg}>National Assembly of Kenya</span>
            </span>
          )}
        </Link>
      </div>

      <div className={styles.scroll}>
        {visibleGroups.map((group) => (
          <div key={group.label} className={styles.group}>
            {!collapsed && <p className={styles.groupLabel}>{group.label}</p>}
            <ul>
              {group.items.map((item) => {
                const active = isExact(item.to, pathname, search) || item.to === prefixTo;
                const showBadge = item.badgeKey === 'notifications' && unreadCount > 0;
                return (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className={`${styles.item} ${active ? styles.active : ''}`}
                      aria-current={active ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className={styles.itemIcon} aria-hidden>{item.icon}</span>
                      {!collapsed && <span className={styles.itemLabel}>{item.label}</span>}
                      {showBadge && (
                        <span className={collapsed ? styles.dotBadge : styles.countBadge}>
                          {collapsed ? '' : unreadCount}
                          <span className="sr-only">{unreadCount} unread</span>
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

      </div>

      <div className={styles.bottom}>
        <button className={styles.collapseBtn} onClick={onToggleCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <PanelLeftOpen width={18} height={18} /> : <PanelLeftClose width={18} height={18} />}
        </button>
      </div>
    </nav>
  );
}
