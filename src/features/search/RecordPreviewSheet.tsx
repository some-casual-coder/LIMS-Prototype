import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Bookmark, Link2, ExternalLink, GitCompare, FolderPlus,
  FileText, Check, Lock, History, ArrowRight, ShieldAlert,
} from 'lucide-react';
import { SideSheet, StatusBadge, Button } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import type { Passage, LegislativeRecord } from '@/data/types';
import { relatedRecords, deriveFormats } from '@/data/searchData';
import { passageVersionStatus, recordVersionStatus } from './searchLogic';
import { Highlight, recordIcon, FormatChips, dirLabel, visLabel } from './shared';
import styles from './RecordPreviewSheet.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  recordId: string;
  passage?: Passage;
  variant: 'passage' | 'record';
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  onOpenRelated?: (recordId: string) => void; // swap the sheet to another record
  onCompare?: (recordId: string) => void;
  onRelatedSheet?: (recordId: string) => void;
  onRequestAccess?: (recordId: string) => void;
  onAddToCollection?: (recordId: string, passage?: Passage) => void;
  showToast: (m: string) => void;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function RecordPreviewSheet(props: Props) {
  const { open, onClose, recordId, passage, variant, onPrev, onNext, hasPrev, hasNext } = props;
  const navigate = useNavigate();
  const records = useDemoStore((s) => s.records);
  const versions = useDemoStore((s) => s.versions);
  const submissions = useDemoStore((s) => s.submissions);
  const billContent = useDemoStore((s) => s.billContent);
  const currentRole = useDemoStore((s) => s.currentRole);
  const markRecentlyOpened = useDemoStore((s) => s.markRecentlyOpened);

  const record = records.find((r) => r.id === recordId);

  // Arrow-key navigation between results (search variant).
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight' && hasNext) { e.preventDefault(); onNext?.(); }
      if (e.key === 'ArrowLeft' && hasPrev) { e.preventDefault(); onPrev?.(); }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, hasNext, hasPrev, onNext, onPrev]);

  if (!open || !record) return null;

  const canAccess = !record.restricted || currentRole === 'dls-reviewer' || currentRole === 'clerk';
  const vs = passage ? passageVersionStatus(passage, record, versions, billContent) : recordVersionStatus(record, versions, billContent);
  const recVersions = versionsForDisplay(record, versions);
  const related = (relatedRecords[record.id] ?? []).map((id) => records.find((r) => r.id === id)).filter(Boolean) as LegislativeRecord[];
  const recSubs = submissions.filter((s) => s.recordId === record.id).length || record.submissionCount;

  function openWorkspace() {
    markRecentlyOpened(record!.id);
    navigate(`/legislative/${record!.id}`);
  }
  function copyLink() {
    const clause = passage?.clauseNumber ? `&clause=${passage.clauseNumber}` : '';
    navigator.clipboard?.writeText(`${location.origin}/#/search?record=${record!.id}${clause}`);
    props.showToast('Result link copied to clipboard.');
  }

  const title = record.title;
  const primaryClause = record.isPrimary && passage?.clauseNumber
    ? billContent.clauses.find((c) => c.number === passage.clauseNumber)
    : undefined;

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      size="wide"
      title={variant === 'passage' ? 'Result Preview' : 'Record Preview'}
      headerMeta={
        <div className={styles.navBtns}>
          {variant === 'passage' && (
            <>
              <button className={styles.navBtn} onClick={onPrev} disabled={!hasPrev} aria-label="Previous result"><ChevronLeft width={18} height={18} /></button>
              <button className={styles.navBtn} onClick={onNext} disabled={!hasNext} aria-label="Next result"><ChevronRight width={18} height={18} /></button>
            </>
          )}
          <button className={styles.navBtn} onClick={() => props.showToast('Saved to your research.')} aria-label="Save result"><Bookmark width={17} height={17} /></button>
          <button className={styles.navBtn} onClick={copyLink} aria-label="Copy link"><Link2 width={17} height={17} /></button>
        </div>
      }
      footer={
        <>
          <div className={styles.footerRow}>
            <Button variant="primary" block leftIcon={<ExternalLink width={16} height={16} />} onClick={openWorkspace}>
              Open Bill Workspace
            </Button>
            <Button variant="secondary" block leftIcon={<GitCompare width={16} height={16} />} onClick={() => props.onCompare?.(record.id)}>
              Compare Versions
            </Button>
          </div>
          <div className={styles.footerIcons}>
            <button onClick={() => props.onAddToCollection?.(record.id, passage)}><FolderPlus width={15} height={15} /> Add to collection</button>
            <button onClick={() => props.showToast('Preparing official PDF for download…')}><FileText width={15} height={15} /> Download PDF</button>
            <button onClick={() => navigate(`/legislative/${record.id}?tab=Activity`)}><History width={15} height={15} /> Activity</button>
          </div>
        </>
      }
    >
      {/* Identity block */}
      <div className={styles.identity}>
        <span className={`${styles.docIcon} ${styles['tone_' + vs.tone]}`} aria-hidden>{recordIcon(record)}</span>
        <div className={styles.identityText}>
          <h3 className={styles.recTitle}>{title}</h3>
          <p className={styles.recRef}>{record.reference}{record.citation ? ` · ${record.citation}` : ''} · Version {vs.version}</p>
          <div className={styles.badgeRow}>
            <StatusBadge tone={vs.tone} size="sm" icon={vs.tone === 'green' ? <Check width={12} height={12} /> : undefined}>{vs.label}</StatusBadge>
            <StatusBadge tone="grey" size="sm">{record.workflowType}</StatusBadge>
            <StatusBadge tone={record.restricted ? 'red' : 'grey'} size="sm" icon={record.restricted ? <Lock width={11} height={11} /> : undefined}>{visLabel(record)}</StatusBadge>
          </div>
          {vs.caution && <p className={styles.caution}><ShieldAlert width={13} height={13} /> {vs.caution}</p>}
        </div>
      </div>

      {/* Restricted — no content leaks */}
      {!canAccess ? (
        <div className={styles.restricted}>
          <p className={styles.restrictedTitle}><Lock width={15} height={15} /> Restricted legislative record</p>
          <p className={styles.restrictedText}>
            You can see that this record exists, but its clause text, attachments and summary are restricted to its owning directorate.
          </p>
          <dl className={styles.metaList}>
            <div><dt>Type</dt><dd>{record.workflowType}</dd></div>
            <div><dt>Owning directorate</dt><dd>{dirLabel(record.directorate)}</dd></div>
            <div><dt>Classification</dt><dd>{visLabel(record)}</dd></div>
          </dl>
          <Button variant="primary" leftIcon={<Lock width={15} height={15} />} onClick={() => props.onRequestAccess?.(record.id)}>Request Access</Button>
        </div>
      ) : (
        <>
          {variant === 'passage' && passage && (
            <>
              {passage.clauseRef && <p className={styles.passageRef}>{passage.clauseRef}</p>}
              <div className={styles.passageDoc}>
                {primaryClause ? (
                  primaryClause.paragraphs.map((para, i) => (
                    <p key={i} className={styles.passagePara}>
                      <Highlight text={para} terms={passage.highlights} />
                    </p>
                  ))
                ) : (
                  <p className={styles.passagePara}><Highlight text={passage.excerpt} terms={passage.highlights} /></p>
                )}
              </div>

              <div className={styles.whyBox}>
                <p className={styles.whyTitle}><Check width={14} height={14} /> Why this matched</p>
                <ul className={styles.whyList}>
                  <li>{passage.why}</li>
                  <li>Matched through {passage.matchType.toLowerCase()}.</li>
                </ul>
              </div>
            </>
          )}

          {variant === 'record' && (
            <>
              <dl className={styles.metaList}>
                <div><dt>Type</dt><dd>{record.workflowType}</dd></div>
                <div><dt>Directorate</dt><dd>{dirLabel(record.directorate)}</dd></div>
                <div><dt>Year</dt><dd>{record.year}</dd></div>
                <div><dt>Current status</dt><dd>{record.stage}</dd></div>
                <div><dt>Classification</dt><dd>{visLabel(record)}</dd></div>
                {record.sponsor && <div><dt>Sponsor</dt><dd>{record.sponsor}</dd></div>}
              </dl>
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Available formats</p>
                <FormatChips formats={deriveFormats(record)} />
              </div>
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Description</p>
                <p className={styles.desc}>{record.summary}</p>
              </div>
            </>
          )}

          {/* Record status (passage variant) */}
          {variant === 'passage' && (
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Record status</p>
              <p className={styles.statusLine}>
                <StatusBadge tone={vs.tone} size="sm">{vs.label}</StatusBadge>
                {recVersions[0] && <span className={styles.statusDate}>{vs.label.includes('approved') || vs.label.includes('Published') ? 'as at' : 'updated'} {fmtDate(record.lastUpdated)}</span>}
              </p>
            </div>
          )}

          {/* Related versions */}
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <p className={styles.sectionTitle}>{variant === 'record' ? 'Versions' : 'Related versions'}</p>
              <button className={styles.linkBtn} onClick={() => navigate(`/legislative/${record.id}/versions`)}>View all versions ({recVersions.length}) <ArrowRight width={13} height={13} /></button>
            </div>
            <ul className={styles.versionList}>
              {recVersions.slice(0, 3).map((v) => (
                <li key={v.version}>
                  <span className={styles.vNum}>Version {v.version}</span>
                  <span className={styles.vLabel}>{v.label}</span>
                  <span className={styles.vDate}>{v.date}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Related records */}
          {related.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHead}>
                <p className={styles.sectionTitle}>Related records</p>
                <button className={styles.linkBtn} onClick={() => props.onRelatedSheet?.(record.id)}>View more <ArrowRight width={13} height={13} /></button>
              </div>
              <ul className={styles.relatedList}>
                {related.slice(0, 3).map((r) => (
                  <li key={r.id}>
                    <button className={styles.relatedItem} onClick={() => props.onOpenRelated?.(r.id)}>
                      <span className={styles.relIcon} aria-hidden>{recordIcon(r)}</span>
                      <span className={styles.relText}>
                        <span className={styles.relTitle}>{r.title}</span>
                        <span className={styles.relRef}>{r.citation ?? r.reference}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Public participation */}
          {recSubs > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Public participation</p>
              <p className={styles.desc}>{recSubs} submission{recSubs === 1 ? '' : 's'} associated with this record.</p>
            </div>
          )}
        </>
      )}
    </SideSheet>
  );
}

// Version rows for display — real store versions where they exist, otherwise a
// single synthetic row derived from the record itself.
function versionsForDisplay(record: LegislativeRecord, versions: { recordId: string; version: string; label: string; createdAt: string }[]) {
  const own = versions
    .filter((v) => v.recordId === record.id)
    .sort((a, b) => parseFloat(b.version) - parseFloat(a.version))
    .map((v) => ({ version: v.version, label: v.label, date: fmtDate(v.createdAt) }));
  if (own.length) return own;
  return [{ version: record.currentVersion, label: record.currentVersionLabel, date: fmtDate(record.lastUpdated) }];
}
