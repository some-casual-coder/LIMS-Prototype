import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader, type Crumb } from './TopHeader';
import { useDemoStore } from '@/store/demoStore';
import { allPersonas } from '@/data/personas';
import styles from './AppShell.module.css';

interface Props {
  breadcrumb: Crumb[];
  children: ReactNode;
}

const COLLAPSE_KEY = 'lims-sidebar-collapsed';

// Internal application frame: role guard + sidebar + header + scrollable content.
export function AppShell({ breadcrumb, children }: Props) {
  const currentRole = useDemoStore((s) => s.currentRole);
  const notifications = useDemoStore((s) => s.notifications);
  const [collapsed, setCollapsed] = useState<boolean>(() => localStorage.getItem(COLLAPSE_KEY) === '1');
  const [compactViewport, setCompactViewport] = useState(() => window.matchMedia('(max-width: 1180px) and (min-width: 721px)').matches);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 1180px) and (min-width: 721px)');
    const update = () => setCompactViewport(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [mobileOpen]);

  // No active identity → route to the sign-in screen.
  if (!currentRole || currentRole === 'citizen') {
    return <Navigate to="/login" replace />;
  }

  const persona = allPersonas.find((p) => p.id === currentRole)!;
  const unreadCount = notifications.filter((n) => n.recipientId === currentRole && !n.read).length;

  function toggleCollapse() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      return next;
    });
  }

  return (
    <div className={styles.shell}>
      <Sidebar
        collapsed={mobileOpen ? false : compactViewport || collapsed}
        mobileOpen={mobileOpen}
        onCloseNavigation={() => setMobileOpen(false)}
        onToggleCollapse={toggleCollapse}
        persona={persona}
      />
      {mobileOpen && <button className={styles.scrim} onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
      <div className={styles.main}>
        <TopHeader breadcrumb={breadcrumb} persona={persona} unreadCount={unreadCount} onOpenNavigation={() => setMobileOpen(true)} />
        <main className={styles.content} id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
