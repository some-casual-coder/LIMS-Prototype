import { Link } from 'react-router-dom';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Panel } from '@/components/ui';
import styles from './PreviewPanel.module.css';

interface Props {
  icon: LucideIcon;
  intro: string;
  capabilities: string[];
  links?: { label: string; to: string }[];
}

// A composed, intentional preview surface for routes delivered in a later phase.
// Presentation-ready — communicates the screen's purpose without dead ends.
export function PreviewPanel({ icon: Icon, intro, capabilities, links }: Props) {
  return (
    <Panel padded>
      <div className={styles.wrap}>
        <span className={styles.badge} aria-hidden><Icon width={26} height={26} strokeWidth={1.8} /></span>
        <p className={styles.intro}>{intro}</p>
        <ul className={styles.caps}>
          {capabilities.map((c) => (
            <li key={c} className={styles.cap}>{c}</li>
          ))}
        </ul>
        {links && links.length > 0 && (
          <div className={styles.links}>
            {links.map((l) => (
              <Link key={l.to} to={l.to} className={styles.link}>
                {l.label} <ArrowRight width={15} height={15} aria-hidden />
              </Link>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}
