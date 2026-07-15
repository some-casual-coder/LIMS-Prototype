import { Link, useParams } from 'react-router-dom';
import { CalendarClock, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import { PublicShell } from './PublicShell';
import { useDemoStore } from '@/store/demoStore';
import styles from './PublicPortal.module.css';

export function PublicHome() {
  return (
    <PublicShell>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Have your say on legislation</h1>
        <p className={styles.heroBody}>
          Read Bills in plain language, download the official documents and submit your views.
          Your participation helps shape the laws of Kenya.
        </p>
        <div className={styles.heroActions}>
          <Link to="/public/bills/NA-BILL-2026-015" className={styles.primaryBtn}>View active consultations <ArrowRight width={16} height={16} /></Link>
          <Link to="/public/track/PPS-2026-00841" className={styles.secondaryBtn}>Track a submission</Link>
        </div>
      </section>

      <h2 className={styles.sectionTitle}>Active consultations</h2>
      <div className={styles.cards}>
        <article className={styles.card}>
          <span className={styles.cardTag}>Open for participation</span>
          <h3 className={styles.cardTitle}>Digital Public Services Bill, 2026</h3>
          <p className={styles.cardSummary}>
            Sets standards for digital public services and protects people who need assistance or who
            are without digital access.
          </p>
          <div className={styles.cardMeta}>
            <span className={styles.metaItem}><CalendarClock width={15} height={15} /> Closes 14 August 2026</span>
            <span className={styles.daysLeft}>30 days remaining</span>
          </div>
          <Link to="/public/bills/NA-BILL-2026-015" className={styles.cardLink}>View and participate <ArrowRight width={15} height={15} /></Link>
        </article>
      </div>

      <h2 className={styles.sectionTitle}>How participation works</h2>
      <ol className={styles.steps}>
        {[
          ['Find a Bill', 'Browse Bills open for public participation and read the plain-language summary.'],
          ['Share your views', 'Support, oppose or suggest amendments on the Bill or a specific clause.'],
          ['Track your submission', 'Receive a reference number and follow your submission’s progress.'],
        ].map(([t, b], i) => (
          <li key={t} className={styles.step}>
            <span className={styles.stepNum}>{i + 1}</span>
            <div><p className={styles.stepTitle}>{t}</p><p className={styles.stepBody}>{b}</p></div>
          </li>
        ))}
      </ol>
    </PublicShell>
  );
}

export function PublicBill() {
  const { id } = useParams();
  const record = useDemoStore((s) => s.records.find((r) => r.id === id));
  const title = record?.title ?? 'Digital Public Services Bill, 2026';

  return (
    <PublicShell>
      <nav className={styles.crumbs}><Link to="/public">Public participation</Link> / <span>{title}</span></nav>
      <div className={styles.billLayout}>
        <div>
          <span className={styles.cardTag}>Open for participation</span>
          <h1 className={styles.billTitle}>{title}</h1>
          <p className={styles.billRef}>{record?.reference ?? 'NA/BILL/2026/015'}</p>

          <div className={styles.summaryBox}>
            <p className={styles.summaryLabel}>Plain-language summary</p>
            <p className={styles.summaryText}>
              This Bill requires public services delivered online to remain accessible to everyone. It
              provides for assisted access, non-digital alternatives and specific protections for
              vulnerable users, including older persons and people with disabilities.
            </p>
            <p className={styles.summaryNote}>This summary explains the Bill. It does not replace the official legislative text.</p>
          </div>

          <h2 className={styles.h2}>Key provisions</h2>
          <ul className={styles.provisions}>
            {['Accessibility of digital services (Clause 5)', 'Assisted digital access (Clause 6)', 'Protection of vulnerable users (Clause 14)'].map((p) => (
              <li key={p}><CheckCircle2 width={16} height={16} /> {p}</li>
            ))}
          </ul>
        </div>

        <aside className={styles.billAside}>
          <div className={styles.asideCard}>
            <Link to={`/public/bills/${id ?? 'NA-BILL-2026-015'}/participate`} className={styles.primaryBtn}>Submit your views <ArrowRight width={16} height={16} /></Link>
            <p className={styles.closes}>Consultation closes 14 August 2026</p>
          </div>
          <div className={styles.asideCard}>
            <p className={styles.asideTitle}>Official documents</p>
            <a className={styles.doc}><FileText width={16} height={16} /> Official PDF</a>
            <a className={styles.doc}><FileText width={16} height={16} /> Accessible HTML</a>
          </div>
        </aside>
      </div>
    </PublicShell>
  );
}

export function PublicParticipate() {
  const { id } = useParams();
  return (
    <PublicShell>
      <nav className={styles.crumbs}><Link to="/public">Public participation</Link> / <Link to={`/public/bills/${id ?? 'NA-BILL-2026-015'}`}>Bill</Link> / <span>Submit your views</span></nav>
      <div className={styles.centerCard}>
        <h1 className={styles.h1}>Submit your views</h1>
        <p className={styles.centerBody}>
          The guided submission form lets you share your position on the Bill or a specific clause,
          attach supporting evidence and receive a tracking reference. It opens as part of the public
          participation experience.
        </p>
        <div className={styles.centerActions}>
          <Link to={`/public/bills/${id ?? 'NA-BILL-2026-015'}`} className={styles.secondaryBtn}>Back to the Bill</Link>
          <Link to="/public/track/PPS-2026-00841" className={styles.primaryBtn}>Track an existing submission</Link>
        </div>
      </div>
    </PublicShell>
  );
}

export function PublicTrack() {
  const { ref } = useParams();
  const stages = ['Received', 'Completeness check', 'Under parliamentary review', 'Associated with legislative process', 'Consideration completed', 'Closed'];
  const current = 2;
  return (
    <PublicShell>
      <div className={styles.centerCard}>
        <h1 className={styles.h1}>Track your submission</h1>
        <p className={styles.trackRef}>Reference <b>{ref ?? 'PPS-2026-00841'}</b> · Digital Public Services Bill, 2026</p>
        <ol className={styles.track}>
          {stages.map((s, i) => (
            <li key={s} className={`${styles.trackStep} ${i < current ? styles.tDone : ''} ${i === current ? styles.tCurrent : ''}`}>
              <span className={styles.trackDot} aria-hidden>{i <= current ? <CheckCircle2 width={16} height={16} /> : i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <p className={styles.trackNote}>Your submission is currently under parliamentary review. You will be notified of any change to its status.</p>
      </div>
    </PublicShell>
  );
}
