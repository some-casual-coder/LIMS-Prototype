import { Link } from 'react-router-dom';
import { CalendarClock, TriangleAlert, Clock3, ChevronRight, ArrowRight } from 'lucide-react';
import { Panel } from '@/components/ui';
import { toneVars } from '@/components/ui/tone';
import type { CommandCentreData } from '@/data/commandCentre';
import styles from './ReadinessRail.module.css';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');

export function ReadinessRail({ data }: { data: CommandCentreData }) {
  return (
    <div className={styles.rail}>
      <Panel title="Sitting & Publication Readiness" icon={<CalendarClock />}>
        <p className={styles.nextLabel}>Next sitting</p>
        <p className={styles.nextDate}>{data.readiness.nextSitting}</p>

        <ul className={styles.readList}>
          {data.readiness.items.map((item) => (
            <li key={item.label}>
              <Link to={`/work?view=${slug(item.label)}`} className={styles.readItem}>
                <span className={styles.readDot} style={{ background: toneVars[item.tone].dot }} aria-hidden />
                <span className={styles.readItemLabel}>{item.label}</span>
                <span className={styles.readCount}>{item.count}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className={styles.distLabel}>Stage distribution</p>
        <div
          className={styles.distBar}
          role="img"
          aria-label={data.readiness.items.map((i) => `${i.label}: ${i.count}`).join(', ')}
        >
          {data.readiness.items.map((item) => (
            <span
              key={item.label}
              className={styles.distSeg}
              style={{ background: toneVars[item.tone].dot, flex: item.count }}
            />
          ))}
        </div>

        <Link to="/analytics" className={styles.panelLink}>
          View readiness <ArrowRight width={15} height={15} aria-hidden />
        </Link>
      </Panel>

      <Panel title="Attention Required" icon={<TriangleAlert />}>
        <ul className={styles.attnList}>
          {data.attention.map((a) => (
            <li key={a.title}>
              <Link to={a.to} className={styles.attnItem} style={{ borderLeftColor: toneVars[a.tone].dot }}>
                <span className={styles.attnText}>
                  <span className={styles.attnTitle}>{a.title}</span>
                  <span className={styles.attnSub}>{a.sub}</span>
                </span>
                <ChevronRight width={16} height={16} className={styles.attnChev} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Recent Activity" icon={<Clock3 />}>
        <ul className={styles.activity}>
          {data.activity.map((ev, i) => (
            <li key={i} className={styles.activityItem}>
              <span className={styles.activityDot} aria-hidden />
              <span className={styles.activityTime}>{ev.time}</span>
              <span className={styles.activityText}>{ev.text}</span>
            </li>
          ))}
        </ul>
        <Link to="/legislative/NA-BILL-2026-015?tab=activity" className={styles.panelLink}>
          View all activity <ArrowRight width={15} height={15} aria-hidden />
        </Link>
      </Panel>
    </div>
  );
}
