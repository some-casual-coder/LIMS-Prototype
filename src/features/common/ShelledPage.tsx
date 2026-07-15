import type { ReactNode } from 'react';
import { AppShell, type Crumb } from '@/components/shell';
import styles from './ShelledPage.module.css';

interface Props {
  breadcrumb: Crumb[];
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function ShelledPage({ breadcrumb, title, subtitle, actions, children }: Props) {
  return (
    <AppShell breadcrumb={breadcrumb}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {children}
    </AppShell>
  );
}
