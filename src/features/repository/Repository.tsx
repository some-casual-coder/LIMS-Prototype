import { useMemo, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon, ScanLine, LayoutList, LayoutGrid, ChevronDown, SlidersHorizontal,
  Bookmark, MoreVertical, Lock, Check, Library,
} from 'lucide-react';
import { AppShell } from '@/components/shell';
import { Button, Popover, StatusBadge } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import type { LegislativeRecord } from '@/data/types';
import { deriveFormats, repositoryTabs, repositorySavedCollections } from '@/data/searchData';
import { recordVersionStatus, canAccessRecord, statusBucket, dirShort, visibilityOf } from '@/features/search/searchLogic';
import { recordIcon, FormatChips, visLabel } from '@/features/search/shared';
import { RecordPreviewSheet } from '@/features/search/RecordPreviewSheet';
import { RequestAccessSheet, AddToCollectionSheet } from '@/features/search/sheets';
import { useToast } from '@/features/search/Toast';
import styles from './Repository.module.css';

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// Which record types a repository collection route pins to.
const COLLECTION_MAP: Record<string, { tab: string; type?: string; label: string }> = {
  bills: { tab: 'legislative', type: 'Bill', label: 'Bills' },
  'statutory-instruments': { tab: 'legislative', type: 'Statutory Instrument', label: 'Statutory Instruments' },
  'historical-records': { tab: 'historical', label: 'Historical Archive' },
  'signed-publications': { tab: 'publications', label: 'Official Publications' },
};

const IMPORT_ROLES = ['clerk', 'dlps-officer', 'ict-admin'];

