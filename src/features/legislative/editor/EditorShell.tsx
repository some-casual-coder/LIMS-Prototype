import { useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Sidebar } from '@/components/shell/Sidebar';
import { useDemoStore } from '@/store/demoStore';
import { allPersonas } from '@/data/personas';
import styles from './EditorShell.module.css';

// Immersive editor frame: the main sidebar is collapsed to an icon rail to
// maximise document space; the editor supplies its own compact header.
export function EditorShell({ children }: { children: ReactNode }) {
  const currentRole = useDemoStore((s) => s.currentRole);
  const [collapsed, setCollapsed] = useState(true);

  if (!currentRole || currentRole === 'citizen') return <Navigate to="/login" replace />;
  const persona = allPersonas.find((p) => p.id === currentRole)!;

  return (
    <div className={styles.shell}>
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} persona={persona} />
      <div className={styles.main}>{children}</div>
    </div>
  );
}
