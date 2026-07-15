import { useNavigate } from 'react-router-dom';
import {
  Scale, Vote, ScrollText, ClipboardList, FileCog, Archive, ArrowRight, ArrowUpRight,
  RotateCw, Pin, X, Clock, Bookmark, Library, AlertTriangle,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Panel } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import { repositoryCollections, suggestedSearches } from '@/data/searchData';
import type { SearchMode } from '@/data/types';
import styles from './SearchLanding.module.css';

const COLLECTION_ICONS: Record<string, ReactNode> = {
  Scale: <Scale />, Vote: <Vote />, ScrollText: <ScrollText />, ClipboardList: <ClipboardList />, FileCog: <FileCog />, Archive: <Archive />,
};

const relTime = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  if (days === 1) return 'yesterday';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export function SearchLanding({ onRun }: { onRun: (q: string, mode: SearchMode) => void }) {
  const navigate = useNavigate();
  const recentSearches = useDemoStore((s) => s.recentSearches);
  const savedSearches = useDemoStore((s) => s.savedSearches);
  const records = useDemoStore((s) => s.records);
  const currentRole = useDemoStore((s) => s.currentRole);
  const toggleRecentPin = useDemoStore((s) => s.toggleRecentPin);
  const removeRecentSearch = useDemoStore((s) => s.removeRecentSearch);

  const myRecent = recentSearches.filter((r) => r.ownerId === currentRole).slice(0, 4);
  const mySaved = savedSearches.filter((s) => s.ownerId === currentRole || s.visibility === 'Directorate').slice(0, 3);
  const recentlyPublished = records
    .filter((r) => r.stage === 'Published')
    .sort((a, b) => +new Date(b.lastUpdated) - +new Date(a.lastUpdated))
    .slice(0, 4);

  return (
    <div className={styles.landing}>
      {/* Suggested searches */}
      <div className={styles.suggested}>
        <span className={styles.suggestedLabel}>Try a search</span>
        <div className={styles.chips}>
          {suggestedSearches.map((s) => (
            <button key={s} className={styles.chip} onClick={() => onRun(s, 'all')}>{s}</button>
          ))}
        </div>
      </div>

      <div className={styles.cols}>
        {/* Left: recent + saved */}
        <div className={styles.colMain}>
          <Panel title="Recent research" icon={<Clock width={16} height={16} />}
            actions={<button className={styles.viewAll} onClick={() => navigate('/search/recent')}>View all <ArrowRight width={13} height={13} /></button>}>
            {myRecent.length === 0 ? (
              <p className={styles.empty}>Your recent searches will appear here.</p>
            ) : (
              <ul className={styles.recentList}>
                {myRecent.map((r) => (
                  <li key={r.id} className={styles.recentItem}>
                    <button className={styles.recentMain} onClick={() => onRun(r.query, r.mode)}>
                      <span className={styles.recentQuery}>{r.pinned && <Pin width={12} height={12} className={styles.pinIcon} />}{r.query}</span>
                      <span className={styles.recentMeta}>Viewed {relTime(r.viewedAt)} · {r.resultCount} results</span>
                    </button>
                    <div className={styles.recentActions}>
                      <button title="Run again" aria-label="Run again" onClick={() => onRun(r.query, r.mode)}><RotateCw width={15} height={15} /></button>
                      <button title={r.pinned ? 'Unpin' : 'Pin'} aria-label="Pin" className={r.pinned ? styles.pinned : ''} onClick={() => toggleRecentPin(r.id)}><Pin width={15} height={15} /></button>
                      <button title="Remove" aria-label="Remove from history" onClick={() => removeRecentSearch(r.id)}><X width={15} height={15} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Saved searches" icon={<Bookmark width={16} height={16} />}
            actions={<button className={styles.viewAll} onClick={() => navigate('/search/saved')}>View all <ArrowRight width={13} height={13} /></button>}>
            {mySaved.length === 0 ? (
              <p className={styles.empty}>Save a search to monitor it and re-run it quickly.</p>
            ) : (
              <ul className={styles.savedList}>
                {mySaved.map((s) => (
                  <li key={s.id} className={styles.savedItem}>
                    <div className={styles.savedText}>
                      <p className={styles.savedName}>{s.name}</p>
                      <p className={styles.savedMeta}>{s.filterSummary} · {s.resultCount} results · {s.visibility}</p>
                    </div>
                    <button className={styles.runBtn} onClick={() => onRun(s.query, s.mode)}>Run search <ArrowRight width={13} height={13} /></button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Right: browse repository */}
        <div className={styles.colSide}>
          <Panel title="Browse the repository" icon={<Library width={16} height={16} />}
            actions={<button className={styles.viewAll} onClick={() => navigate('/repository')}>Open <ArrowRight width={13} height={13} /></button>}>
            <ul className={styles.collections}>
              {repositoryCollections.map((c) => (
                <li key={c.id}>
                  <button className={styles.collection} onClick={() => navigate(c.to)}>
                    <span className={`${styles.collIcon} ${styles['tone_' + c.tone]}`} aria-hidden>{COLLECTION_ICONS[c.icon] ?? <Archive />}</span>
                    <span className={styles.collText}>
                      <span className={styles.collLabel}>{c.label}</span>
                      <span className={styles.collCount}>{c.count}</span>
                      {c.restrictedCount ? <span className={styles.collRestricted}><AlertTriangle width={11} height={11} /> {c.restrictedCount} restricted</span> : null}
                    </span>
                    <ArrowUpRight width={16} height={16} className={styles.collArrow} />
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {/* Recently published */}
      <Panel title="Recently published" icon={<Archive width={16} height={16} />}
        actions={<button className={styles.viewAll} onClick={() => navigate('/repository/signed-publications')}>Official publications <ArrowRight width={13} height={13} /></button>}>
        <ul className={styles.published}>
          {recentlyPublished.map((r) => (
            <li key={r.id}>
              <button className={styles.pubItem} onClick={() => navigate(`/legislative/${r.id}`)}>
                <span className={styles.pubTitle}>{r.title}</span>
                <span className={styles.pubMeta}>{r.reference} · {r.workflowType} · Published {new Date(r.lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
