import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';
import { LogoMark } from '@/components/shell/LogoMark';
import styles from './PublicShell.module.css';

// Public-facing shell — deliberately distinct from the internal application.
// No internal sidebar, staff identities or approval controls.
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.wrap}>
      <a href="#public-main" className={styles.skip}>Skip to content</a>
      <header className={styles.header}>
        <div className={styles.headInner}>
          <Link to="/public" className={styles.brand}>
            <LogoMark size={40} framed />
            <span className={styles.brandText}>
              <span className={styles.brandName}>National Assembly of Kenya</span>
              <span className={styles.brandSub}>Public Participation Portal</span>
            </span>
          </Link>
          <nav className={styles.nav} aria-label="Public navigation">
            <Link to="/public">Bills &amp; legislation</Link>
            <Link to="/public">Public participation</Link>
            <Link to="/public/track/PPS-2026-00841">Track a submission</Link>
          </nav>
          <div className={styles.headActions}>
            <button className={styles.iconBtn} aria-label="Search"><Search width={18} height={18} /></button>
            <button className={styles.menuBtn} aria-label="Menu"><Menu width={20} height={20} /></button>
          </div>
        </div>
      </header>

      <main id="public-main" className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footInner}>
          <p>National Assembly of Kenya · Public Participation Portal</p>
          <Link to="/login" className={styles.staffLink}>Staff sign-in</Link>
        </div>
      </footer>
    </div>
  );
}
