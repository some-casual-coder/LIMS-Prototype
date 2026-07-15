import { useNavigate } from 'react-router-dom';
import { History, RotateCw, Pin, X, ArrowRight } from 'lucide-react';
import { Panel, Button } from '@/components/ui';
import { ShelledPage } from '@/features/common/ShelledPage';
import { useDemoStore } from '@/store/demoStore';
import { paths } from '@/routes/paths';
import styles from './SupportingPages.module.css';

const relTime = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? 'yesterday' : new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export function RecentResearchPage() {
  const navigate = useNavigate();
  const recentSearches = useDemoStore((s) => s.recentSearches);
  const currentRole = useDemoStore((s) => s.currentRole);
  const toggleRecentPin = useDemoStore((s) => s.toggleRecentPin);
  const removeRecentSearch = useDemoStore((s) => s.removeRecentSearch);
  const recentlyOpened = useDemoStore((s) => s.recentlyOpened);
  const records = useDemoStore((s) => s.records);

  const mine = recentSearches.filter((r) => r.ownerId === currentRole);
  const openedRecords = recentlyOpened.map((id) => records.find((r) => r.id === id)).filter(Boolean);

  return (
    <ShelledPage
      breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Search & Knowledge', to: '/search' }, { label: 'Recent Research' }]}
      title="Recent Research"
      subtitle="Your recent searches and recently viewed records. This history is private to you."
      actions={<Button variant="secondary" to="/search">Back to search</Button>}
    >
      <Panel title="Recent searches" icon={<History width={16} height={16} />}>
        {mine.length === 0 ? <p className={styles.empty}>No recent searches.</p> : (
          <ul className={styles.recentList}>
            {mine.map((r) => (
              <li key={r.id} className={styles.recentRow}>
                <button className={styles.recentMain} onClick={() => navigate(paths.searchQuery(r.query, r.mode))}>
                  <span className={styles.recentQuery}>{r.pinned && <Pin width={12} height={12} className={styles.pin} />}{r.query}</span>
                  <span className={styles.recentMeta}>{r.mode === 'meaning' ? 'Meaning & Context' : r.mode === 'exact' ? 'Exact Text' : 'All Results'} · viewed {relTime(r.viewedAt)} · {r.resultCount} results</span>
                </button>
                <div className={styles.recentActions}>
                  <button aria-label="Run again" title="Run again" onClick={() => navigate(paths.searchQuery(r.query, r.mode))}><RotateCw width={15} height={15} /></button>
                  <button aria-label="Pin" title="Pin" className={r.pinned ? styles.pinned : ''} onClick={() => toggleRecentPin(r.id)}><Pin width={15} height={15} /></button>
                  <button aria-label="Remove" title="Remove" onClick={() => removeRecentSearch(r.id)}><X width={15} height={15} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {openedRecords.length > 0 && (
        <Panel title="Recently viewed records" className={styles.mt}>
          <ul className={styles.recentList}>
            {openedRecords.map((r) => r && (
              <li key={r.id} className={styles.recentRow}>
                <button className={styles.recentMain} onClick={() => navigate(`/legislative/${r.id}`)}>
                  <span className={styles.recentQuery}>{r.title}</span>
                  <span className={styles.recentMeta}>{r.reference} · {r.workflowType}</span>
                </button>
                <ArrowRight width={16} height={16} className={styles.rowArrow} />
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </ShelledPage>
  );
}
