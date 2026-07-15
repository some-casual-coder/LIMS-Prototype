import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Loader2, ExternalLink, Check } from 'lucide-react';
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
          <div className={styles.brandTop}>
            <LogoMark size={46} />
            <div>
              <p className={styles.brandName}>LIMS</p>
              <p className={styles.brandSub}>Legislative Information Management System</p>
            </div>
          </div>
          <div>
            <h1 className={styles.brandHeadline}>The National Assembly’s trusted legislative workspace.</h1>
            <p className={styles.brandBody}>
              Create, process, approve, publish, find and audit legislative information in one
              secure, permission-aware system.
            </p>
          </div>
          <p className={styles.secureNote}>
            <ShieldCheck width={16} height={16} aria-hidden /> Secure institutional access · National Assembly of Kenya
          </p>
        </aside>

        <section className={styles.formSide} aria-label="Choose your identity">
          <h2 className={styles.formTitle}>Select your role to continue</h2>
          <p className={styles.formHint}>Your workspace, tasks and permitted actions are tailored to your role.</p>

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
              <>Enter workspace <ArrowRight width={18} height={18} aria-hidden /></>
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
