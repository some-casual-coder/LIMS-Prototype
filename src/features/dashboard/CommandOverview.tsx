import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Scale, ChevronRight, Layers, FileClock, FileCheck2 } from 'lucide-react';
import type { CommandCentreData } from '@/data/commandCentre';
import { toneVars } from '@/components/ui/tone';
import styles from './CommandOverview.module.css';

// Joint panel — two complementary, non-duplicative lenses:
//  · Workflow progress (left): what is cleared + the specific records I'm
//    pushing, with their completion %. Functional: everything links out.
//  · Active work by stage (right): where my caseload is concentrated / the
//    bottleneck. One bar segment = one record; drills into filtered My Work.
export function CommandOverview({ data }: { data: CommandCentreData }) {
  const total = data.readiness.items.reduce((sum, item) => sum + item.count, 0);
  const cleared = data.readiness.items[0]?.count ?? 0;
  const activeTotal = data.workByStage.reduce((n, i) => n + i.count, 0);
  const stageMax = Math.max(1, ...data.workByStage.map((i) => i.count));

  return (
    <section className={styles.overview} aria-label="Caseload overview">
      <div className={styles.panel}>
        <div className={styles.heading}>
          <h2>Workflow progress</h2>
          <span>{total} sitting-critical items</span>
        </div>
        <Link to="/bills" className={styles.progressValue}>
          <strong data-count data-count-to={cleared}>{cleared}</strong>
          <span>cleared for procedural review</span>
        </Link>
        <div className={styles.progressTicks} role="progressbar" aria-label={`${cleared} of ${total} sitting-critical items cleared`} aria-valuemin={0} aria-valuemax={total} aria-valuenow={cleared}>
          {Array.from({ length: total }, (_, index) => (
            index < cleared
              ? <i key={index} className="charge-bar" style={{ '--charge-fill': 'var(--green-700)', '--charge-track': 'var(--soft-grey)', '--charge-delay': `${index * 0.05}s` } as CSSProperties} />
              : <i key={index} />
          ))}
        </div>
        <div className={styles.recordCards}>
          {data.progressRecords.map((record) => {
            const Icon = record.icon === 'publish' ? FileCheck2 : FileClock;
            const tv = toneVars[record.tone];
            return (
              <Link key={record.title} to={record.to} className={styles.recordCard}>
                <span className={styles.fileIcon} style={{ background: tv.bg, color: tv.fg }} aria-hidden><Icon width={18} height={18} /></span>
                <span className={styles.recordText}><strong>{record.title}</strong><small>{record.sub}</small></span>
                <b>{record.pct}%</b>
              </Link>
            );
          })}
        </div>
      </div>

      <div className={`${styles.panel} ${styles.panelRight}`}>
        <div className={styles.heading}>
          <h2><Layers width={15} height={15} aria-hidden /> Active work by stage</h2>
          <span>{activeTotal} active</span>
        </div>
        <ul className={styles.rows}>
          {data.workByStage.map((row) => <BarRow key={row.stage} label={row.stage} count={row.count} tone={row.tone} to={row.to} scaleMax={stageMax} />)}
        </ul>
        <Link to="/bills" className={styles.portfolioLink}><Scale width={14} height={14} aria-hidden /> Open Bills portfolio</Link>
      </div>
    </section>
  );
}

interface BarRowProps { label: string; count: number; tone: string; to: string; scaleMax: number }

function BarRow({ label, count, tone, to, scaleMax }: BarRowProps) {
  const dot = toneVars[tone as keyof typeof toneVars]?.dot ?? 'var(--soft-grey)';
  return (
    <li>
      <Link to={to} className={styles.row}>
        <span className={styles.rowLabel}>{label}</span>
        <span className={styles.rowBar} role="img" aria-label={`${count} of ${scaleMax}`}>
          {Array.from({ length: scaleMax }, (_, index) => (
            index < count
              ? <i key={index} className="charge-bar" style={{ '--charge-fill': dot, '--charge-track': 'var(--soft-grey)', '--charge-delay': `${index * 0.05}s` } as CSSProperties} />
              : <i key={index} style={{ background: 'var(--soft-grey)' }} />
          ))}
        </span>
        <span className={styles.rowCount} data-count data-count-to={count}>{count}</span>
        <ChevronRight width={15} height={15} className={styles.rowChev} aria-hidden />
      </Link>
    </li>
  );
}
