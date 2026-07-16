import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, TriangleAlert, Clock3, ChevronRight, FileCheck2, Link2, ShieldCheck, UserRoundCheck, Inbox } from 'lucide-react';
import { Panel } from '@/components/ui';
import { LogoMark } from '@/components/shell/LogoMark';
import { toneVars } from '@/components/ui/tone';
import type { CommandCentreData } from '@/data/commandCentre';
import styles from './ReadinessRail.module.css';

export function ReadinessRail({ data }: { data: CommandCentreData }) {
  const activityIcons = [FileCheck2, ShieldCheck, Link2, UserRoundCheck];
  // Fixed track so all four columns share one height and one segment = one item.
  const readinessTrack = Math.max(8, ...data.readiness.items.map((item) => item.count));
  return (
    <div className={styles.rail}>
      <Panel title="Sitting & Publication Readiness" icon={<CalendarClock />} padded={false} bodyClassName={styles.readinessBody}>
        <div className={styles.readinessLead}>
          <div>
            <p className={styles.nextLabel}>Next sitting</p>
            <p className={styles.nextDate}>{data.readiness.nextSitting}</p>
          </div>
          <LogoMark size={54} />
        </div>

        <div className={styles.stageChart} role="group" aria-label="Readiness by stage — select to open">
          {data.readiness.items.map((item) => (
            <Link
              key={item.label}
              to={item.to ?? '/work'}
              className={styles.stageColumn}
              aria-label={`${item.label}: ${item.count}. Open`}
            >
              <span className={styles.stageBars} aria-hidden>
                {Array.from({ length: readinessTrack }, (_, index) => (
                  index < item.count
                    ? (
                      <span
                        key={index}
                        className={`${styles.stageTick} charge-bar`}
                        style={{ '--charge-fill': toneVars[item.tone].dot, '--charge-track': 'rgba(255,255,255,.72)', '--charge-delay': `${index * 0.06}s` } as CSSProperties}
                      />
                    )
                    : <span key={index} className={styles.stageTick} style={{ background: 'rgba(255,255,255,.72)' }} />
                ))}
              </span>
            </Link>
          ))}
        </div>

        <ul className={styles.readList}>
          {data.readiness.items.map((item) => (
            <li key={item.label}>
              <Link to={item.to ?? '/work'} className={styles.readItem}>
                <span className={styles.readDot} style={{ background: toneVars[item.tone].dot }} aria-hidden />
                <span className={styles.readItemLabel}>{item.label}</span>
                <span className={styles.readCount} data-count data-count-to={item.count}>{item.count}</span>
                <ChevronRight width={15} height={15} className={styles.readChev} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Supporting Inputs" icon={<Inbox />}>
        <ul className={styles.inputList}>
          {data.supportingInputs.map((input) => (
            <li key={input.label}>
              <Link to={input.to} className={styles.inputItem}>
                <span className={styles.inputCount} style={{ color: toneVars[input.tone].fg, background: toneVars[input.tone].bg }} data-count data-count-to={input.count}>{input.count}</span>
                <span className={styles.inputText}>
                  <span className={styles.inputLabel}>{input.label}</span>
                  <span className={styles.inputSub}>{input.sub}</span>
                </span>
                <ChevronRight width={15} height={15} className={styles.readChev} aria-hidden />
              </Link>
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
                {a.importance && (
                  <span className={styles.impTag} style={{ color: toneVars[a.tone].fg, background: toneVars[a.tone].bg }}>{a.importance}</span>
                )}
                <ChevronRight width={16} height={16} className={styles.attnChev} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/notifications" className={styles.panelLink}>All notifications</Link>
      </Panel>

      <Panel title="Recent Activity" icon={<Clock3 />}>
        <ul className={styles.activity}>
          {data.activity.map((ev, i) => {
            const Icon = activityIcons[i % activityIcons.length];
            const body = (
              <>
                <span className={styles.activityIcon} aria-hidden><Icon width={15} height={15} /></span>
                <span className={styles.activityTime}>{ev.time}</span>
                <span className={styles.activityBody}>
                  <span className={styles.activityText}>{ev.text}</span>
                  {ev.ref && <span className={styles.activityRef}>{ev.ref}</span>}
                </span>
              </>
            );
            return (
              <li key={i} className={styles.activityItem}>
                {ev.to ? <Link to={ev.to} className={styles.activityLink}>{body}</Link> : <div className={styles.activityLink}>{body}</div>}
              </li>
            );
          })}
        </ul>
        <Link to="/audit" className={styles.panelLink}>Open audit trail</Link>
      </Panel>
    </div>
  );
}
