import { Link } from 'react-router-dom';
import { ClipboardCheck, AlarmClock, RotateCcw, Eye, ChevronRight } from 'lucide-react';
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
              <span className={styles.iconWrap} style={{ background: tv.bg, color: tv.fg }} aria-hidden>
                <Icon width={20} height={20} strokeWidth={2} />
              </span>
              <span>
                <span className={styles.label}>{card.label}</span>
                <span className={styles.sub}>{card.sub}</span>
              </span>
            </div>
            <div className={styles.value}>{card.value}</div>
            {card.to && <ChevronRight className={styles.chev} width={16} height={16} aria-hidden />}
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
