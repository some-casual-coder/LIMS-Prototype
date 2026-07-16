import { Target, UserRound, CalendarClock, Clock4, CircleAlert } from 'lucide-react';
import { toneVars } from '@/components/ui/tone';
import type { Indicator } from '@/data/myWork';
import styles from './WorkIndicators.module.css';

const icons = { active: Target, action: UserRound, due: CalendarClock, waiting: Clock4, overdue: CircleAlert } as const;

export function WorkIndicators({ indicators, activeStatus, onSelect }: { indicators: Indicator[]; activeStatus: string; onSelect: (filter: string) => void }) {
  const visibleIndicators = indicators.filter((indicator) => indicator.id !== 'waiting');
  return (
    <div className={styles.grid}>
      {visibleIndicators.map((ind) => {
        const Icon = icons[ind.icon];
        const tv = toneVars[ind.tone];
        const active = activeStatus === ind.filter;
        return (
          <button
            key={ind.id}
            className={`${styles.card} ${active ? styles.active : ''}`}
            onClick={() => onSelect(ind.filter)}
            aria-pressed={active}
          >
            <span className={styles.iconWrap} style={{ background: tv.bg, color: tv.fg }} aria-hidden>
              <Icon width={18} height={18} strokeWidth={2} />
            </span>
            <span className={styles.text}>
              <span className={styles.value}>{ind.value}</span>
              <span className={styles.label}>{ind.label}</span>
              <span className={styles.sub}>{ind.sub}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
