import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Check, Loader2, Circle, ShieldCheck, Pause, Play, FastForward, FileText, ChevronRight,
  Info, ArrowRight, ArrowLeft,
} from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import type { OcrStructureNode } from '@/data/types';
import { ocrPipeline } from '@/data/ocrData';
import { OcrRail } from './OcrRail';
import { ScanPage, ScanThumb } from './ScanPage';
import { confidenceMeta } from './ocrShared';
import styles from './OcrProcessing.module.css';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}

const flatStructure = (nodes: OcrStructureNode[]): OcrStructureNode[] =>
  nodes.flatMap((n) => [n, ...(n.children ?? [])]);

export function OcrProcessing() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const fresh = params.get('fresh') === '1';
  const navigate = useNavigate();
  const jobs = useDemoStore((s) => s.ocrJobs);
  const job = jobs.find((j) => j.id === id);
  const reduced = usePrefersReducedMotion();

  const focusPage = job?.pages?.find((p) => p.n === 7) ?? job?.pages?.[0];
  const lines = focusPage?.lines ?? [];
  const structureFlat = useMemo(() => flatStructure(job?.structure ?? []), [job]);
  const metaFields = job?.metadata ?? [];

  const animate = fresh && !reduced && !!focusPage;
  const [stageIdx, setStageIdx] = useState(animate ? 0 : 6);
  const [band, setBand] = useState<number | null>(null);
  const [revealUpTo, setRevealUpTo] = useState(animate ? -1 : lines.length - 1);
  const [structureN, setStructureN] = useState(animate ? 0 : structureFlat.length);
  const [metaN, setMetaN] = useState(animate ? 0 : metaFields.length);
  const [progress, setProgress] = useState(animate ? 0 : 100);
  const [paused, setPaused] = useState(false);
  const timers = useRef<number[]>([]);

  function finish() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStageIdx(6); setBand(null); setRevealUpTo(lines.length - 1);
    setStructureN(structureFlat.length); setMetaN(metaFields.length); setProgress(100);
  }

  useEffect(() => {
    if (!animate || paused) return;
    const t: number[] = [];
    const at = (ms: number, fn: () => void) => { t.push(window.setTimeout(fn, ms)); };
    const n = lines.length;
    let cursor = 0;
    at(cursor, () => { setStageIdx(0); setProgress(6); });
    cursor += 800; at(cursor, () => { setStageIdx(1); setProgress(20); });
    cursor += 1000; at(cursor, () => { setStageIdx(2); setBand(8); });
    const per = 150;
    for (let i = 0; i < n; i++) {
      cursor += per;
      const idx = i;
      at(cursor, () => {
        setRevealUpTo(idx);
        setBand(8 + (idx / Math.max(1, n - 1)) * 82);
        setProgress(24 + Math.round((idx / Math.max(1, n - 1)) * 44));
      });
    }
    cursor += 300; at(cursor, () => { setStageIdx(3); setBand(null); setProgress(74); });
    for (let s = 0; s < structureFlat.length; s++) { cursor += 110; const k = s; at(cursor, () => setStructureN(k + 1)); }
    cursor += 250; at(cursor, () => { setStageIdx(4); setProgress(84); });
    for (let m = 0; m < metaFields.length; m++) { cursor += 120; const k = m; at(cursor, () => setMetaN(k + 1)); }
    cursor += 300; at(cursor, () => { setStageIdx(5); setProgress(93); });
    cursor += 900; at(cursor, () => { finish(); });
    timers.current = t;
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, paused]);

  if (!job) return <NotFound navigate={navigate} />;

  // Non-primary processing jobs show a compact status panel (no rich page data).
  if (!focusPage) return <ProcessingStatusPanel jobTitle={job.title} reference={job.reference} step={job.processingStep} progress={job.processingProgress ?? 0} pages={job.pageCount} jobId={job.id} navigate={navigate} />;

  const done = stageIdx >= 6;
  const currentPageLabel = done ? job.pageCount : 7;
  const overall = job.ocrConfidence || 91;

  return (
    <div className={styles.screen}>
      <OcrRail />
      <div className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.breadcrumb}>OCR &amp; Historical Records <ChevronRight width={13} height={13} /> Processing <ChevronRight width={13} height={13} /> {job.reference}</div>
          <div className={styles.headerRow}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>{job.title} <span className={styles.statusPill}>{done ? 'Processing complete' : 'Processing'}</span></h1>
              <p className={styles.sub}>{job.reference} · {job.recordType} · {job.sourceArchive}</p>
            </div>
            <div className={styles.headerMid}>
              <span className={styles.safeDot} aria-hidden />
              <span>You may leave this page.<br /><span className={styles.safeSub}>Processing will continue securely in the background.</span></span>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.hBtn} onClick={() => navigate(`/repository/historical-records/${job.reference.replace(/\//g, '-')}`)}><Info width={15} height={15} /> View Job Details</button>
              {!done && animate && (
                <>
                  <button className={styles.hBtn} onClick={() => setPaused((p) => !p)}>{paused ? <><Play width={15} height={15} /> Resume</> : <><Pause width={15} height={15} /> Pause Demo</>}</button>
                  <button className={styles.hBtn} onClick={finish}><FastForward width={15} height={15} /> Skip</button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Pipeline */}
        <div className={styles.pipeline}>
          <div className={styles.stages}>
            {ocrPipeline.map((st, i) => {
              const state = i < stageIdx ? 'done' : i === stageIdx ? 'active' : 'upcoming';
              return (
                <div key={st.id} className={`${styles.stage} ${styles['st_' + state]}`}>
                  <span className={styles.stageIcon}>
                    {state === 'done' ? <Check width={15} height={15} /> : state === 'active' ? <Loader2 width={15} height={15} className="spin" /> : <Circle width={13} height={13} />}
                  </span>
                  <span className={styles.stageText}>
                    <span className={styles.stageLabel}>{i + 1}. {st.label}</span>
                    <span className={styles.stageDetail}>{i === 2 && !done ? `Page ${currentPageLabel} of ${job.pageCount}` : st.detail}</span>
                  </span>
                </div>
              );
            })}
          </div>
          {done ? (
            <div className={styles.completeCard}>
              <span className={styles.shield}><ShieldCheck width={22} height={22} /></span>
              <div>
                <p className={styles.completeTitle}>Processing complete</p>
                <p className={styles.completeMeta}>{job.pageCount} pages extracted · {job.lowConfidenceRegions} regions require human verification</p>
                <div className={styles.completeActions}>
                  <button className={styles.beginBtn} onClick={() => navigate(`/archive/ocr/jobs/${job.id}/verify`)}>Begin Verification <ArrowRight width={15} height={15} /></button>
                  <button className={styles.returnBtn} onClick={() => navigate('/archive/ocr')}>Return to Queue</button>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.progressCard}>
              <span className={styles.progShield}><ShieldCheck width={20} height={20} /></span>
              <div className={styles.progGrid}>
                <div><span className={styles.progBig}>{progress}%</span><span className={styles.progLbl}>Overall Progress</span></div>
                <div><span className={styles.progNum}>7 / 12</span><span className={styles.progLbl}>Pages completed</span></div>
                <div><span className={styles.progNum}>428</span><span className={styles.progLbl}>Text regions detected</span></div>
                <div><span className={styles.progNum}>{job.lowConfidenceRegions}</span><span className={styles.progLbl}>Low-confidence regions</span></div>
              </div>
            </div>
          )}
        </div>

        {/* 4 columns */}
        <div className={styles.cols}>
          {/* Pages */}
          <aside className={styles.pagesCol}>
            <p className={styles.colHead}>Pages</p>
            <div className={styles.pageStack}>
              {job.pages!.map((p) => {
                const complete = done || p.n < 7;
                const active = !done && p.n === 7;
                return (
                  <div key={p.n} className={`${styles.pageThumb} ${active ? styles.pageActive : ''}`}>
                    <span className={styles.pageThumbInner}><ScanThumb pageNumber={p.n} /></span>
                    <span className={styles.pageThumbNo}>{p.n}</span>
                    {complete && <span className={styles.pageDone}><Check width={11} height={11} /></span>}
                    {active && <span className={styles.pageBusy}><Loader2 width={11} height={11} className="spin" /></span>}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Source scan */}
          <section className={styles.scanCol}>
            <ScanPage lines={lines} pageNumber={7} band={band} scanning={!done && stageIdx === 2} showRegions={done} />
            <div className={styles.scanToolbar}>
              <span>100%</span><span className={styles.tbDivider} />
              <button onClick={() => {}} aria-label="Fit">Fit</button>
              <span className={styles.tbToggle}><button className={styles.tbActive}>Enhanced</button></span>
            </div>
          </section>

          {/* Extracted text */}
          <section className={styles.textCol}>
            <div className={styles.colHeadRow}><p className={styles.colHead}>Extracted Text</p>{!done && <span className={styles.live}><span className={styles.liveDot} /> Live extraction</span>}</div>
            <div className={styles.textBody}>
              {lines.map((l, i) => {
                if (revealUpTo >= 0 && i > revealUpTo) return null;
                const showConf = l.kind === 'body' || l.kind === 'subheading' || l.kind === 'heading';
                const cm = confidenceMeta(l.confidence);
                return (
                  <p key={l.id} className={`${styles.exLine} ${styles['ex_' + l.kind]} ${l.low ? styles.exLow : ''}`}>
                    <span>{l.text}</span>
                    {showConf && <span className={`${styles.confChip} ${styles['cc_' + cm.tone]}`}>{l.confidence}%</span>}
                  </p>
                );
              })}
            </div>
            <div className={styles.confLegend}>
              <span><span className={styles.dotGreen} /> High (90%+)</span>
              <span><span className={styles.dotAmber} /> Medium (70–89%)</span>
              <span><span className={styles.dotRed} /> Low (&lt;70%)</span>
            </div>
          </section>

          {/* Structure + Metadata + Confidence */}
          <aside className={styles.rightCol}>
            <div className={styles.rcCard}>
              <div className={styles.colHeadRow}><p className={styles.colHead}>Detected Structure</p><span className={styles.rcMeta}>{job.structure?.length ?? 0} sections</span></div>
              <ul className={styles.structTree}>
                {structureFlat.map((node, i) => {
                  if (i >= structureN) return null;
                  return (
                    <li key={node.id} className={`${styles.structNode} ${node.kind === 'subsection' ? styles.structChild : ''}`}>
                      <FileText width={12} height={12} /> {node.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className={styles.rcCard}>
              <div className={styles.colHeadRow}><p className={styles.colHead}>Suggested Metadata</p><span className={styles.rcMeta}>{metaFields.length} detected</span></div>
              <dl className={styles.metaList}>
                {metaFields.map((m, i) => {
                  if (i >= metaN) return null;
                  return (
                    <div key={m.field} className={styles.metaRow}>
                      <dt>{m.field}</dt>
                      <dd>{m.value} <span className={styles.suggestedChip}>Suggested</span></dd>
                    </div>
                  );
                })}
              </dl>
            </div>

            <div className={styles.rcCard}>
              <p className={styles.colHead}>Confidence Overview</p>
              <div className={styles.confOverview}>
                <Donut pct={done ? overall : Math.min(overall, Math.round(progress * 0.91))} />
                <div className={styles.confBars}>
                  <div><span className={styles.dotGreen} /> High confidence <b>79%</b></div>
                  <div><span className={styles.dotAmber} /> Medium confidence <b>16%</b></div>
                  <div><span className={styles.dotRed} /> Low confidence <b>5%</b></div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footProgress}><span className={styles.footFill} style={{ width: `${progress}%` }} /></div>
          <span className={styles.footText}>{done ? 'Processing complete — ready for verification' : `Processing page ${currentPageLabel} of ${job.pageCount} · Extracting text and detecting structure…`}</span>
          <span className={styles.jobId}>Job ID: {job.id}</span>
        </footer>
      </div>
    </div>
  );
}

function Donut({ pct }: { pct: number }) {
  const r = 26, c = 2 * Math.PI * r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className={styles.donut} aria-hidden>
      <circle cx="36" cy="36" r={r} fill="none" stroke="var(--soft-grey)" strokeWidth="7" />
      <circle cx="36" cy="36" r={r} fill="none" stroke="var(--status-success)" strokeWidth="7" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 36 36)" />
      <text x="36" y="34" textAnchor="middle" className={styles.donutPct}>{pct}%</text>
      <text x="36" y="46" textAnchor="middle" className={styles.donutSub}>Overall</text>
    </svg>
  );
}

function ProcessingStatusPanel({ jobTitle, reference, step, progress, pages, jobId, navigate }: {
  jobTitle: string; reference: string; step?: string; progress: number; pages: number; jobId: string; navigate: ReturnType<typeof useNavigate>;
}) {
  return (
    <div className={styles.screen}>
      <OcrRail />
      <div className={styles.main}>
        <div className={styles.statusPanel}>
          <span className={styles.progShield}><Loader2 width={26} height={26} className="spin" /></span>
          <h1 className={styles.title}>{jobTitle}</h1>
          <p className={styles.sub}>{reference} · Job ID {jobId}</p>
          <p className={styles.statusStep}>{step ?? 'Processing'} · {progress}%</p>
          <div className={styles.statusBar}><span className={styles.footFill} style={{ width: `${progress}%` }} /></div>
          <p className={styles.statusNote}>Your document is being processed securely. You may continue working elsewhere — {pages} pages queued.</p>
          <button className={styles.returnBtn} onClick={() => navigate('/archive/ocr')}><ArrowLeft width={15} height={15} /> Return to Queue</button>
        </div>
      </div>
    </div>
  );
}

function NotFound({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className={styles.screen}>
      <OcrRail />
      <div className={styles.main}>
        <div className={styles.statusPanel}>
          <h1 className={styles.title}>Processing job not found</h1>
          <button className={styles.returnBtn} onClick={() => navigate('/archive/ocr')}>Return to Queue</button>
        </div>
      </div>
    </div>
  );
}
