import type {
  LegislativeRecord, Passage, GroundedAnswer, SearchMode, Version, BillContent,
} from '@/data/types';
import type { Tone } from '@/components/ui/tone';
import {
  passages, passageById, seededQueries, seededQueries as SQ, restrictedForDrafter,
} from '@/data/searchData';

export interface ResultsResolution {
  passages: Passage[];
  answer?: GroundedAnswer;
  recordCount: number;
  matchedQueryId?: string;
  fallback: boolean; // true when we returned a general set for an unknown query
}

const norm = (s: string) => s.toLowerCase().replace(/[\s/_-]+/g, '');

/** Detect a direct reference / record-id lookup (e.g. "NA/BILL/2026/015"). */
function referenceMatch(query: string, records: LegislativeRecord[]): LegislativeRecord | undefined {
  const q = norm(query.trim());
  if (q.length < 6) return undefined;
  return records.find((r) => norm(r.reference) === q || norm(r.id) === q);
}

/** Build a synthetic record-level passage for unknown queries. */
function syntheticPassage(r: LegislativeRecord, matchType: Passage['matchType'], terms: string[]): Passage {
  return {
    id: `syn-${r.id}`,
    recordId: r.id,
    matchType,
    excerpt: r.summary,
    highlights: terms.filter((t) => r.summary.toLowerCase().includes(t)),
    why: `Matched on ${matchType === 'Title' ? 'the record title' : matchType === 'Reference' ? 'the official reference' : 'record metadata'}.`,
    relevance: 60,
  };
}

/**
 * Deterministic search resolution. Known queries return seeded, hand-ranked
 * results (with a grounded answer where appropriate); unknown queries fall back
 * to a metadata match and never to an empty broken state.
 */
export function resolveResults(
  rawQuery: string,
  mode: SearchMode,
  records: LegislativeRecord[],
  withinRecordId?: string,
): ResultsResolution {
  const query = rawQuery.trim();
  const lower = query.toLowerCase();
  if (!query) return { passages: [], recordCount: 0, fallback: false };

  // 1. Direct reference lookup.
  const ref = referenceMatch(query, records);
  if (ref) {
    const own = passages.filter((p) => p.recordId === ref.id);
    const list = own.length
      ? own
      : [syntheticPassage(ref, 'Reference', [lower])];
    return { passages: list, recordCount: 1, fallback: false };
  }

  // 2. Best seeded query by trigger score.
  let best: (typeof SQ)[number] | undefined;
  let bestScore = 0;
  for (const sq of seededQueries) {
    const score = sq.keywords.reduce((n, k) => (lower.includes(k) ? n + k.length : n), 0);
    if (score > bestScore) { bestScore = score; best = sq; }
  }

  if (best) {
    let list = best.passageIds.map((id) => passageById[id]).filter(Boolean);
    if (mode === 'exact') {
      // Exact text: drop meaning-based hits.
      list = list.filter((p) => p.matchType !== 'Meaning and context' && p.matchType !== 'Related record');
    } else if (mode === 'meaning') {
      // Meaning & context: stable sort boosting conceptual matches.
      list = [...list].sort((a, b) => rankMeaning(b) - rankMeaning(a));
    }
    if (mode === 'within' && withinRecordId) list = list.filter((p) => p.recordId === withinRecordId);
    const answer = mode === 'exact' ? undefined : best.answer;
    return {
      passages: list,
      answer,
      recordCount: new Set(list.map((p) => p.recordId)).size,
      matchedQueryId: best.id,
      fallback: false,
    };
  }

  // 3. Generic metadata match.
  const terms = lower.split(/\s+/).filter((t) => t.length > 2);
  const scored = records
    .map((r) => {
      const hay = `${r.title} ${r.reference} ${r.shortTitle} ${r.summary}`.toLowerCase();
      const hits = terms.filter((t) => hay.includes(t)).length;
      const titleHit = terms.some((t) => r.title.toLowerCase().includes(t));
      return { r, hits, titleHit };
    })
    .filter((x) => x.hits > 0)
    .sort((a, b) => Number(b.titleHit) - Number(a.titleHit) || b.hits - a.hits);

  if (scored.length) {
    let list = scored.slice(0, 10).map((x) => syntheticPassage(x.r, x.titleHit ? 'Title' : 'Related record', terms));
    if (mode === 'within' && withinRecordId) list = list.filter((p) => p.recordId === withinRecordId);
    return { passages: list, recordCount: new Set(list.map((p) => p.recordId)).size, fallback: false };
  }

  // 4. Never an empty broken state — general seeded set.
  const general = records
    .filter((r) => ['Legal Review', 'Published', 'Procedural Review'].includes(r.stage))
    .slice(0, 6)
    .map((r) => syntheticPassage(r, 'Related record', terms));
  return { passages: general, recordCount: general.length, fallback: true };
}

