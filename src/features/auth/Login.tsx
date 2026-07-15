import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ExternalLink, Check } from 'lucide-react';
import { LogoMark } from '@/components/shell/LogoMark';
import { Avatar } from '@/components/ui';
import { personas } from '@/data/personas';
import { dirAbbrev } from '@/lib/format';
import { useDemoStore } from '@/store/demoStore';
import type { RoleId } from '@/data/types';
import styles from './Login.module.css';

export function Login() {
  const navigate = useNavigate();
  const setRole = useDemoStore((s) => s.setRole);
  const [selected, setSelected] = useState<RoleId | null>('dls-drafter');
  const [verifying, setVerifying] = useState(false);

  function enter() {
    if (!selected) return;
    setVerifying(true);
    window.setTimeout(() => {
      setRole(selected);
      navigate('/dashboard');
    }, 1300);
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <aside className={styles.brandSide}>
          <h1 className={styles.brandHeadline}>
            <span>Legislative</span> Information Management System
          </h1>
          <p className={styles.brandBody}>
            Automating legislative drafting, document management, workflow processing, archival, retrieval and audit-ready publication.
          </p>
          <span className={styles.pattern} aria-hidden />
        </aside>

        <section className={styles.formSide} aria-label="Choose your identity">
          <div className={styles.formMark}>
            <LogoMark size={54} framed={false} />
            <span />
            <div>
              <strong>Parliament of Kenya</strong>
              <small>National Assembly</small>
            </div>
          </div>
          <h2 className={styles.formTitle}>Sign in to LIMS</h2>
          <p className={styles.formHint}>One canonical workspace for DLS, DLPS and Clerk workflows, with every action traceable and every version preserved.</p>
          <p className={styles.selectorLabel}>Role profile</p>

          <ul className={styles.personaList}>
            {personas.map((p) => {
              const active = selected === p.id;
              return (
                <li key={p.id}>
                  <button
                    className={`${styles.persona} ${active ? styles.personaActive : ''}`}
                    onClick={() => setSelected(p.id)}
                    aria-pressed={active}
                  >
                    <Avatar initials={p.initials} name={p.name} size={40} tone={active ? 'green' : 'neutral'} />
                    <span className={styles.personaText}>
                      <span className={styles.personaName}>{p.name}</span>
                      <span className={styles.personaRole}>
                        {p.roleTitle}{dirAbbrev(p.directorate) && ` · ${dirAbbrev(p.directorate)}`}
                      </span>
                    </span>
                    {active && <span className={styles.personaCheck} aria-hidden><Check width={15} height={15} /></span>}
                  </button>
                </li>
              );
            })}
          </ul>

          <button className={styles.enter} onClick={enter} disabled={!selected || verifying}>
            {verifying ? (
              <><Loader2 width={18} height={18} className={styles.spin} aria-hidden /> Verifying role and secure access…</>
            ) : (
              <>Sign in</>
            )}
          </button>

          <Link to="/public" className={styles.publicLink}>
            View public portal <ExternalLink width={14} height={14} aria-hidden />
          </Link>
        </section>
      </div>
    </div>
  );
}
