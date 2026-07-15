import { useEffect, useMemo, useState } from 'react';
import {
  Sparkles, Bookmark, MoreVertical, ArrowRight, ArrowUpRight, Check, Lock, ScanLine,
  ChevronDown, X, FileSearch, Info,
} from 'lucide-react';
import { StatusBadge, Button, Popover } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import type { Passage, LegislativeRecord, GroundedAnswer, SearchMode } from '@/data/types';
import {
  passageVersionStatus, canAccessRecord, statusBucket, dirShort, visibilityOf,
  type SearchFilters,
} from './searchLogic';
import { Highlight, recordIcon, visLabel } from './shared';
import { matchTone } from '@/data/searchData';
import styles from './SearchResults.module.css';

interface Props {
  query: string;
  mode: SearchMode;
  passages: Passage[]; // already filtered
  allPassages: Passage[]; // pre-filter (for rail counts)
  answer?: GroundedAnswer;
  recordCount: number;
  fallback: boolean;
  loading: boolean;
  filters: SearchFilters;
  onToggleFilter: (group: keyof SearchFilters, value: string | number) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  sort: string;
  onSort: (s: string) => void;
  onOpenPreview: (p: Passage) => void;
  onOpenSheet: (sheet: string, ctx?: { recordId?: string; passageId?: string }) => void;
  onRequestAccess: (recordId: string) => void;
  showToast: (m: string) => void;
}

const FILTER_GROUPS: { key: keyof SearchFilters; label: string; options: (string | number)[] }[] = [
  { key: 'types', label: 'Document type', options: ['Bill', 'Motion', 'Petition', 'Question', 'Statement', 'Order Paper', 'Statutory Instrument', 'Papers Laid'] },
  { key: 'years', label: 'Year', options: [2026, 2025, 2024, 2019, 2012, 2010] },
  { key: 'statuses', label: 'Record status', options: ['Draft', 'In review', 'Approved', 'Published', 'Archived'] },
  { key: 'directorates', label: 'Directorate', options: ['DLS', 'DLPS', 'Other'] },
  { key: 'visibility', label: 'Visibility', options: ['Public', 'Internal', 'Restricted'] },
  { key: 'sources', label: 'Record source', options: ['Structured', 'Historical scan', 'Public submission'] },
];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'official', label: 'Official records first' },
  { id: 'recent', label: 'Most recent' },
];