export function Repository() {
  const { collection } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const records = useDemoStore((s) => s.records);
  const versions = useDemoStore((s) => s.versions);
  const billContent = useDemoStore((s) => s.billContent);
  const currentRole = useDemoStore((s) => s.currentRole);
  const { showToast, ToastHost } = useToast();

  const coll = collection ? COLLECTION_MAP[collection] : undefined;
  const view = (params.get('view') as 'list' | 'card') || 'list';
  const tab = params.get('tab') || coll?.tab || 'all';
  const previewRecord = params.get('record') || '';
  const sheet = params.get('sheet') || '';

  const [typeFilter, setTypeFilter] = useState(params.get('type') || coll?.type || '');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dirFilter, setDirFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sort, setSort] = useState('updated');

  const setView = (v: string) => setParams((p) => { p.set('view', v); return p; }, { replace: true });
  const setTab = (t: string) => setParams((p) => { p.set('tab', t); p.delete('record'); return p; });
  const openPreview = (id: string) => setParams((p) => { p.set('record', id); p.delete('sheet'); return p; });
  const closePreview = () => setParams((p) => { p.delete('record'); return p; }, { replace: true });
  const openSheet = (name: string, id?: string) => setParams((p) => { p.set('sheet', name); if (id) p.set('record', id); return p; });
  const closeSheet = () => setParams((p) => { p.delete('sheet'); return p; }, { replace: true });

  const filtered = useMemo(() => {
    let list = records.filter((r) => {
      if (tab === 'legislative' && !['Bill', 'Motion', 'Petition', 'Question', 'Statement', 'Order Paper', 'Votes and Proceedings', 'Papers Laid', 'Statutory Instrument', 'Supply'].includes(r.workflowType)) return false;
      if (tab === 'publications' && r.stage !== 'Published') return false;
      if (tab === 'historical' && r.recordSource !== 'Historical scan') return false;
      if (tab === 'supporting' && !['Report', 'Papers Laid'].includes(r.workflowType) && r.recordSource !== 'Historical scan') return false;
      if (typeFilter && r.workflowType !== typeFilter) return false;
      if (yearFilter && String(r.year) !== yearFilter) return false;
      if (statusFilter && statusBucket(r) !== statusFilter) return false;
      if (dirFilter && dirShort(r.directorate) !== dirFilter) return false;
      if (classFilter && visibilityOf(r) !== classFilter) return false;
      return true;
    });
    if (sort === 'updated') list = [...list].sort((a, b) => +new Date(b.lastUpdated) - +new Date(a.lastUpdated));
    else if (sort === 'title') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'year') list = [...list].sort((a, b) => b.year - a.year);
    return list;
  }, [records, tab, typeFilter, yearFilter, statusFilter, dirFilter, classFilter, sort]);

  const years = useMemo(() => [...new Set(records.map((r) => r.year))].sort((a, b) => b - a), [records]);
  const anyFilter = typeFilter || yearFilter || statusFilter || dirFilter || classFilter;
  const clearFilters = () => { setTypeFilter(''); setYearFilter(''); setStatusFilter(''); setDirFilter(''); setClassFilter(''); };
  const canImport = IMPORT_ROLES.includes(currentRole ?? '');

  return (
    <AppShell breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Repository' }, { label: coll?.label ?? 'All Records' }]}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Legislative Repository</h1>
          <p className={styles.subtitle}>Browse authoritative legislative records, official outputs and verified historical archives.</p>
        </div>
        <div className={styles.headActions}>
          <Button variant="secondary" leftIcon={<SearchIcon width={16} height={16} />} to="/search">Search Repository</Button>
          {canImport ? (
            <Button variant="primary" leftIcon={<ScanLine width={16} height={16} />} to="/documents/import">Import Historical Record</Button>
          ) : (
            <span title="Importing historical records requires an archive or records role.">
              <Button variant="primary" leftIcon={<ScanLine width={16} height={16} />} disabled>Import Historical Record</Button>
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist" aria-label="Repository sections">
        {repositoryTabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* Saved collections strip */}
      <div className={styles.savedStrip}>
        <span className={styles.savedLabel}>Collections</span>
        {repositorySavedCollections.map((c) => (
          <button key={c.id} className={styles.savedChip} title={c.filter} onClick={() => showToast(`Collection: ${c.label} — ${c.filter}.`)}>{c.label}</button>
        ))}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlsLeft}>
          <span className={styles.count}>{filtered.length} records</span>
        </div>
        <div className={styles.controlsRight}>
          <div className={styles.sortWrap}>
            <span className={styles.sortLabel}>Sort by</span>
            <Popover label="Sort" trigger={({ toggle, ref }) => (
              <button ref={ref} className={styles.control} onClick={toggle}>{sort === 'updated' ? 'Last Updated' : sort === 'title' ? 'Title' : 'Year'} <ChevronDown width={14} height={14} /></button>
            )}>
              {(close) => (
                <div className={styles.menu} onClick={close}>
                  {[['updated', 'Last Updated'], ['title', 'Title'], ['year', 'Year']].map(([id, label]) => (
                    <button key={id} className={`${styles.menuItem} ${sort === id ? styles.menuItemActive : ''}`} onClick={() => setSort(id)}>{label}</button>
                  ))}
                </div>
              )}
            </Popover>
          </div>
          <div className={styles.viewToggle} role="radiogroup" aria-label="View">
            <button role="radio" aria-checked={view === 'list'} className={`${styles.viewBtn} ${view === 'list' ? styles.viewActive : ''}`} onClick={() => setView('list')}><LayoutList width={15} height={15} /> List</button>
            <button role="radio" aria-checked={view === 'card'} className={`${styles.viewBtn} ${view === 'card' ? styles.viewActive : ''}`} onClick={() => setView('card')}><LayoutGrid width={15} height={15} /> Card</button>
          </div>
        </div>
      </div>

      {/* Filter dropdown row */}
      <div className={styles.filterRow}>
        <span className={styles.filterIcon}><SlidersHorizontal width={15} height={15} /></span>
        <FilterSelect label="All Types" value={typeFilter} onChange={setTypeFilter} options={['Bill', 'Motion', 'Petition', 'Question', 'Statement', 'Order Paper', 'Votes and Proceedings', 'Papers Laid', 'Statutory Instrument', 'Supply', 'Report']} />
        <FilterSelect label="All Years" value={yearFilter} onChange={setYearFilter} options={years.map(String)} />
        <FilterSelect label="All Statuses" value={statusFilter} onChange={setStatusFilter} options={['Draft', 'In review', 'Approved', 'Published', 'Archived']} />
        <FilterSelect label="All Directorates" value={dirFilter} onChange={setDirFilter} options={['DLS', 'DLPS', 'Other']} />
        <FilterSelect label="All Classifications" value={classFilter} onChange={setClassFilter} options={['Public', 'Internal', 'Restricted', 'Confidential']} />
        {anyFilter && <button className={styles.clearBtn} onClick={clearFilters}>Clear all</button>}
      </div>

      {/* Records */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <Library width={30} height={30} />
          <p className={styles.emptyTitle}>No records in this view</p>
          <p className={styles.emptyText}>Adjust the filters or choose another repository section.</p>
          <Button variant="secondary" onClick={clearFilters}>Clear filters</Button>
        </div>
      ) : view === 'list' ? (
        <RepositoryList records={filtered} versions={versions} billContent={billContent} currentRole={currentRole} onOpen={openPreview} onRequestAccess={(id) => openSheet('request', id)} showToast={showToast} />
      ) : (
        <RepositoryCards records={filtered} versions={versions} billContent={billContent} currentRole={currentRole} onOpen={openPreview} onRequestAccess={(id) => openSheet('request', id)} onMore={openSheet} showToast={showToast} />
      )}

      {previewRecord && (
        <RecordPreviewSheet open onClose={closePreview} recordId={previewRecord} variant="record"
          onOpenRelated={openPreview} onCompare={(id) => navigate(`/legislative/${id}/versions`)}
          onRelatedSheet={() => showToast('Opening related records…')}
          onRequestAccess={(id) => openSheet('request', id)}
          onAddToCollection={(id) => openSheet('collection', id)} showToast={showToast} />
      )}
      <RequestAccessSheet open={sheet === 'request'} onClose={closeSheet} recordId={previewRecord} showToast={showToast} />
      <AddToCollectionSheet open={sheet === 'collection'} onClose={closeSheet} recordId={previewRecord} showToast={showToast} />
      <ToastHost />
    </AppShell>
  );
}

