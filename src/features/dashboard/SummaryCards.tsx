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
    <div className={styles.grid}>
      {cards.map((card) => {
        const Icon = icons[card.icon];
        const tv = toneVars[card.tone];
        return (
          <Link key={card.id} to={card.to} className={styles.card} style={{ background: tv.bg }}>
            <div className={styles.top}>
              <span className={styles.iconWrap} style={{ color: tv.fg }} aria-hidden>
                <Icon width={20} height={20} strokeWidth={2} />
              </span>
              <span className={styles.label}>{card.label}</span>
              <ChevronRight className={styles.chev} width={16} height={16} aria-hidden />
            </div>
            <div className={styles.value}>{card.value}</div>
            <div className={styles.sub}>{card.sub}</div>
          </Link>
        );
      })}
    </div>
  );
}