function rankMeaning(p: Passage): number {
  const base = p.relevance;
  if (p.matchType === 'Meaning and context') return base + 6;
  if (p.matchType === 'Related record') return base + 3;
  return base;
}

// --------------------------------------------------------------------------
// Filters
// --------------------------------------------------------------------------
export interface SearchFilters {
  types: Set<string>;
  years: Set<number>;
  statuses: Set<string>; // record status buckets
  directorates: Set<string>;
  visibility: Set<string>;
  sources: Set<string>;
}

export function emptySearchFilters(): SearchFilters {
  return { types: new Set(), years: new Set(), statuses: new Set(), directorates: new Set(), visibility: new Set(), sources: new Set() };
}

export function searchFilterCount(f: SearchFilters): number {
  return f.types.size + f.years.size + f.statuses.size + f.directorates.size + f.visibility.size + f.sources.size;
}

// Coarse record-status bucket used by the filter rail.
export function statusBucket(r: LegislativeRecord): string {
  if (r.stage === 'Published') return 'Published';
  if (r.stage === 'Archived') return 'Archived';
  if (['Legal Approval', 'Procedural Review', 'Awaiting Signature', 'Signed and Sealed'].includes(r.stage)) return 'Approved';
  if (['Legal Review', 'Revision Requested'].includes(r.stage)) return 'In review';
  return 'Draft';
}

const dirShort = (d: string) =>
  d.includes('Legal Services') ? 'DLS' : d.includes('Legislative and Procedural') ? 'DLPS' : d.includes('Clerk') ? 'Clerk' : 'Other';

const visibilityOf = (r: LegislativeRecord): string =>
  r.restricted ? 'Restricted' : r.confidentiality === 'Public' ? 'Public' : r.confidentiality === 'Confidential' ? 'Confidential' : 'Internal';

export function passesFilters(r: LegislativeRecord, f: SearchFilters): boolean {
  if (f.types.size && !f.types.has(r.workflowType)) return false;
  if (f.years.size && !f.years.has(r.year)) return false;
  if (f.statuses.size && !f.statuses.has(statusBucket(r))) return false;
  if (f.directorates.size && !f.directorates.has(dirShort(r.directorate))) return false;
  if (f.visibility.size && !f.visibility.has(visibilityOf(r))) return false;
  if (f.sources.size && !f.sources.has(r.recordSource ?? 'Structured')) return false;
  return true;
}

export { dirShort, visibilityOf };

// --------------------------------------------------------------------------
// Official-version treatment (brief §22) — derived from real store data so it
// stays consistent with the Bill Workspace and never contradicts it.
// --------------------------------------------------------------------------
export interface VersionStatus { label: string; tone: Tone; caution?: string; version: string; }

export function passageVersionStatus(
  p: Passage,
  record: LegislativeRecord,
  versions: Version[],
  billContent: BillContent,
): VersionStatus {
  if (record.stage === 'Published') {
    return { label: 'Published version', tone: 'green', version: record.currentVersion };
  }
  if (record.stage === 'Archived') {
    return { label: 'Superseded version', tone: 'grey', version: record.currentVersion };
  }
  const recVersions = versions.filter((v) => v.recordId === record.id);
  const approved = recVersions
    .filter((v) => v.approvalState === 'Approved' || v.approvalState === 'Published')
    .sort((a, b) => parseFloat(b.version) - parseFloat(a.version))[0];

  // For the primary Bill, distinguish clauses changed in the working draft from
  // clauses that still reflect the latest approved text.
  if (record.isPrimary && approved && p.clauseNumber != null) {
    const clause = billContent.clauses.find((c) => c.number === p.clauseNumber);
    if (!clause?.changed) {
      return { label: 'Latest approved version', tone: 'gold', version: approved.version };
    }
    return {
      label: 'Current working version', tone: 'blue', version: record.currentVersion,
      caution: 'Not yet approved — later than the latest approved text.',
    };
  }
  if (approved) return { label: 'Latest approved version', tone: 'gold', version: approved.version };
  return { label: 'Current working version', tone: 'blue', version: record.currentVersion, caution: 'Working draft — not yet approved.' };
}

// Record-level official status (repository cards/list + record preview).
export function recordVersionStatus(record: LegislativeRecord, versions: Version[], billContent: BillContent): VersionStatus {
  return passageVersionStatus(
    { id: '', recordId: record.id, matchType: 'Title', excerpt: '', highlights: [], why: '', relevance: 0 },
    record, versions, billContent,
  );
}

export { restrictedForDrafter };

// A record's restricted content is visible to its owning-directorate roles only.
// Reviewers and the Clerk have oversight access; the drafter does not.
export function canAccessRecord(record: LegislativeRecord, role: string | null): boolean {
  return !record.restricted || role === 'dls-reviewer' || role === 'clerk';
}
