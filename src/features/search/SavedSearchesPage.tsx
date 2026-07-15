import { useNavigate } from 'react-router-dom';
import { Bookmark, ArrowRight, Trash2, Bell, BellOff, Users, Lock } from 'lucide-react';
import { Panel, Button } from '@/components/ui';
import { ShelledPage } from '@/features/common/ShelledPage';
import { useDemoStore } from '@/store/demoStore';
import { paths } from '@/routes/paths';
import styles from './SupportingPages.module.css';

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function SavedSearchesPage() {
  const navigate = useNavigate();
  const savedSearches = useDemoStore((s) => s.savedSearches);
  const currentRole = useDemoStore((s) => s.currentRole);
  const removeSavedSearch = useDemoStore((s) => s.removeSavedSearch);

  const mine = savedSearches.filter((s) => s.ownerId === currentRole);
  const shared = savedSearches.filter((s) => s.ownerId !== currentRole && s.visibility === 'Directorate');

  const Card = ({ s }: { s: typeof savedSearches[number] }) => (
    <li className={styles.savedCard}>
      <div className={styles.savedTop}>
        <p className={styles.savedName}>{s.name}</p>
        <span className={styles.vis}>{s.visibility === 'Only me' ? <Lock width={12} height={12} /> : <Users width={12} height={12} />} {s.visibility}</span>
      </div>
      <p className={styles.savedQuery}>“{s.query}”</p>
      <p className={styles.savedMeta}>{s.filterSummary || 'No filters'} · {s.resultCount} results · Last run {fmt(s.lastRun)}</p>
      <div className={styles.savedFoot}>
        <span className={styles.notify}>{s.notify ? <><Bell width={13} height={13} /> Alerts on</> : <><BellOff width={13} height={13} /> Alerts off</>}</span>
        <div className={styles.savedActions}>
          {s.ownerId === currentRole && (
            <button className={styles.iconBtn} onClick={() => removeSavedSearch(s.id)} aria-label="Delete saved search"><Trash2 width={15} height={15} /></button>
          )}
          <Button size="sm" variant="secondary" rightIcon={<ArrowRight width={13} height={13} />} onClick={() => navigate(paths.searchQuery(s.query, s.mode))}>Run search</Button>
        </div>
      </div>
    </li>
  );

  return (
    <ShelledPage
      breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Search & Knowledge', to: '/search' }, { label: 'Saved Searches' }]}
      title="Saved Searches"
      subtitle="Re-run your monitored searches and manage directorate-shared searches."
      actions={<Button variant="secondary" to="/search">Back to search</Button>}
    >
      <Panel title="My saved searches" icon={<Bookmark width={16} height={16} />}>
        {mine.length === 0 ? <p className={styles.empty}>You have not saved any searches yet.</p> : <ul className={styles.savedList}>{mine.map((s) => <Card key={s.id} s={s} />)}</ul>}
      </Panel>
      {shared.length > 0 && (
        <Panel title="Shared with my directorate" icon={<Users width={16} height={16} />} className={styles.mt}>
          <ul className={styles.savedList}>{shared.map((s) => <Card key={s.id} s={s} />)}</ul>
        </Panel>
      )}
    </ShelledPage>
  );
}
