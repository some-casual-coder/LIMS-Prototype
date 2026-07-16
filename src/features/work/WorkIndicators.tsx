import type { CSSProperties } from 'react';
import { Target, UserRound, CalendarClock, Clock4, CircleAlert } from 'lucide-react';
import { toneVars } from '@/components/ui/tone';
import type { Indicator } from '@/data/myWork';
import styles from './WorkIndicators.module.css';

const icons = { active: Target, action: UserRound, due: CalendarClock, waiting: Clock4, overdue: CircleAlert } as const;
const SPARK_BARS = 16;

export function WorkIndicators({ indicators, activeStatus, onSelect }: { indicators: Indicator[]; activeStatus: string; onSelect: (filter: string) => void }) {
  const visibleIndicators = indicators.filter((indicator) => indicator.id !== 'waiting');
  return (
    <div className={styles.grid}>
      {visibleIndicators.map((ind, cardIndex) => {
        const Icon = icons[ind.icon];
        const tv = toneVars[ind.tone];
        const active = activeStatus === ind.filter;
        return (
          <button
            key={ind.id}
            className={`${styles.card} ${active ? styles.active : ''} item-in`}
            style={{ '--item-delay': `${cardIndex * 0.05}s` } as CSSProperties}
            onClick={() => onSelect(ind.filter)}
            aria-pressed={active}
          >
            <div className={styles.top}>
              <span className={styles.label}>{ind.label}</span>
              <span className={styles.iconWrap} style={{ background: tv.bg, color: tv.fg }} aria-hidden>
                <Icon width={17} height={17} strokeWidth={2} />
              </span>
            </div>
            <div className={styles.metric}>
              <span className={styles.value}>{ind.value}</span>
              {/* Thin equalizer: exactly `value` bars lit in tone (1 bar = 1 record),
                  plus an equal-length faded echo for a sense of progression. */}
              <span className={styles.miniTicks} role="img" aria-label={`${ind.value}`}>
                {Array.from({ length: SPARK_BARS }, (_, index) => {
                  const lit = index < ind.value;
                  const echo = !lit && index < ind.value * 2;
                  const echoT = ind.value > 0 ? (index - ind.value) / ind.value : 0;
                  if (!lit && !echo) return <i key={index} style={{ background: 'var(--soft-grey)' }} />;
                  return (
                    <i
                      key={index}
                      className="charge-bar"
                      style={{
                        '--charge-fill': tv.dot,
                        '--charge-track': 'var(--soft-grey)',
                        '--charge-delay': `${index * 0.04}s`,
                        opacity: lit ? 1 : 0.5 - 0.22 * echoT,
                      } as CSSProperties}
                    />
                  );
                })}
              </span>
            </div>
            <span className={styles.sub}>{ind.sub}</span>
          </button>
        );
      })}
    </div>
  );
}
