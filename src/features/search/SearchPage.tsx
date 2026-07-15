import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, ArrowRight, Sparkles } from 'lucide-react';
import { Panel, StatusBadge } from '@/components/ui';
import { stageTone } from '@/components/ui/tone';
import { ShelledPage } from '@/features/common/ShelledPage';
import { useDemoStore } from '@/store/demoStore';
import type { LegislativeRecord } from '@/data/types';
import styles from './SearchPage.module.css';

const MODES = ['All', 'Exact text', 'Meaning & context', 'Within current Bill'];
const EXAMPLES = [
  'affordable housing levy',
  'protections for citizens without digital access',
  'Which Bills contain protections for vulnerable users?',
];

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const records = useDemoStore((s) => s.records);
  const [q, setQ] = useState(params.get('q') ?? '');
  const [mode, setMode] = useState('All');

  const results = useMemo<LegislativeRecord[]>(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const hits = records.filter((r) =>
      `${r.title} ${r.reference} ${r.shortTitle} ${r.summary}`.toLowerCase().includes(query),
    );
    // Semantic-style keyword intent: surface digital-access records for these terms.
    if (/access|vulnerable|digital|disab/.test(query)) {
      for (const id of ['NA-BILL-2026-015', 'NA-SI-2026-016', 'NA-MOT-2026-046']) {
        const r = records.find((x) => x.id === id);
        if (r && !hits.includes(r)) hits.push(r);
      }
    }
    // Never return an empty broken state — fall back to a general seeded set.
    return hits.length > 0 ? hits.slice(0, 8) : records.slice(0, 6);
  }, [q, records]);

  const showAi = /access|vulnerable|digital|disab/.test(q.toLowerCase());

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setParams(q.trim() ? { q: q.trim() } : {});
  }

  return (
    <ShelledPage
      breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Search' }]}
      title="Search & Knowledge Explorer"
      subtitle="Full-text and meaning-based search across current and historical legislative information."
    >
      <form onSubmit={submit} className={styles.searchBar} role="search">
        <SearchIcon width={20} height={20} aria-hidden />
        <input
          className={styles.searchInput}
          name="search-query"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search Bills, clauses, petitions, references or legislative records"
          aria-label="Search legislative records"
        />
        <button type="submit" className={styles.searchBtn}>Search</button>
      </form>

      <div className={styles.modes} role="tablist" aria-label="Search mode">
        {MODES.map((m) => (
          <button key={m} role="tab" aria-selected={mode === m} className={`${styles.mode} ${mode === m ? styles.modeActive : ''}`} onClick={() => setMode(m)}>
            {m}
          </button>
        ))}
      </div>

      {!q.trim() ? (
        <Panel padded>
          <p className={styles.promptTitle}>Try a question or a phrase</p>
          <div className={styles.examples}>
            {EXAMPLES.map((ex) => (
              <button key={ex} className={styles.example} onClick={() => { setQ(ex); setParams({ q: ex }); }}>
                {ex}
              </button>
            ))}
          </div>
        </Panel>
      ) : (
        <>
          {showAi && (
            <div className={styles.aiSummary}>
              <span className={styles.aiIcon} aria-hidden><Sparkles width={18} height={18} /></span>
              <div>
                <p className={styles.aiText}>
                  The <b>Digital Public Services Bill, 2026</b> contains three provisions relevant to assisted digital
                  access: <Link to="/legislative/NA-BILL-2026-015?highlight=clause-14">Clause 5</Link>,{' '}
                  <Link to="/legislative/NA-BILL-2026-015?highlight=clause-14">Clause 6</Link> and{' '}
                  <Link to="/legislative/NA-BILL-2026-015?highlight=clause-14">Clause 14</Link>.
                </p>
                <p className={styles.aiNote}>AI summary · based on the linked legislative records below.</p>
              </div>
            </div>
          )}
          <p className={styles.count}>{results.length} results</p>
          <ul className={styles.results}>
            {results.map((r) => (
              <li key={r.id}>
                <Panel padded>
                  <div className={styles.resultHead}>
                    <Link to={`/legislative/${r.id}`} className={styles.resultTitle}>{r.title}</Link>
                    <StatusBadge tone={stageTone[r.stage] ?? 'grey'} size="sm">{r.stage}</StatusBadge>
                  </div>
                  <p className={styles.resultMeta}>{r.reference} · {r.workflowType} · {r.year}</p>
                  <p className={styles.resultExcerpt}>{r.summary}</p>
                  <div className={styles.resultLinks}>
                    <Link to={`/legislative/${r.id}`} className={styles.resultLink}>Open workspace <ArrowRight width={14} height={14} /></Link>
                    <Link to={`/legislative/${r.id}/versions`} className={styles.resultLink}>Versions <ArrowRight width={14} height={14} /></Link>
                  </div>
                </Panel>
              </li>
            ))}
          </ul>
        </>
      )}
    </ShelledPage>
  );
}
