import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HelpCircle, PanelLeftClose, PanelLeftOpen, Circle, Pin, FileText, Clock } from 'lucide-react';
import { navGroups } from './navConfig';
import { LogoMark } from './LogoMark';
import { Avatar } from '@/components/ui';
import { dirAbbrev } from '@/lib/format';
import { useDemoStore } from '@/store/demoStore';
import type { Persona } from '@/data/types';
import styles from './Sidebar.module.css';

interface Props {
  collapsed: boolean;
  onToggleCollapse: () => void;
  unreadCount: number;
  persona: Persona;
}

function isActive(to: string, pathname: string, search: string): boolean {
  const [path, query] = to.split('?');
  if (pathname !== path) return false;
  if (!query) return search === '' || search === '?';
  const want = new URLSearchParams(query);
  const have = new URLSearchParams(search);
  for (const [k, v] of want) if (have.get(k) !== v) return false;
  return true;
}

export function Sidebar({ collapsed, onToggleCollapse, unreadCount, persona }: Props) {
  const { pathname, search } = useLocation();
  const records = useDemoStore((s) => s.records);
  const pinned = useDemoStore((s) => s.pinned);
  const recentlyOpened = useDemoStore((s) => s.recentlyOpened);
  const byId = useMemo(() => Object.fromEntries(records.map((r) => [r.id, r])), [records]);

  return (
    <nav className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`} aria-label="Primary">
      <div className={styles.brand}>
        <Link to="/dashboard" className={styles.brandLink} aria-label="LIMS home">
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
        {navGroups.map((group) => (
          <div key={group.label} className={styles.group}>
            {!collapsed && <p className={styles.groupLabel}>{group.label}</p>}
            <ul>
              {group.items.map((item) => {
                const active = isActive(item.to, pathname, search);
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

        {!collapsed && pinned.length > 0 && (
          <div className={styles.group}>
            <p className={styles.groupLabel}><Pin width={12} height={12} /> Pinned Work</p>
            <ul>
              {pinned.map((id) => byId[id] && (
                <li key={id}>
                  <Link to={`/legislative/${id}`} className={styles.recordItem} title={byId[id].title}>
                    <FileText width={15} height={15} className={styles.recordIcon} />
                    <span className={styles.recordLabel}>{byId[id].shortTitle}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/work?view=list" className={styles.viewAll}>View all pinned</Link>
          </div>
        )}

        {!collapsed && recentlyOpened.length > 0 && (
          <div className={styles.group}>
            <p className={styles.groupLabel}><Clock width={12} height={12} /> Recently Opened</p>
            <ul>
              {recentlyOpened.map((id) => byId[id] && (
                <li key={id}>
                  <Link to={`/legislative/${id}`} className={styles.recordItem} title={byId[id].title}>
                    <FileText width={15} height={15} className={styles.recordIcon} />
                    <span className={styles.recordLabel}>{byId[id].shortTitle}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={styles.bottom}>
        <Link to="/help" className={styles.item} title={collapsed ? 'Help & training' : undefined}>
          <span className={styles.itemIcon} aria-hidden><HelpCircle width={18} height={18} strokeWidth={1.9} /></span>
          {!collapsed && <span className={styles.itemLabel}>Help &amp; training</span>}
        </Link>
        <div className={styles.status} title={collapsed ? 'System status: All services operational' : undefined}>
          <span className={styles.itemIcon} aria-hidden><Circle width={10} height={10} fill="#39B37A" stroke="none" /></span>
          {!collapsed && (
            <span className={styles.statusText}>
              System status
              <span className={styles.statusOk}>All services operational</span>
            </span>
          )}
        </div>

        <div className={styles.profile}>
          <Avatar initials={persona.initials} name={persona.name} size={collapsed ? 32 : 34} />
          {!collapsed && (
            <span className={styles.profileText}>
              <span className={styles.profileName}>{persona.name}</span>
              <span className={styles.profileRole}>
                {persona.roleTitle}{dirAbbrev(persona.directorate) && ` · ${dirAbbrev(persona.directorate)}`}
              </span>
            </span>
          )}
        </div>

        <button className={styles.collapseBtn} onClick={onToggleCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <PanelLeftOpen width={18} height={18} /> : <PanelLeftClose width={18} height={18} />}
        </button>
      </div>
    </nav>
  );
}
