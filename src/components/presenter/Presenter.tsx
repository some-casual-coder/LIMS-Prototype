import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, RotateCcw, WifiOff, Wifi, ArrowRight, Landmark, TriangleAlert } from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { allPersonas } from '@/data/personas';
import { paths } from '@/routes/paths';
import styles from './Presenter.module.css';

const HERO_LINKS = [
  { label: '1 · Command Centre', to: '/dashboard' },
  { label: '2 · Bill Workspace', to: '/legislative/NA-BILL-2026-015' },
  { label: '3 · Drafting', to: '/legislative/NA-BILL-2026-015/draft' },
  { label: '4 · Search', to: '/search' },
  { label: '5 · Public Participation', to: '/public/bills/NA-BILL-2026-015' },
];

// Invisible presenter layer: opens with Ctrl+` or a discreet unlabelled control.
// Never uses "demo" wording; not part of the product surface.
export function Presenter() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const setRole = useDemoStore((s) => s.setRole);
  const reset = useDemoStore((s) => s.reset);
  const toggleOffline = useDemoStore((s) => s.toggleOffline);
  const offline = useDemoStore((s) => s.offline);
  const currentRole = useDemoStore((s) => s.currentRole);
  const receivePboResponse = useDemoStore((s) => s.receivePboResponse);
  const failPboGateway = useDemoStore((s) => s.failPboGateway);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey && (e.key === '`' || e.key === '~')) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function pickRole(id: string) {
    if (id === 'citizen') {
      setRole('citizen');
      navigate('/public');
    } else {
      setRole(id as never);
      navigate('/dashboard');
    }
    setOpen(false);
  }

  function doReset() {
    reset();
    setOpen(false);
    navigate('/login');
  }

  function simulatePbo(kind: 'response' | 'failure') {
    if (kind === 'response') receivePboResponse();
    else failPboGateway();
    navigate(paths.recordPbo());
    setOpen(false);
  }

  return (
    <>
      <button
        className={styles.trigger}
        onClick={() => setOpen(true)}
        aria-label="Presenter controls"
        tabIndex={-1}
      />
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.panel} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Presenter controls">
            <div className={styles.header}>
              <span className={styles.title}>Presenter</span>
              <button className={styles.close} onClick={() => setOpen(false)} aria-label="Close"><X width={16} height={16} /></button>
            </div>

            <p className={styles.groupLabel}>Continue as</p>
            <div className={styles.roleGrid}>
              {allPersonas.map((p) => (
                <button key={p.id} className={`${styles.role} ${currentRole === p.id ? styles.roleActive : ''}`} onClick={() => pickRole(p.id)}>
                  <span className={styles.roleName}>{p.name}</span>
                  <span className={styles.roleTitle}>{p.roleTitle}</span>
                </button>
              ))}
            </div>

            <p className={styles.groupLabel}>Jump to</p>
            <div className={styles.jumpGrid}>
              {HERO_LINKS.map((l) => (
                <button key={l.to} className={styles.jump} onClick={() => { navigate(l.to); setOpen(false); }}>
                  {l.label} <ArrowRight width={13} height={13} />
                </button>
              ))}
            </div>

            <p className={styles.groupLabel}>Simulate</p>
            <div className={styles.jumpGrid}>
              <button className={styles.jump} onClick={() => simulatePbo('response')}>
                <Landmark width={13} height={13} /> PBO response received
              </button>
              <button className={styles.jump} onClick={() => simulatePbo('failure')}>
                <TriangleAlert width={13} height={13} /> PBO gateway failure
              </button>
            </div>

            <div className={styles.footer}>
              <button className={styles.footBtn} onClick={toggleOffline}>
                {offline ? <Wifi width={15} height={15} /> : <WifiOff width={15} height={15} />}
                {offline ? 'Restore secure AI' : 'Simulate offline AI'}
              </button>
              <button className={styles.footBtnDanger} onClick={doReset}>
                <RotateCcw width={15} height={15} /> Reset data
              </button>
            </div>
            <p className={styles.hint}>Ctrl + ` toggles this panel</p>
          </div>
        </div>
      )}
    </>
  );
}
