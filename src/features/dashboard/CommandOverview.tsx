import { Link } from 'react-router-dom';
import { FileCheck2, FileClock, Scale } from 'lucide-react';
import type { CommandCentreData } from '@/data/commandCentre';
import { toneVars } from '@/components/ui/tone';
import styles from './CommandOverview.module.css';

export function CommandOverview({ data }: { data: CommandCentreData }) {
  const pipeline = data.readiness.items;
  const total = pipeline.reduce((sum, item) => sum + item.count, 0);
  const cleared = pipeline[0]?.count ?? 0;
  return (
    <section className={styles.overview} aria-label="Legislative workflow overview">
      <div className={styles.pipeline}>
        <div className={styles.heading}><h2>Legislative pipeline</h2><span>Next sitting</span></div>
        <div className={styles.pipelineChart} role="img" aria-label={pipeline.map((item) => `${item.label}: ${item.count}`).join(', ')}>
          {pipeline.map((item, group) => (
            <div key={item.label} className={styles.pipelineGroup} aria-hidden>
              <strong>{item.count}</strong>
              <span className={styles.lines}>{Array.from({ length: 8 }, (_, index) => <i key={index} style={{ background: index < item.count * 2 ? toneVars[item.tone].dot : 'var(--soft-grey)', opacity: index < item.count * 2 ? .56 + index * .055 : 1 }} />)}</span>
              <small>{group === 0 ? 'Review' : group === 1 ? 'Signature' : group === 2 ? 'Checks' : 'At risk'}</small>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.workflow}>
        <div className={styles.heading}><h2>Workflow progress</h2><span>{total} sitting-critical items</span></div>
        <div className={styles.progressValue}><strong>{cleared}</strong><span>cleared for procedural review</span></div>
        <div className={styles.progressTicks} role="progressbar" aria-label={`${cleared} of ${total} sitting-critical items cleared`} aria-valuemin={0} aria-valuemax={total} aria-valuenow={cleared}>
          {Array.from({ length: total }, (_, index) => <i key={index} className={index < cleared ? styles.done : ''} />)}
        </div>
        <div className={styles.recordCards}>
          <Link to="/legislative/NA-BILL-2026-015/draft" className={styles.recordCard}>
            <span className={styles.fileIcon}><FileClock width={20} height={20} /></span>
            <span><strong>Digital Public Services Bill</strong><small>Version 4.0 · Legal review</small></span>
            <b>72%</b>
          </Link>
          <Link to="/legislative/NA-BILL-2026-004/publish" className={styles.recordCard}>
            <span className={`${styles.fileIcon} ${styles.goldIcon}`}><FileCheck2 width={20} height={20} /></span>
            <span><strong>Publication package</strong><small>Signature and seal pending</small></span>
            <b>84%</b>
          </Link>
        </div>
      </div>

      <Link to="/bills" className={styles.portfolioLink}><Scale width={15} height={15} /> Open Bills portfolio</Link>
    </section>
  );
}