// --------------------------------------------------------------------------
function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className={styles.filterSelect}>
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={value ? styles.filterSelected : ''}>
        <option value="">{label}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown width={14} height={14} aria-hidden />
    </label>
  );
}

// --------------------------------------------------------------------------
interface ListProps {
  records: LegislativeRecord[]; versions: Parameters<typeof recordVersionStatus>[1]; billContent: Parameters<typeof recordVersionStatus>[2];
  currentRole: string | null; onOpen: (id: string) => void; onRequestAccess: (id: string) => void; showToast: (m: string) => void;
}

function RepositoryList({ records, versions, billContent, currentRole, onOpen, onRequestAccess, showToast }: ListProps) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Record</th><th>Type</th><th>Year</th><th>Current Status</th><th>Official Version</th>
            <th>Directorate</th><th>Classification</th><th>Last Updated</th><th>Formats</th><th aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => {
            const vs = recordVersionStatus(r, versions, billContent);
            const access = canAccessRecord(r, currentRole);
            return (
              <tr key={r.id} className={styles.row} onClick={() => onOpen(r.id)}>
                <td>
                  <div className={styles.recCell}>
                    <span className={styles.recIcon} aria-hidden>{recordIcon(r)}</span>
                    <div>
                      <button className={styles.recTitle} onClick={(e) => { e.stopPropagation(); onOpen(r.id); }}>{r.title}</button>
                      <span className={styles.recRef}>{r.citation ?? r.reference}</span>
                    </div>
                  </div>
                </td>
                <td>{r.recordSource === 'Historical scan' ? 'Historical scan' : r.workflowType}</td>
                <td>{r.year}</td>
                <td><StatusBadge tone={vs.tone} size="sm">{r.recordSource === 'Historical scan' ? (r.ocrStatus === 'Verified' ? 'OCR verified' : 'OCR pending') : r.stage}</StatusBadge></td>
                <td className={styles.versionCell}>Version {vs.version}</td>
                <td>{dirShort(r.directorate)}</td>
                <td>{r.restricted ? <span className={styles.restrictedTag}><Lock width={11} height={11} /> Restricted</span> : visLabel(r)}</td>
                <td className={styles.nowrap}>{fmt(r.lastUpdated)}</td>
                <td>{access ? <FormatChips formats={deriveFormats(r)} max={3} /> : <span className={styles.dash}>—</span>}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <Popover label="Record actions" align="left" trigger={({ toggle, ref }) => (
                    <button ref={ref} className={styles.rowMore} onClick={toggle} aria-label="Record actions"><MoreVertical width={16} height={16} /></button>
                  )}>
                    {(close) => (
                      <div className={styles.menu} onClick={close}>
                        <button className={styles.menuItem} onClick={() => onOpen(r.id)}>Preview record</button>
                        <button className={styles.menuItem} onClick={() => onOpen(r.id)}>Open record</button>
                        {access
                          ? <button className={styles.menuItem} onClick={() => showToast('Preparing official output for download…')}>Download official output</button>
                          : <button className={styles.menuItem} onClick={() => onRequestAccess(r.id)}>Request access</button>}
                      </div>
                    )}
                  </Popover>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// --------------------------------------------------------------------------
interface CardProps extends ListProps { onMore: (name: string, id: string) => void; }

function RepositoryCards({ records, versions, billContent, currentRole, onOpen, onRequestAccess, onMore, showToast }: CardProps) {
  return (
    <ul className={styles.cardGrid}>
      {records.map((r) => {
        const vs = recordVersionStatus(r, versions, billContent);
        const access = canAccessRecord(r, currentRole);
        const restricted = r.restricted && !access;
        const isScan = r.recordSource === 'Historical scan';
        return (
          <li key={r.id} className={`${styles.card} ${restricted ? styles.cardRestricted : ''}`}>
            <div className={styles.cardTop}>
              <span className={`${styles.cardIcon} ${styles['tone_' + vs.tone]}`} aria-hidden>{recordIcon(r)}</span>
              <div className={styles.cardPills}>
                <span className={styles.typePill}>{isScan ? 'Historical Scan' : r.workflowType}</span>
                <StatusBadge tone={isScan ? 'grey' : vs.tone} size="sm" icon={vs.tone === 'green' && !isScan ? <Check width={10} height={10} /> : isScan ? <ScanLine width={10} height={10} /> : undefined}>
                  {isScan ? (r.ocrStatus === 'Verified' ? 'OCR Verified' : 'OCR Pending') : vs.label}
                </StatusBadge>
              </div>
            </div>
            <button className={styles.cardTitle} onClick={() => onOpen(r.id)}>{r.title}</button>
            <p className={styles.cardRef}>{r.citation ?? r.reference}</p>
            <p className={styles.cardMeta}>{dirShort(r.directorate)} · {r.year} · {visLabel(r)}</p>

            {restricted ? (
              <div className={styles.cardRestrictedBox}>
                <p className={styles.cardRestrictedText}><Lock width={13} height={13} /> You do not have access to this record.</p>
                <Button size="sm" variant="secondary" onClick={() => onRequestAccess(r.id)}>Request Access</Button>
              </div>
            ) : (
              <>
                <p className={styles.cardVersion}>{vs.label}: <b>Version {vs.version}</b>{isScan && r.sourceArchive ? ` · ${r.sourceArchive}` : ''}</p>
                <div className={styles.cardFormats}><FormatChips formats={deriveFormats(r)} max={4} /></div>
              </>
            )}

            <div className={styles.cardFoot}>
              <span className={styles.cardUpdated}>Updated {fmt(r.lastUpdated)}</span>
              <div className={styles.cardTools}>
                <button className={styles.cardToolBtn} onClick={() => showToast('Record saved to your research.')} aria-label="Save record"><Bookmark width={15} height={15} /></button>
                <Popover label="Record actions" align="left" trigger={({ toggle, ref }) => (
                  <button ref={ref} className={styles.cardToolBtn} onClick={toggle} aria-label="Record actions"><MoreVertical width={15} height={15} /></button>
                )}>
                  {(close) => (
                    <div className={styles.menu} onClick={close}>
                      <button className={styles.menuItem} onClick={() => onOpen(r.id)}>Preview record</button>
                      <button className={styles.menuItem} onClick={() => onMore('collection', r.id)}>Add to research collection</button>
                      {access
                        ? <button className={styles.menuItem} onClick={() => showToast('Preparing official output for download…')}>Download official output</button>
                        : <button className={styles.menuItem} onClick={() => onRequestAccess(r.id)}>Request access</button>}
                    </div>
                  )}
                </Popover>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
