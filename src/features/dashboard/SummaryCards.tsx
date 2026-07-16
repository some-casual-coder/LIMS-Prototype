import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, AlarmClock, RotateCcw, Eye } from 'lucide-react';
import { toneVars } from '@/components/ui/tone';
import type { SummaryCard } from '@/data/commandCentre';
import styles from './SummaryCards.module.css';

const icons = {
  action: ClipboardCheck,
  due: AlarmClock,
  returned: RotateCcw,
  review: Eye,
} as const;

const SPARK_BARS = 18;

export function SummaryCards({ cards }: { cards: SummaryCard[] }) {
  return (
    <section className={styles.summary} aria-label="Operational summary">
      {cards.map((card) => {
        const Icon = icons[card.icon];
        const tv = toneVars[card.tone];
        // Thin equalizer: exactly `value` bars are lit in the tone, the rest
        // sit as a soft track — so the picture matches the number shown.
        const content = (
          <>
            <div className={styles.top}>
              <span className={styles.label}>{card.label}</span>
              <span className={styles.iconWrap} style={{ background: tv.bg, color: tv.fg }} aria-hidden><Icon width={17} height={17} strokeWidth={2} /></span>
            </div>
            <div className={styles.metric}>
              <span className={styles.value} data-count data-count-to={card.value}>{card.value}</span>
              <span className={styles.miniTicks} role="img" aria-label={`${card.value}`}>
                {Array.from({ length: SPARK_BARS }, (_, index) => {
                  const lit = index < card.value;            // bold: matches the number
                  const echo = !lit && index < card.value * 2; // faded echo: a sense of progression
                  const echoT = card.value > 0 ? (index - card.value) / card.value : 0;
                  const filled = lit || echo;
                  if (!filled) return <i key={index} style={{ background: 'var(--soft-grey)' }} />;
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
            <span className={styles.sub}>{card.sub}</span>
          </>
        );
        return card.to ? (
          <Link key={card.id} to={card.to} className={`${styles.item} ${styles.interactive}`}>{content}</Link>
        ) : (
          <div key={card.id} className={styles.item}>{content}</div>
        );
      })}
    </section>
  );
}
