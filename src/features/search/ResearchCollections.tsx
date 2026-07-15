import { useNavigate, useParams, Link } from 'react-router-dom';
import { FolderOpen, FileText, ArrowRight, Download, ArrowLeft } from 'lucide-react';
import { Panel, Button } from '@/components/ui';
import { ShelledPage } from '@/features/common/ShelledPage';
import { useDemoStore } from '@/store/demoStore';
import { useToast } from './Toast';
import styles from './SupportingPages.module.css';

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function ResearchCollectionsPage() {
  const navigate = useNavigate();
  const collections = useDemoStore((s) => s.researchCollections);
  const currentRole = useDemoStore((s) => s.currentRole);
  const mine = collections.filter((c) => c.ownerId === currentRole);

  return (
    <ShelledPage
      breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Search & Knowledge', to: '/search' }, { label: 'Research Collections' }]}
      title="Research Collections"
      subtitle="Grouped clause excerpts and records saved during your legislative research."
      actions={<Button variant="secondary" to="/search">Back to search</Button>}
    >
      <div className={styles.collectionGrid}>
        {mine.length === 0 ? <p className={styles.empty}>No research collections yet. Add passages from search results to create one.</p> : mine.map((c) => (
          <button key={c.id} className={styles.collectionCard} onClick={() => navigate(`/research/${c.id}`)}>
            <span className={styles.collectionIcon} aria-hidden><FolderOpen width={20} height={20} /></span>
            <span className={styles.collectionName}>{c.name}</span>
            {c.description && <span className={styles.collectionDesc}>{c.description}</span>}
            <span className={styles.collectionMeta}>{c.items.length} item{c.items.length === 1 ? '' : 's'} · Created {fmt(c.createdAt)}</span>
            <ArrowRight width={16} height={16} className={styles.collectionArrow} />
          </button>
        ))}
      </div>
    </ShelledPage>
  );
}

export function ResearchCollectionPage() {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const collections = useDemoStore((s) => s.researchCollections);
  const records = useDemoStore((s) => s.records);
  const { showToast, ToastHost } = useToast();
  const collection = collections.find((c) => c.id === collectionId);

  if (!collection) {
    return (
      <ShelledPage breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Research Collections', to: '/research' }, { label: 'Not found' }]} title="Collection not found" subtitle="This research collection is not available.">
        <Link to="/research" className={styles.backLink}><ArrowLeft width={14} height={14} /> Back to collections</Link>
      </ShelledPage>
    );
  }

  return (
    <ShelledPage
      breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Research Collections', to: '/research' }, { label: collection.name }]}
      title={collection.name}
      subtitle={collection.description}
      actions={<Button variant="secondary" leftIcon={<Download width={15} height={15} />} onClick={() => showToast('Preparing research summary export…')}>Export research summary</Button>}
    >
      <Panel title={`${collection.items.length} saved passage${collection.items.length === 1 ? '' : 's'}`} icon={<FolderOpen width={16} height={16} />}>
        <ul className={styles.itemList}>
          {collection.items.map((item, i) => {
            const rec = records.find((r) => r.id === item.recordId);
            return (
              <li key={i} className={styles.itemRow}>
                <span className={styles.itemIcon} aria-hidden><FileText width={16} height={16} /></span>
                <div className={styles.itemBody}>
                  <p className={styles.itemClause}>{item.clauseRef ?? rec?.title}</p>
                  <p className={styles.itemRec}>{rec?.title} · {rec?.citation ?? rec?.reference}{item.versionLabel ? ` · ${item.versionLabel}` : ''}</p>
                  {item.excerpt && <p className={styles.itemExcerpt}>{item.excerpt}</p>}
                  {item.note && <p className={styles.itemNote}>Note: {item.note}</p>}
                </div>
                <button className={styles.itemOpen} onClick={() => navigate(`/legislative/${item.recordId}`)} aria-label="Open record"><ArrowRight width={16} height={16} /></button>
              </li>
            );
          })}
        </ul>
      </Panel>
      <ToastHost />
    </ShelledPage>
  );
}
