import { useState, useRef, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Bell, HelpCircle, ShieldCheck, WifiOff, ChevronDown, LogOut } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { Avatar, IconButton } from '@/components/ui';
import { dirAbbrev } from '@/lib/format';
import { useDemoStore } from '@/store/demoStore';
import type { Persona } from '@/data/types';
import styles from './TopHeader.module.css';

export interface Crumb {
  label: string;
  to?: string;
}

interface Props {
  breadcrumb: Crumb[];
  persona: Persona;
  unreadCount: number;
}

export function TopHeader({ breadcrumb, persona, unreadCount }: Props) {
  const navigate = useNavigate();
  const offline = useDemoStore((s) => s.offline);
  const setRole = useDemoStore((s) => s.setRole);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function signOut() {
    setRole(null);
    navigate('/login');
  }

  return (
    <header className={styles.header}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <ol>
          {breadcrumb.map((c, i) => (
            <Fragment key={c.label}>
              <li>
                {c.to && i < breadcrumb.length - 1 ? (
                  <Link to={c.to} className={styles.crumbLink}>{c.label}</Link>
                ) : (
                  <span className={styles.crumbCurrent} aria-current="page">{c.label}</span>
                )}
              </li>
              {i < breadcrumb.length - 1 && (
                <li aria-hidden className={styles.sep}><ChevronRight width={14} height={14} /></li>
              )}
            </Fragment>
          ))}
        </ol>
      </nav>

      <GlobalSearch />

      <div className={styles.right}>
        <span className={`${styles.ai} ${offline ? styles.aiOffline : ''}`} title={offline ? 'Secure external AI is unavailable. Local assistance is active.' : 'Secure AI assistant is available'}>
          {offline ? <WifiOff width={15} height={15} aria-hidden /> : <ShieldCheck width={15} height={15} aria-hidden />}
          <span>{offline ? 'Local AI active' : 'Secure AI available'}</span>
        </span>

        <IconButton label={`Notifications, ${unreadCount} unread`} badge={unreadCount} onClick={() => navigate('/notifications')}>
          <Bell />
        </IconButton>
        <IconButton label="Help and training" onClick={() => navigate('/help')}>
          <HelpCircle />
        </IconButton>

        <div className={styles.profileWrap} ref={menuRef}>
          <button className={styles.profile} onClick={() => setMenuOpen((o) => !o)} aria-haspopup="menu" aria-expanded={menuOpen}>
            <Avatar initials={persona.initials} size={34} decorative />
            <span className={styles.profileText}>
              <span className={styles.profileName}>{persona.name}</span>
              <span className={styles.profileRole}>
                {persona.roleTitle}{dirAbbrev(persona.directorate) && ` · ${dirAbbrev(persona.directorate)}`}
              </span>
            </span>
            <ChevronDown width={16} height={16} className={styles.chev} aria-hidden />
          </button>
          {menuOpen && (
            <div className={styles.menu} role="menu">
              <button className={styles.menuItem} role="menuitem" onClick={signOut}>
                <LogOut width={16} height={16} aria-hidden /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
