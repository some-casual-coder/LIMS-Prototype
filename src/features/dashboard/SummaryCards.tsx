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

export function SummaryCards({ cards }: { cards: SummaryCard[] }) {
  return (
    <section className={styles.summary} aria-label="Operational summary">
      {cards.map((card) => {
        const Icon = icons[card.icon];
        const tv = toneVars[card.tone];
        const content = (
          <>
            <div className={styles.top}>
              <span className={styles.label}>{card.label}</span>
              <span className={styles.iconWrap} style={{ background: tv.bg, color: tv.fg }} aria-hidden><Icon width={17} height={17} strokeWidth={2} /></span>
            </div>
            <div className={styles.metric}>
              <span className={styles.value}>{card.value}</span>
              <span className={styles.miniTicks} aria-hidden>
                {Array.from({ length: 18 }, (_, index) => <i key={index} style={{ background: index < Math.min(card.value + 3, 15) ? tv.dot : 'var(--soft-grey)', opacity: index < card.value ? 1 : .42 }} />)}
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