export function SearchResults(props: Props) {
  const { query, mode, passages, allPassages, answer, recordCount, fallback, loading, filters, activeFilterCount } = props;
  const records = useDemoStore((s) => s.records);
  const versions = useDemoStore((s) => s.versions);
  const billContent = useDemoStore((s) => s.billContent);
  const currentRole = useDemoStore((s) => s.currentRole);
  const byId = useMemo(() => Object.fromEntries(records.map((r) => [r.id, r])), [records]);

  // Count how many results each filter option would yield (pre-that-filter).
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const g of FILTER_GROUPS) {
      for (const opt of g.options) {
        map[`${g.key}:${opt}`] = allPassages.filter((p) => matchesOption(byId[p.recordId], g.key, opt)).length;
      }
    }
    return map;
  }, [allPassages, byId]);

  const activeChips = buildActiveChips(filters);

  // "Hide summary" genuinely hides the grounded panel; reset when the query changes.
  const [summaryHidden, setSummaryHidden] = useState(false);
  useEffect(() => setSummaryHidden(false), [query, mode]);

  return (
    <div className={styles.layout}>
      {/* Filter rail */}
      <aside className={styles.rail} aria-label="Refine results">
        <div className={styles.railHead}>
          <p className={styles.railTitle}>Refine results</p>
          {activeFilterCount > 0 && <button className={styles.clearBtn} onClick={props.onClearFilters}>Clear all</button>}
        </div>
        {FILTER_GROUPS.map((g) => (
          <fieldset key={g.key} className={styles.filterGroup}>
            <legend className={styles.filterLegend}>{g.label}</legend>
            {g.options.map((opt) => {
              const n = counts[`${g.key}:${opt}`] ?? 0;
              const checked = (filters[g.key] as Set<string | number>).has(opt);
              if (n === 0 && !checked) return null;
              return (
                <label key={String(opt)} className={styles.filterOpt}>
                  <input type="checkbox" checked={checked} onChange={() => props.onToggleFilter(g.key, opt)} />
                  <span className={styles.filterOptLabel}>{opt}</span>
                  <span className={styles.filterCount}>{n}</span>
                </label>
              );
            })}
          </fieldset>
        ))}
      </aside>

      {/* Results column */}
      <div className={styles.results}>
        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className={styles.chips}>
            {activeChips.map((c) => (
              <button key={`${c.group}:${c.value}`} className={styles.chip} onClick={() => props.onToggleFilter(c.group, c.value)}>
                {c.label} <X width={12} height={12} />
              </button>
            ))}
            <button className={styles.clearChips} onClick={props.onClearFilters}>Clear all</button>
          </div>
        )}

        {/* Grounded answer */}
        {loading ? (
          <div className={styles.summarySkeleton} aria-hidden>
            <div className={styles.skelLine} style={{ width: '40%' }} />
            <div className={styles.skelLine} style={{ width: '92%' }} />
            <div className={styles.skelLine} style={{ width: '85%' }} />
          </div>
        ) : answer && mode !== 'exact' && !summaryHidden ? (
          <GroundedAnswerPanel answer={answer} onOpenPassage={(rid, pid) => props.onOpenSheet('__preview', { recordId: rid, passageId: pid })}
            onEvidence={() => props.onOpenSheet('evidence')} onCopy={() => props.showToast('Summary copied with references.')}
            onSave={() => props.onOpenSheet('save')} onHide={() => setSummaryHidden(true)} />
        ) : answer && mode !== 'exact' && summaryHidden ? (
          <button className={styles.showSummary} onClick={() => setSummaryHidden(false)}><Sparkles width={13} height={13} /> Show summary from legislative records</button>
        ) : null}

        {/* Result count + sort */}
        <div className={styles.resultsHead}>
          <p className={styles.count} aria-live="polite">
            {loading ? 'Searching…' : `${passages.length} result${passages.length === 1 ? '' : 's'} across ${recordCount} legislative record${recordCount === 1 ? '' : 's'}`}
          </p>
          <div className={styles.sortWrap}>
            <span className={styles.sortLabel}>Sort by</span>
            <Popover label="Sort results" trigger={({ toggle, ref }) => (
              <button ref={ref} className={styles.sortBtn} onClick={toggle}>{SORT_OPTIONS.find((s) => s.id === props.sort)?.label} <ChevronDown width={14} height={14} /></button>
            )}>
              {(close) => (
                <div className={styles.menu} onClick={close}>
                  {SORT_OPTIONS.map((s) => <button key={s.id} className={`${styles.menuItem} ${props.sort === s.id ? styles.menuItemActive : ''}`} onClick={() => props.onSort(s.id)}>{s.label}</button>)}
                </div>
              )}
            </Popover>
          </div>
        </div>

        {fallback && !loading && (
          <div className={styles.notice}><Info width={15} height={15} /> Showing a general set of records — no exact match for “{query}”. Try Meaning &amp; Context or a broader phrase.</div>
        )}

        {/* Results */}
        {loading ? (
          <ul className={styles.list}>
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className={styles.card}>
                <div className={styles.skelLine} style={{ width: '55%' }} />
                <div className={styles.skelLine} style={{ width: '30%', marginTop: 10 }} />
                <div className={styles.skelLine} style={{ width: '95%', marginTop: 12 }} />
                <div className={styles.skelLine} style={{ width: '80%', marginTop: 6 }} />
              </li>
            ))}
          </ul>
        ) : passages.length === 0 ? (
          <div className={styles.empty}>
            <FileSearch width={30} height={30} />
            <p className={styles.emptyTitle}>No legislative records matched this search</p>
            <p className={styles.emptyText}>Try a broader phrase, remove a filter or search by meaning and context.</p>
            <div className={styles.emptyActions}>
              <Button variant="secondary" onClick={props.onClearFilters}>Clear filters</Button>
              <Button variant="secondary" to="/repository">Browse repository</Button>
            </div>
          </div>
        ) : (
          <ul className={styles.list}>
            {passages.map((p, i) => {
              const rec = byId[p.recordId];
              if (!rec) return null;
              return (
                <ResultCard key={p.id} index={i + 1} passage={p} record={rec}
                  versionStatus={passageVersionStatus(p, rec, versions, billContent)}
                  canAccess={canAccessRecord(rec, currentRole)}
                  onOpen={() => props.onOpenPreview(p)}
                  onOpenSheet={props.onOpenSheet}
                  onRequestAccess={() => props.onRequestAccess(rec.id)}
                  showToast={props.showToast} />
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
function GroundedAnswerPanel({ answer, onOpenPassage, onEvidence, onCopy, onSave, onHide }: {
  answer: GroundedAnswer; onOpenPassage: (rid: string, pid?: string) => void; onEvidence: () => void; onCopy: () => void; onSave: () => void; onHide: () => void;
}) {
  return (
    <section className={styles.summary} aria-label="Summary from legislative records">
      <div className={styles.summaryHead}>
        <span className={styles.summaryIcon} aria-hidden><Check width={15} height={15} /></span>
        <h2 className={styles.summaryTitle}>Summary from legislative records</h2>
        <span className={styles.aiTag}><Sparkles width={12} height={12} /> AI</span>
      </div>
      {answer.paragraphs.map((para, i) => <p key={i} className={styles.summaryText}>{para}</p>)}
      <div className={styles.evidence}>
        {answer.evidence.map((ev) => (
          <button key={ev.label} className={styles.evChip} onClick={() => onOpenPassage(ev.recordId, ev.passageId)}>
            {ev.label} <ArrowUpRight width={13} height={13} />
          </button>
        ))}
      </div>
      <p className={styles.disclaimer}>This summary is provided for research assistance. Refer to the official legislative text and version status before relying on it.</p>
      <div className={styles.summaryActions}>
        <button onClick={onEvidence}>View supporting records ({answer.sourceCount})</button>
        <button onClick={onCopy}>Copy with references</button>
        <button onClick={onSave}>Save research</button>
        <button onClick={onHide}>Hide summary</button>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
function ResultCard({ index, passage, record, versionStatus, canAccess, onOpen, onOpenSheet, onRequestAccess, showToast }: {
  index: number; passage: Passage; record: LegislativeRecord; versionStatus: ReturnType<typeof passageVersionStatus>;
  canAccess: boolean; onOpen: () => void; onOpenSheet: Props['onOpenSheet']; onRequestAccess: () => void; showToast: (m: string) => void;
}) {
  const restricted = record.restricted && !canAccess;
  const isScan = record.recordSource === 'Historical scan';

  return (
    <li className={styles.card}>
      <div className={styles.cardNum} aria-hidden>{index}</div>
      <div className={styles.cardBody}>
        <div className={styles.cardHead}>
          <span className={styles.cardIcon} aria-hidden>{recordIcon(record)}</span>
          <div className={styles.cardTitleWrap}>
            <button className={styles.cardTitle} onClick={onOpen}>{record.title}</button>
            <p className={styles.cardRef}>{record.citation ?? record.reference} · {record.workflowType} · {dirShort(record.directorate)}</p>
          </div>
          <StatusBadge tone={versionStatus.tone} size="sm" icon={versionStatus.tone === 'green' ? <Check width={11} height={11} /> : undefined}>{versionStatus.label}</StatusBadge>
        </div>

        {restricted ? (
          <div className={styles.restrictedRow}>
            <p className={styles.restrictedNote}><Lock width={13} height={13} /> Restricted legislative record — clause text is not shown. This record did not contribute to the summary.</p>
            <Button size="sm" variant="secondary" leftIcon={<Lock width={13} height={13} />} onClick={onRequestAccess}>Request Access</Button>
          </div>
        ) : (
          <>
            {passage.clauseRef && <p className={styles.matchLoc}>{passage.clauseRef}</p>}
            <p className={styles.excerpt}>
              {isScan && <span className={styles.scanTag}><ScanLine width={12} height={12} /> {record.ocrStatus === 'Verified' ? 'OCR verified' : 'OCR awaiting verification'}</span>}
              <Highlight text={passage.excerpt} terms={passage.highlights} />
            </p>
            <div className={styles.metaRow}>
              <StatusBadge tone={matchTone[passage.matchType]} size="sm">{passage.matchType}</StatusBadge>
              <span className={styles.metaDot}>·</span>
              <span className={styles.metaItem}>Version {versionStatus.version}</span>
              <span className={styles.metaDot}>·</span>
              <span className={styles.metaItem}>{record.year}</span>
              <span className={styles.metaDot}>·</span>
              <span className={styles.metaItem}>{visLabel(record)}</span>
              <span className={styles.relevance} title="Relevance score">{passage.relevance}% match</span>
            </div>
            <p className={styles.why}><b>Why this matched:</b> {passage.why}</p>
            <div className={styles.cardActions}>
              <Button size="sm" variant="secondary" leftIcon={<FileSearch width={14} height={14} />} onClick={onOpen}>Open Passage</Button>
              <Button size="sm" variant="ghost" rightIcon={<ArrowRight width={13} height={13} />} to={`/legislative/${record.id}`}>Open Bill Workspace</Button>
            </div>
          </>
        )}
      </div>

      <div className={styles.cardTools}>
        <button className={styles.toolBtn} onClick={() => showToast('Result saved to your research.')} aria-label="Save result"><Bookmark width={16} height={16} /></button>
        <Popover label="More actions" align="left" trigger={({ toggle, ref }) => (
          <button ref={ref} className={styles.toolBtn} onClick={toggle} aria-label="More actions"><MoreVertical width={16} height={16} /></button>
        )}>
          {(close) => (
            <div className={styles.menu} onClick={close}>
              <button className={styles.menuItem} onClick={onOpen}>Open passage</button>
              <button className={styles.menuItem} onClick={() => onOpenSheet('compare', { passageId: passage.id })}>Compare results</button>
              <button className={styles.menuItem} onClick={() => onOpenSheet('related', { recordId: record.id })}>View related records</button>
              <button className={styles.menuItem} onClick={() => onOpenSheet('collection', { recordId: record.id, passageId: passage.id })}>Add to research collection</button>
              <button className={styles.menuItem} onClick={() => { navigator.clipboard?.writeText(`${location.origin}/#/search?record=${record.id}${passage.clauseNumber ? `&clause=${passage.clauseNumber}` : ''}`); showToast('Clause link copied.'); }}>Copy clause link</button>
            </div>
          )}
        </Popover>
      </div>
    </li>
  );
}

// --------------------------------------------------------------------------
function matchesOption(rec: LegislativeRecord | undefined, key: keyof SearchFilters, opt: string | number): boolean {
  if (!rec) return false;
  switch (key) {
    case 'types': return rec.workflowType === opt;
    case 'years': return rec.year === opt;
    case 'statuses': return statusBucket(rec) === opt;
    case 'directorates': return dirShort(rec.directorate) === opt;
    case 'visibility': return visibilityOf(rec) === opt;
    case 'sources': return (rec.recordSource ?? 'Structured') === opt;
    default: return false;
  }
}

function buildActiveChips(filters: SearchFilters): { group: keyof SearchFilters; value: string | number; label: string }[] {
  const chips: { group: keyof SearchFilters; value: string | number; label: string }[] = [];
  (Object.keys(filters) as (keyof SearchFilters)[]).forEach((group) => {
    (filters[group] as Set<string | number>).forEach((value) => chips.push({ group, value, label: String(value) }));
  });
  return chips;
}
