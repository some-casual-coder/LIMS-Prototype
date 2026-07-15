import { Link } from 'react-router-dom';
import { CalendarClock, TriangleAlert, Clock3, ChevronRight, FileCheck2, Link2, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { Panel } from '@/components/ui';
import { LogoMark } from '@/components/shell/LogoMark';
import { toneVars } from '@/components/ui/tone';
import type { CommandCentreData } from '@/data/commandCentre';
import styles from './ReadinessRail.module.css';

export function ReadinessRail({ data }: { data: CommandCentreData }) {
  const activityIcons = [FileCheck2, ShieldCheck, Link2, UserRoundCheck];
  return (
    <div className={styles.rail}>
      <Panel title="Sitting & Publication Readiness" icon={<CalendarClock />}>
        <div className={styles.readinessLead}>
          <div>
            <p className={styles.nextLabel}>Next sitting</p>
            <p className={styles.nextDate}>{data.readiness.nextSitting}</p>
          </div>
          <LogoMark size={54} />
        </div>

        <div className={styles.stageChart} role="img" aria-label={data.readiness.items.map((item) => `${item.label}: ${item.count}`).join(', ')}>
          {data.readiness.items.map((item) => (
            <div key={item.label} className={styles.stageColumn} aria-hidden>
              {Array.from({ length: 8 }, (_, index) => (
                <span
                  key={index}
                  className={styles.stageTick}
                  style={{
                    background: index < item.count * 2 ? toneVars[item.tone].dot : 'rgba(255,255,255,.72)',
                    opacity: index < item.count * 2 ? 0.56 + index * 0.055 : 1,
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        <ul className={styles.readList}>
          {data.readiness.items.map((item) => (
            <li key={item.label}>
              <div className={styles.readItem}>
                <span className={styles.readDot} style={{ background: toneVars[item.tone].dot }} aria-hidden />
                <span className={styles.readItemLabel}>{item.label}</span>
                <span className={styles.readCount}>{item.count}</span>
              </div>
            </li>
          ))}
        </ul>

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
              <span className={styles.activityIcon} aria-hidden>{(() => { const Icon = activityIcons[i % activityIcons.length]; return <Icon width={15} height={15} />; })()}</span>
              <span className={styles.activityTime}>{ev.time}</span>
              <span className={styles.activityText}>{ev.text}</span>
            </li>
          ))}
        </ul>
        <Link to="/legislative/NA-BILL-2026-015?tab=activity" className={styles.panelLink}>
          Open activity history
        </Link>
      </Panel>
    </div>
  );
}
