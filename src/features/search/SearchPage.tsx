import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X, SlidersHorizontal, ShieldCheck, Sparkles, Command } from 'lucide-react';
import { AppShell } from '@/components/shell';
import { Button } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import { PRIMARY_RECORD_ID } from '@/data/seed';
import type { SearchMode, Passage } from '@/data/types';
import { passages as corpus } from '@/data/searchData';
import {
  resolveResults, emptySearchFilters, passesFilters, searchFilterCount,
  type SearchFilters,
} from './searchLogic';
import { SearchLanding } from './SearchLanding';
import { SearchResults } from './SearchResults';
import { RecordPreviewSheet } from './RecordPreviewSheet';
import {
  AdvancedSearchSheet, SaveSearchSheet, EvidenceSheet, CompareResultsSheet,
  RelatedRecordsSheet, RequestAccessSheet, AddToCollectionSheet,
} from './sheets';
import { useToast } from './Toast';
import styles from './SearchPage.module.css';

const MODES: { id: SearchMode; label: string; hint: string }[] = [
  { id: 'all', label: 'All Results', hint: 'Combines keyword and meaning-based ranking.' },
  { id: 'exact', label: 'Exact Text', hint: 'Finds literal words and phrases.' },
  { id: 'meaning', label: 'Meaning & Context', hint: 'Finds conceptually related material — every result stays linked to its source.' },
  { id: 'within', label: 'Within a Record', hint: 'Search inside a single Bill or record.' },
];

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const records = useDemoStore((s) => s.records);
  const offline = useDemoStore((s) => s.offline);
  const currentRole = useDemoStore((s) => s.currentRole);
  const logRecentSearch = useDemoStore((s) => s.logRecentSearch);
  const { showToast, ToastHost } = useToast();

  const q = params.get('q')?.trim() ?? '';
  const mode = (params.get('mode') as SearchMode) || 'all';
  const sheet = params.get('sheet') ?? '';
  const previewRecord = params.get('record') ?? '';
  const previewPid = params.get('pid') ?? '';

  const [qInput, setQInput] = useState(q);
  const [filters, setFilters] = useState<SearchFilters>(emptySearchFilters());
  const [sort, setSort] = useState('relevance');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setQInput(q), [q]);

  // Brief, staged loading whenever the query or mode changes.
  useEffect(() => {
    if (!q) { setLoading(false); return; }
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 720);
    return () => window.clearTimeout(t);
  }, [q, mode]);

  // ⌘K / Ctrl-K focuses the search field.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); inputRef.current?.focus(); inputRef.current?.select(); }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const resolution = useMemo(
    () => resolveResults(q, mode, records, mode === 'within' ? PRIMARY_RECORD_ID : undefined),
    [q, mode, records],
  );
  const byId = useMemo(() => Object.fromEntries(records.map((r) => [r.id, r])), [records]);

  const filtered = useMemo(() => {
    let list = resolution.passages.filter((p) => byId[p.recordId] && passesFilters(byId[p.recordId], filters));
    if (sort === 'recent') list = [...list].sort((a, b) => +new Date(byId[b.recordId].lastUpdated) - +new Date(byId[a.recordId].lastUpdated));
    else if (sort === 'official') list = [...list].sort((a, b) => officialRank(byId[b.recordId]) - officialRank(byId[a.recordId]));
    return list;
  }, [resolution.passages, filters, sort, byId]);

  // --- Query running ---
  function runSearch(query: string, m: SearchMode = mode) {
    const next = query.trim();
    setParams((p) => {
      if (next) p.set('q', next); else p.delete('q');
      if (m !== 'all') p.set('mode', m); else p.delete('mode');
      p.delete('record'); p.delete('clause'); p.delete('pid'); p.delete('sheet');
      return p;
    });
    if (next) {
      logRecentSearch({
        id: `rs-${Date.now().toString(36)}`, query: next, mode: m,
        viewedAt: new Date().toISOString(), resultCount: resolveResults(next, m, records).passages.length,
        ownerId: currentRole ?? 'dls-drafter',
      });
    }
  }
  function setMode(m: SearchMode) {
    setParams((p) => { if (m !== 'all') p.set('mode', m); else p.delete('mode'); return p; }, { replace: true });
  }

  // --- Preview + sheets ---
  const previewPassage: Passage | undefined = useMemo(() => {
    if (!previewRecord) return undefined;
    if (previewPid) return filtered.find((p) => p.id === previewPid) ?? corpus.find((p) => p.id === previewPid);
    return filtered.find((p) => p.recordId === previewRecord);
  }, [previewRecord, previewPid, filtered]);

  const previewIndex = previewPassage ? filtered.findIndex((p) => p.id === previewPassage.id) : -1;

  function openPreview(p: Passage) {
    setParams((prev) => {
      prev.set('record', p.recordId); prev.set('pid', p.id);
      if (p.clauseNumber) prev.set('clause', String(p.clauseNumber)); else prev.delete('clause');
      prev.delete('sheet');
      return prev;
    });
  }
  function openPreviewByRecord(recordId: string, passageId?: string) {
    const p = (passageId && (filtered.find((x) => x.id === passageId) ?? corpus.find((x) => x.id === passageId)))
      || filtered.find((x) => x.recordId === recordId) || corpus.find((x) => x.recordId === recordId);
    if (p) openPreview(p);
    else setParams((prev) => { prev.set('record', recordId); prev.delete('pid'); prev.delete('clause'); prev.delete('sheet'); return prev; });
  }
  function closePreview() {
    setParams((prev) => { prev.delete('record'); prev.delete('clause'); prev.delete('pid'); return prev; }, { replace: true });
  }
  function openSheet(name: string, ctx?: { recordId?: string; passageId?: string }) {
    if (name === '__preview') { openPreviewByRecord(ctx!.recordId!, ctx?.passageId); return; }
    setParams((prev) => {
      prev.set('sheet', name);
      if (ctx?.recordId) prev.set('record', ctx.recordId);
      if (ctx?.passageId) prev.set('pid', ctx.passageId);
      return prev;
    });
  }
  function closeSheet() { setParams((prev) => { prev.delete('sheet'); return prev; }, { replace: true }); }

  function toggleFilter(group: keyof SearchFilters, value: string | number) {
    setFilters((f) => {
      const next: SearchFilters = { ...f, [group]: new Set(f[group] as Set<string | number>) };
      const set = next[group] as Set<string | number>;
      set.has(value) ? set.delete(value) : set.add(value);
      return next;
    });
  }
  const clearFilters = () => setFilters(emptySearchFilters());

  const compareIds = useMemo(() => {
    const withText = resolution.passages.filter((p) => p.excerpt && p.clauseRef);
    const seen = new Set<string>();
    const distinct = withText.filter((p) => (seen.has(p.recordId) ? false : (seen.add(p.recordId), true)));
    return distinct.slice(0, 3).map((p) => p.id);
  }, [resolution.passages]);

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    (Object.values(filters) as Set<unknown>[]).forEach((s) => s.forEach((v) => parts.push(String(v))));
    return parts.join(' · ');
  }, [filters]);

  return (
    <AppShell breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Search & Knowledge' }, { label: 'Legislative Search' }]}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Legislative Search</h1>
          <p className={styles.subtitle}>Search authoritative legislative records, clauses, versions and historical archives.</p>
        </div>
        <button className={`${styles.aiPill} ${offline ? styles.aiOffline : ''}`}
          onClick={() => showToast(offline
            ? 'Secure external AI is unavailable. Core search and repository browsing remain available; local assistance is active.'
            : 'Secure AI is available. Summaries are generated only from records you are permitted to access.')}>
          {offline ? <Sparkles width={15} height={15} /> : <ShieldCheck width={15} height={15} />}
          {offline ? 'Local assistance' : 'Secure AI'}
        </button>
      </div>

      {/* Search field */}
      <form className={styles.searchRow} role="search" onSubmit={(e) => { e.preventDefault(); runSearch(qInput); }}>
        <div className={styles.searchField}>
          <SearchIcon width={20} height={20} aria-hidden className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.searchInput}
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search by title, reference, clause, phrase or legislative question"
            aria-label="Search legislative records"
          />
          {qInput && <button type="button" className={styles.clearInput} onClick={() => { setQInput(''); inputRef.current?.focus(); }} aria-label="Clear search"><X width={16} height={16} /></button>}
          <span className={styles.kbd} aria-hidden><Command width={11} height={11} /> K</span>
        </div>
        <Button variant="secondary" leftIcon={<SlidersHorizontal width={16} height={16} />} onClick={() => openSheet('advanced')} type="button">Advanced Search</Button>
        <Button variant="primary" type="submit">Search</Button>
      </form>

      {/* Mode tabs */}
      <div className={styles.modes} role="tablist" aria-label="Search mode">
        {MODES.map((m) => (
          <button key={m.id} role="tab" aria-selected={mode === m.id} title={m.hint}
            className={`${styles.mode} ${mode === m.id ? styles.modeActive : ''}`} onClick={() => setMode(m.id)}>
            {m.label}
          </button>
        ))}
        <span className={styles.modeHint}>{MODES.find((m) => m.id === mode)?.hint}</span>
      </div>

      {/* Body */}
      {q ? (
        <SearchResults
          query={q} mode={mode}
          passages={filtered} allPassages={resolution.passages}
          answer={resolution.answer} recordCount={new Set(filtered.map((p) => p.recordId)).size}
          fallback={resolution.fallback} loading={loading}
          filters={filters} onToggleFilter={toggleFilter} onClearFilters={clearFilters}
          activeFilterCount={searchFilterCount(filters)}
          sort={sort} onSort={setSort}
          onOpenPreview={openPreview} onOpenSheet={openSheet}
          onRequestAccess={(id) => openSheet('request', { recordId: id })}
          showToast={showToast}
        />
      ) : (
        <SearchLanding onRun={(query, m) => runSearch(query, m)} />
      )}

      {/* Preview */}
      {previewRecord && (
        <RecordPreviewSheet
          open onClose={closePreview}
          recordId={previewRecord}
          passage={previewPassage}
          variant={previewPassage ? 'passage' : 'record'}
          hasPrev={previewIndex > 0} hasNext={previewIndex >= 0 && previewIndex < filtered.length - 1}
          onPrev={() => previewIndex > 0 && openPreview(filtered[previewIndex - 1])}
          onNext={() => previewIndex >= 0 && previewIndex < filtered.length - 1 && openPreview(filtered[previewIndex + 1])}
          onOpenRelated={(id) => openPreviewByRecord(id)}
          onCompare={() => openSheet('compare')}
          onRelatedSheet={(id) => openSheet('related', { recordId: id })}
          onRequestAccess={(id) => openSheet('request', { recordId: id })}
          onAddToCollection={(id, p) => openSheet('collection', { recordId: id, passageId: p?.id })}
          showToast={showToast}
        />
      )}

      {/* Side sheets */}
      <AdvancedSearchSheet open={sheet === 'advanced'} onClose={closeSheet} mode={mode} />
      <SaveSearchSheet open={sheet === 'save'} onClose={closeSheet} query={q} mode={mode} filterSummary={filterSummary} resultCount={filtered.length} showToast={showToast} />
      <EvidenceSheet open={sheet === 'evidence'} onClose={closeSheet} answer={resolution.answer} onOpenPassage={openPreviewByRecord} showToast={showToast} />
      <CompareResultsSheet open={sheet === 'compare'} onClose={closeSheet} passageIds={compareIds} />
      <RelatedRecordsSheet open={sheet === 'related'} onClose={closeSheet} recordId={previewRecord || PRIMARY_RECORD_ID} onOpen={(id) => openPreviewByRecord(id)} />
      <RequestAccessSheet open={sheet === 'request'} onClose={closeSheet} recordId={previewRecord || PRIMARY_RECORD_ID} showToast={showToast} />
      <AddToCollectionSheet open={sheet === 'collection'} onClose={closeSheet} recordId={previewRecord || PRIMARY_RECORD_ID} passage={previewPassage} showToast={showToast} />

      <ToastHost />
    </AppShell>
  );
}

// Higher = more official/authoritative → sorts first under "Official records first".
function officialRank(r: { stage: string }): number {
  const order = ['Published', 'Signed and Sealed', 'Awaiting Signature', 'Procedural Review', 'Legal Approval', 'Legal Review', 'Revision Requested', 'Drafting'];
  const i = order.indexOf(r.stage);
  return i === -1 ? 0 : order.length - i;
}
