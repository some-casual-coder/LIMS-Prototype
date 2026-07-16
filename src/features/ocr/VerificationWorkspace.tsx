import { useMemo, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight, ZoomIn, ZoomOut, Maximize, Sun, Check, AlertTriangle, ChevronDown,
  ShieldCheck, ArrowRight,
} from 'lucide-react';
import { Button, Popover, StatusBadge } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import type { OcrPageState } from '@/data/types';
import { OcrRail } from './OcrRail';
import { ScanPage, ScanThumb } from './ScanPage';
import { confidenceMeta } from './ocrShared';
import { LowConfidenceIssueSheet, CompleteVerificationSheet } from './ocrSheets';
import { useToast } from '@/features/search/Toast';
import styles from './VerificationWorkspace.module.css';

const PAGE_STATE_META: Record<OcrPageState, { label: string; tone: string }> = {
  verified: { label: 'Verified', tone: 'green' },
  'in-progress': { label: 'In progress', tone: 'gold' },
  'needs-review': { label: 'Needs review', tone: 'red' },
  'not-reviewed': { label: 'Not reviewed', tone: 'grey' },
  missing: { label: 'Missing', tone: 'red' },
};

export function VerificationWorkspace() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const jobs = useDemoStore((s) => s.ocrJobs);
  const navigate = useNavigate();
  const setOcrPageState = useDemoStore((s) => s.setOcrPageState);
  const correctOcrLine = useDemoStore((s) => s.correctOcrLine);
  const confirmOcrMeta = useDemoStore((s) => s.confirmOcrMeta);
  const job = jobs.find((j) => j.id === id);
  const { showToast, ToastHost } = useToast();

  const [currentPage, setCurrentPage] = useState(7);
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [pageFilter, setPageFilter] = useState('All Statuses');
  const [severityFilter, setSeverityFilter] = useState('All severity');
  const [tab, setTab] = useState<'Transcription' | 'Structure' | 'Metadata' | 'Issues'>('Transcription');
  const [enhanced, setEnhanced] = useState(true);
  const [showRegions, setShowRegions] = useState(true);
  const [zoom, setZoom] = useState(100);

  const sheet = params.get('sheet') ?? '';
  const issueId = params.get('issue') ?? '';

  const page = job?.pages?.find((p) => p.n === currentPage);
  const pageIssues = useMemo(() => (job?.issues ?? []).filter((i) => i.page === currentPage), [job, currentPage]);
  const openPageIssues = pageIssues.filter((i) => i.status === 'open');
  const shownIssues = openPageIssues.filter((i) => {
    if (severityFilter === 'Blocking') return i.severity === 'blocking';
    if (severityFilter === 'Review required') return i.severity === 'review';
    if (severityFilter === 'Informational') return i.severity === 'info';
    return true;
  });
  const activeIssue = (job?.issues ?? []).find((i) => i.id === issueId);

  if (!job || !job.pages) {
    return (
      <div className={styles.screen}><OcrRail /><div className={styles.main}><div className={styles.notFound}><p>This verification job is not available.</p><Button variant="secondary" to="/archive/ocr">Return to Queue</Button></div></div></div>
    );
  }

  const verified = job.pages.filter((p) => p.state === 'verified').length;
  const pct = Math.round((verified / job.pageCount) * 100);

  const openSheet = (name: string, extra?: Record<string, string>) => setParams((p) => { p.set('sheet', name); if (extra) Object.entries(extra).forEach(([k, v]) => p.set(k, v)); return p; });
  const closeSheet = () => setParams((p) => { p.delete('sheet'); p.delete('issue'); return p; }, { replace: true });

  function beginEdit(lineId: string, text: string) {
    setActiveLineId(lineId);
    setEditingLineId(lineId);
    setEditText(text);
  }
  function saveLine(lineId: string) {
    const next = editText.trim();
    if (next) correctOcrLine(job!.id, currentPage, lineId, next);
    setEditingLineId(null);
    showToast(next ? 'Correction saved to the verification history.' : 'No change made.');
  }

  function markVerified() {
    setOcrPageState(job!.id, currentPage, 'verified');
    showToast(`Page ${currentPage} marked as verified.`);
    const next = job!.pages!.find((p) => p.n > currentPage && p.state !== 'verified');
    if (next) setCurrentPage(next.n);
  }
  function jumpToIssue() {
    const first = openPageIssues[0] ?? (job!.issues ?? []).find((i) => i.status === 'open');
    if (first) { setCurrentPage(first.page); setActiveLineId(first.lineId ?? null); openSheet('issue', { issue: first.id }); }
    else showToast('No open issues remaining.');
  }

  const lines = page?.lines ?? [];

  return (
    <div className={styles.screen} role="main">
      <OcrRail />
      <div className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headTop}>
            <div className={styles.breadcrumb}>OCR &amp; Historical Records <ChevronRight width={13} height={13} /> Verification <ChevronRight width={13} height={13} /> {job.reference}</div>
            <span className={styles.autosave}><Check width={13} height={13} /> Auto-saved</span>
          </div>
          <div className={styles.headRow}>
            <div className={styles.headLeft}>
              <h1 className={styles.title}>{job.title} <StatusBadge tone="gold" size="sm">{job.status}</StatusBadge></h1>
              <p className={styles.sub}>{job.reference} · {job.recordType} · {job.sourceArchive}</p>
            </div>
            <div className={styles.progressWrap}>
              <div className={styles.progTop}><span>Verification Progress</span><span className={styles.progNum}>{verified} of {job.pageCount} pages · {pct}%</span></div>
              <div className={styles.progBar}><span className={styles.progFill} style={{ width: `${pct}%` }} /></div>
              <div className={styles.legend}>
                <span><span className={`${styles.lg} ${styles.lgGreen}`} /> Verified</span>
                <span><span className={`${styles.lg} ${styles.lgGold}`} /> In progress</span>
                <span><span className={`${styles.lg} ${styles.lgRed}`} /> Needs review</span>
                <span><span className={`${styles.lg} ${styles.lgGrey}`} /> Not reviewed</span>
              </div>
            </div>
            <div className={styles.headActions}>
              <button className={styles.hBtn} onClick={() => {
                const low = lines.filter((l) => l.low).length;
                const open = (job.issues ?? []).filter((i) => i.status === 'open').length;
                showToast(`Checks complete — ${open} open issue${open === 1 ? '' : 's'} and ${low} low-confidence line${low === 1 ? '' : 's'} on page ${currentPage}.`);
              }}><ShieldCheck width={15} height={15} /> Run Checks</button>
              <Button variant="primary" size="sm" leftIcon={<ShieldCheck width={15} height={15} />} onClick={() => openSheet('quality')}>Complete Verification</Button>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className={`${styles.body} ${openPageIssues.length === 0 ? styles.bodyNoIssues : ''}`}>
          {/* Page navigator */}
          <aside className={styles.pagesCol}>
            <div className={styles.pagesHead}>
              <span className={styles.colHead}>Pages</span>
              <Popover label="Filter pages" trigger={({ toggle, ref }) => (<button ref={ref} className={styles.miniControl} onClick={toggle}>{pageFilter} <ChevronDown width={12} height={12} /></button>)}>
                {(close) => (<div className={styles.menu} onClick={close}>{['All Statuses', 'Needs Review', 'Low Confidence', 'Verified'].map((o) => <button key={o} className={`${styles.menuItem} ${pageFilter === o ? styles.menuItemActive : ''}`} onClick={() => setPageFilter(o)}>{o}</button>)}</div>)}
              </Popover>
            </div>
            <div className={styles.pageList}>
              {job.pages.filter((p) => {
                if (pageFilter === 'Verified') return p.state === 'verified';
                if (pageFilter === 'Needs Review') return p.state === 'needs-review';
                if (pageFilter === 'Low Confidence') return p.confidence < 90;
                return true;
              }).map((p) => {
                const meta = PAGE_STATE_META[p.state];
                return (
                  <button key={p.n} className={`${styles.pageItem} ${p.n === currentPage ? styles.pageActive : ''}`} onClick={() => { setCurrentPage(p.n); setActiveLineId(null); }}>
                    <span className={styles.pageThumb}><ScanThumb pageNumber={p.n} /></span>
                    <span className={styles.pageInfo}>
                      <span className={styles.pageNo}>{p.n}</span>
                      <span className={styles.pageConf}>{p.confidence}%</span>
                      <StatusBadge tone={meta.tone as never} size="sm">{meta.label}</StatusBadge>
                      {p.issues > 0 && <span className={styles.pageIssues}>{p.issues} issue{p.issues === 1 ? '' : 's'}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            <button className={styles.jumpBtn} onClick={jumpToIssue}><AlertTriangle width={14} height={14} /> Jump to issue <span className={styles.jumpN}>{(job.issues ?? []).filter((i) => i.status === 'open').length}</span></button>
          </aside>

          {/* Scan viewer */}
          <section className={styles.scanCol}>
            <div className={styles.scanToolbar}>
              <button onClick={() => setZoom((z) => Math.max(60, z - 10))} aria-label="Zoom out"><ZoomOut width={15} height={15} /></button>
              <span className={styles.zoomVal}>{zoom}%</span>
              <button onClick={() => setZoom((z) => Math.min(160, z + 10))} aria-label="Zoom in"><ZoomIn width={15} height={15} /></button>
              <button onClick={() => setZoom(100)} aria-label="Fit page"><Maximize width={15} height={15} /></button>
              <button onClick={() => setEnhanced((e) => !e)} aria-label="Contrast"><Sun width={15} height={15} /></button>
              <span className={styles.tbDivider} />
              <div className={styles.toggle}>
                <button className={!enhanced ? styles.toggleActive : ''} onClick={() => setEnhanced(false)}>Original</button>
                <button className={enhanced ? styles.toggleActive : ''} onClick={() => setEnhanced(true)}>Enhanced</button>
              </div>
              <label className={styles.regionToggle}>
                <span>Show regions</span>
                <input type="checkbox" checked={showRegions} onChange={(e) => setShowRegions(e.target.checked)} />
              </label>
            </div>
            <div className={styles.scanScroll}>
              <div className={styles.scanZoom} style={{ width: `${zoom}%` }}>
                <ScanPage lines={lines} pageNumber={currentPage} enhanced={enhanced} showRegions={showRegions} activeLineId={activeLineId} onSelectRegion={(lid) => { setActiveLineId(lid); const iss = pageIssues.find((i) => i.lineId === lid && i.status === 'open'); if (iss) openSheet('issue', { issue: iss.id }); }} />
              </div>
            </div>
            <div className={styles.floatBar}>
              <button onClick={() => setZoom((z) => Math.max(60, z - 10))} aria-label="Zoom out"><ZoomOut width={15} height={15} /></button>
              <button onClick={() => setZoom((z) => Math.min(160, z + 10))} aria-label="Zoom in"><ZoomIn width={15} height={15} /></button>
              <button className={styles.fitBtn} onClick={() => setZoom(100)}>Fit page</button>
            </div>
          </section>

          {/* Transcription / tabs */}
          <section className={styles.textCol}>
            <div className={styles.tabs} role="tablist">
              {(['Transcription', 'Structure', 'Metadata', 'Issues'] as const).map((t) => (
                <button key={t} role="tab" aria-selected={tab === t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
                  {t}{t === 'Issues' && openPageIssues.length > 0 && <span className={styles.tabBadge}>{openPageIssues.length}</span>}
                </button>
              ))}
            </div>

            {tab === 'Transcription' && (
              <>
                <div className={styles.textSub}><span>Page {currentPage} of {job.pageCount} · {page?.confidence}% confidence</span></div>
                <div className={styles.textBody}>
                  {lines.map((l) => {
                    const showConf = l.kind !== 'page-number' && l.kind !== 'title';
                    const cm = confidenceMeta(l.confidence);
                    const editing = editingLineId === l.id;
                    return (
                      <div key={l.id} className={`${styles.exLine} ${activeLineId === l.id ? styles.exActive : ''} ${l.low ? styles.exLow : ''} ${editing ? styles.exEditing : ''}`}>
                        <span className={styles.exNo}>{l.n}</span>
                        {editing ? (
                          <div className={styles.exEdit}>
                            <textarea
                              className={styles.exInput}
                              value={editText}
                              autoFocus
                              rows={2}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveLine(l.id); if (e.key === 'Escape') setEditingLineId(null); }}
                              aria-label={`Correct line ${l.n}`}
                            />
                            <div className={styles.exEditActions}>
                              <button className={styles.exSave} onClick={() => saveLine(l.id)}>Save correction</button>
                              <button className={styles.exCancel} onClick={() => setEditingLineId(null)}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button className={styles.exText} onClick={() => beginEdit(l.id, l.text)} title="Click to correct this line">
                            {l.low && <AlertTriangle width={12} height={12} className={styles.exWarn} />}{l.text}
                            {l.corrected && <span className={styles.exCorrected}>corrected</span>}
                          </button>
                        )}
                        {showConf && !editing && <span className={`${styles.confChip} ${styles['cc_' + cm.tone]}`}>{l.confidence}%</span>}
                      </div>
                    );
                  })}
                </div>
                <div className={styles.confLegend}>
                  <span><span className={styles.dotGreen} /> High (≥90%)</span>
                  <span><span className={styles.dotAmber} /> Medium (70–89%)</span>
                  <span><span className={styles.dotRed} /> Low (&lt;70%)</span>
                </div>
              </>
            )}

            {tab === 'Structure' && (
              <div className={styles.tabBody}>
                <ul className={styles.structList}>
                  {(job.structure ?? []).map((n) => (
                    <li key={n.id}>
                      <div className={styles.structRow}><span>{n.label}</span>{n.confirmed ? <StatusBadge tone="green" size="sm">Confirmed</StatusBadge> : <StatusBadge tone="gold" size="sm">Suggested</StatusBadge>}</div>
                      {n.children?.map((c) => <div key={c.id} className={`${styles.structRow} ${styles.structChild}`}><span>{c.label}</span></div>)}
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" size="sm" onClick={() => showToast('Structure confirmed for this page.')}>Confirm structure</Button>
              </div>
            )}

            {tab === 'Metadata' && (
              <div className={styles.tabBody}>
                <ul className={styles.metaList}>
                  {(job.metadata ?? []).map((m) => (
                    <li key={m.field} className={styles.metaRow}>
                      <div><span className={styles.metaField}>{m.field}</span><span className={styles.metaValue}>{m.value}</span></div>
                      <div className={styles.metaRight}>
                        <StatusBadge tone={m.state === 'Confirmed' ? 'green' : m.state === 'Needs Review' ? 'red' : 'gold'} size="sm">{m.state}</StatusBadge>
                        {m.state !== 'Confirmed' && <button className={styles.confirmBtn} onClick={() => { confirmOcrMeta(job.id, m.field); showToast(`${m.field} confirmed.`); }}>Confirm</button>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === 'Issues' && (
              <div className={styles.tabBody}>
                <IssueList issues={pageIssues} onReview={(iid) => openSheet('issue', { issue: iid })} />
              </div>
            )}
          </section>

          {/* Issues rail */}
          {openPageIssues.length > 0 && (
            <aside className={styles.issuesCol}>
              <div className={styles.issuesHead}>
                <div><p className={styles.colHead}>Issues</p><p className={styles.issuesSub}>{shownIssues.length} issue{shownIssues.length === 1 ? '' : 's'} on this page</p></div>
                <Popover label="Severity" trigger={({ toggle, ref }) => (<button ref={ref} className={styles.miniControl} onClick={toggle}>{severityFilter} <ChevronDown width={12} height={12} /></button>)}>
                  {(close) => (<div className={styles.menu} onClick={close}>{['All severity', 'Blocking', 'Review required', 'Informational'].map((o) => <button key={o} className={`${styles.menuItem} ${severityFilter === o ? styles.menuItemActive : ''}`} onClick={() => setSeverityFilter(o)}>{o}</button>)}</div>)}
                </Popover>
              </div>
              <div className={styles.issueCards}><IssueList issues={shownIssues} compact onReview={(iid) => openSheet('issue', { issue: iid })} /></div>
              <div className={styles.pageConfFoot}><span>Page confidence</span><button className={styles.viewDetails} onClick={() => showToast(`${openPageIssues.length} low-confidence regions on this page.`)}>View details</button></div>
            </aside>
          )}
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <span className={styles.footNote}><ShieldCheck width={15} height={15} /> You are reviewing machine-extracted text. Please verify carefully. All corrections are saved to the verification history.</span>
          <div className={styles.footActions}>
            <Button variant="secondary" size="sm" onClick={() => { showToast('Progress saved — corrections are in the verification history.'); navigate('/archive/ocr'); }}>Save &amp; Close</Button>
            <Button variant="primary" size="sm" leftIcon={<Check width={15} height={15} />} onClick={markVerified}>Mark Page as Verified</Button>
          </div>
        </footer>
      </div>

      <LowConfidenceIssueSheet open={sheet === 'issue'} onClose={closeSheet} job={job} issue={activeIssue}
        onNext={() => { const remaining = (job.issues ?? []).filter((i) => i.status === 'open' && i.id !== issueId); if (remaining[0]) { setActiveLineId(remaining[0].lineId ?? null); setCurrentPage(remaining[0].page); setParams((p) => { p.set('issue', remaining[0].id); return p; }); } else closeSheet(); }}
        showToast={showToast} />
      <CompleteVerificationSheet open={sheet === 'quality'} onClose={closeSheet} job={job} showToast={showToast} />
      <ToastHost />
    </div>
  );
}

function IssueList({ issues, onReview }: { issues: { id: string; type: string; title: string; location: string; confidence?: number; originalOcr?: string; explanation?: string; severity: string }[]; compact?: boolean; onReview: (id: string) => void }) {
  if (issues.length === 0) return <p className={styles.noIssues}><Check width={15} height={15} /> No open issues on this page.</p>;
  return (
    <ul className={styles.issueList}>
      {issues.map((i) => (
        <li key={i.id} className={styles.issueCard}>
          <div className={styles.issueTop}>
            <span className={`${styles.issueDot} ${i.severity === 'info' ? styles.issueDotInfo : ''}`} />
            <span className={styles.issueType}>{i.title}</span>
            {i.confidence != null && <span className={styles.issueConf}>{i.confidence}%</span>}
          </div>
          <p className={styles.issueLoc}>{i.location}</p>
          {(i.originalOcr || i.explanation) && <p className={styles.issueSnippet}>{i.explanation ?? `“${(i.originalOcr ?? '').slice(0, 70)}…”`}</p>}
          <button className={styles.reviewBtn} onClick={() => onReview(i.id)}>Review <ArrowRight width={13} height={13} /></button>
        </li>
      ))}
    </ul>
  );
}
