import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ExternalLink, Eye, MoreVertical, Check, ShieldCheck, Lock, Download, ArrowRight,
  FileText, Link2, ScanLine, Archive, History, Search as SearchIcon,
} from 'lucide-react';
import { AppShell } from '@/components/shell';
import { Button, Popover, StatusBadge } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import { recordAudit } from '@/mocks/mockApi';
import { ScanPage, ScanThumb } from './ScanPage';
import { OcrStatusBadge, officerName, fmtDate, fmtDateTime, confidenceMeta } from './ocrShared';
import {
  ArchiveSheet, VerificationHistorySheet, MetadataSheet, LinkRelatedSheet, RequestScanSheet,
} from './detailSheets';
import { useToast } from '@/features/search/Toast';
import styles from './HistoricalRecordDetail.module.css';

const TABS = ['Overview', 'Original Scan', 'Verified Text', 'Structure', 'Metadata', 'Relationships', 'Versions', 'Activity'];
const FORMAT_ROWS: { label: string; size: string; kind: 'download' | 'open' }[] = [
  { label: 'Original PDF Scan', size: '12.6 MB', kind: 'download' },
  { label: 'Verified Searchable PDF', size: '2.4 MB', kind: 'download' },
  { label: 'Verified Text (TXT)', size: '120 KB', kind: 'download' },
  { label: 'Accessible HTML', size: '1.6 MB', kind: 'open' },
  { label: 'OCR JSON', size: '340 KB', kind: 'download' },
  { label: 'Akoma Ntoso XML', size: '2.1 MB', kind: 'download' },
];
const RELATED = [
  { title: 'Votes and Proceedings — 12 June 1984', ref: 'HIST/VP/1984/0612', rel: 'Related sitting' },
  { title: 'Order Paper — 11 June 1984', ref: 'HIST/OP/1984/0611', rel: 'Previous sitting' },
  { title: 'Public Service (Amendment) Bill, 1984', ref: 'BILL/1984/013', rel: 'Mentioned in' },
  { title: 'Public Service (Amendment) Act, 1985', ref: 'ACT/1985/005', rel: 'Enacted as' },
];

export function HistoricalRecordDetail() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const jobs = useDemoStore((s) => s.ocrJobs);
  const currentRole = useDemoStore((s) => s.currentRole);
  const updateOcrJob = useDemoStore((s) => s.updateOcrJob);
  const { showToast, ToastHost } = useToast();

  const job = jobs.find((j) => j.reference.replace(/\//g, '-') === id);
  const tab = params.get('tab') ?? 'Overview';
  const sheet = params.get('sheet') ?? '';

  const openSheet = (n: string) => setParams((p) => { p.set('sheet', n); return p; });
  const closeSheet = () => setParams((p) => { p.delete('sheet'); return p; }, { replace: true });
  const setTab = (t: string) => setParams((p) => { p.set('tab', t); return p; }, { replace: true });

  if (!job) {
    return (
      <AppShell breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Historical Records', to: '/repository/historical-records' }, { label: 'Not found' }]}>
        <div className={styles.notFound}><p>This historical record is not available.</p><Link to="/repository/historical-records" className={styles.backLink}>Back to the Historical Archive</Link></div>
      </AppShell>
    );
  }

  const archived = job.status === 'Verified';
  const isQualityReview = job.status === 'Quality Review';
  const isReady = job.status === 'Ready to Archive';
  const canApprove = currentRole === 'records-officer' || currentRole === 'clerk';
  const conf = confidenceMeta(job.ocrConfidence);

  function approveQuality() {
    updateOcrJob(job!.id, { status: 'Ready to Archive' });
    recordAudit({ recordId: job!.reference, actorId: 'quality-reviewer', actionType: 'Approval', description: 'Quality review approved', previousValue: 'Quality Review', newValue: 'Ready to Archive' });
    showToast('Quality review approved. The record is ready to archive.');
  }

  return (
    <AppShell breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'OCR & Historical Records', to: '/archive/ocr' }, { label: job.reference }]}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.thumb}><ScanThumb pageNumber={1} /></span>
        <div className={styles.headMain}>
          <h1 className={styles.title}>{job.title}</h1>
          <p className={styles.ref}>{job.reference} · {job.recordType} · {job.sourceArchive}</p>
          <div className={styles.pills}>
            {archived
              ? <><StatusBadge tone="green" size="sm" icon={<Check width={11} height={11} />}>OCR Verified</StatusBadge><StatusBadge tone="grey" size="sm" icon={<Archive width={11} height={11} />}>Archived</StatusBadge></>
              : <OcrStatusBadge status={job.status} />}
            <StatusBadge tone={job.restricted ? 'red' : 'grey'} size="sm" icon={job.restricted ? <Lock width={11} height={11} /> : undefined}>{job.restricted ? 'Restricted' : 'Internal'}</StatusBadge>
            <span className={styles.headMeta}>{job.pageCount} pages · {job.language}</span>
          </div>
        </div>
        <div className={styles.headActions}>
          {isQualityReview ? (
            canApprove
              ? <Button variant="primary" leftIcon={<ShieldCheck width={16} height={16} />} onClick={approveQuality}>Approve Quality Review</Button>
              : <span title="Quality review approval is restricted to the Principal Records Reviewer."><Button variant="primary" disabled leftIcon={<ShieldCheck width={16} height={16} />}>Approve Quality Review</Button></span>
          ) : isReady ? (
            <Button variant="primary" leftIcon={<Archive width={16} height={16} />} onClick={() => openSheet('archive')}>Archive and Make Searchable</Button>
          ) : (
            <Button variant="primary" leftIcon={<ExternalLink width={16} height={16} />} onClick={() => navigate(`/archive/ocr/jobs/${job.id}/verify`)}>Open Verified Record</Button>
          )}
          <Button variant="secondary" leftIcon={<Eye width={16} height={16} />} onClick={() => setTab('Original Scan')}>View Original Scan</Button>
          <Popover label="More actions" align="left" trigger={({ toggle, ref }) => (<button ref={ref} className={styles.moreBtn} onClick={toggle} aria-label="More actions"><MoreVertical width={18} height={18} /></button>)}>
            {(close) => (
              <div className={styles.menu} onClick={close}>
                <button className={styles.menuItem} onClick={() => openSheet('history')}>Verification history</button>
                <button className={styles.menuItem} onClick={() => openSheet('metadata')}>Metadata &amp; classification</button>
                <button className={styles.menuItem} onClick={() => openSheet('link')}>Link related record</button>
                <button className={styles.menuItem} onClick={() => openSheet('rescan')}>Request better scan</button>
                {(isReady || archived) && <button className={styles.menuItem} onClick={() => openSheet('archive')}>Archive &amp; make searchable</button>}
              </div>
            )}
          </Popover>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>{t}
            {t === 'Relationships' && <span className={styles.tabCount}>{RELATED.length}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'Overview' && (
        <div className={styles.cards}>
          <Card icon={<ShieldCheck width={15} height={15} />} title="Provenance">
            <Meta label="Source archive" value={job.sourceArchive} />
            <Meta label="Physical reference" value={`${job.physicalRef} · ${job.shelf}`} />
            <Meta label="Imported by" value={officerName(job.importedById)} />
            <Meta label="Imported on" value={fmtDateTime(job.importedAt)} />
            <Meta label="Source checksum" value={<span className={styles.ok}><Check width={12} height={12} /> SHA-256 verified</span>} />
            <button className={styles.cardLink} onClick={() => openSheet('history')}>View provenance details</button>
          </Card>

          <Card icon={<Check width={15} height={15} />} title="Verification Summary">
            <Meta label="Pages verified" value={`${job.verifiedPages} of ${job.pageCount}`} />
            <Meta label="Corrections made" value={String(36)} />
            <Meta label="Low-confidence regions" value="8 (resolved)" />
            <Meta label="Structure confirmed" value="Yes" />
            <Meta label="Metadata approved" value="Yes" />
            <div className={styles.reviewers}>
              <span>Verified by <b>{officerName('records-officer')}</b></span>
              <span>Quality reviewed by <b>{officerName('quality-reviewer')}</b></span>
            </div>
            <button className={styles.cardLink} onClick={() => openSheet('history')}>View verification details</button>
          </Card>

          <Card icon={<FileText width={15} height={15} />} title="Availability & Formats">
            <ul className={styles.formatList}>
              {FORMAT_ROWS.map((f) => (
                <li key={f.label}><span className={styles.fmtName}>{f.label}</span><span className={styles.fmtSize}>{f.size}</span>
                  <button className={styles.fmtBtn} onClick={() => {
                    if (f.kind === 'open') { navigate(`/archive/ocr/jobs/${job.id}/verify`); return; }
                    const text = [job.title, `${job.reference} · ${job.recordType}`, `Source: ${job.sourceArchive}`, `Format: ${f.label}`].join('\n');
                    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
                    const a = document.createElement('a'); a.href = url; a.download = `${job.reference.replace(/[/\s]+/g, '-')}.txt`; a.click(); URL.revokeObjectURL(url);
                    showToast(`${f.label} downloaded.`);
                  }}>{f.kind === 'open' ? <><ExternalLink width={13} height={13} /> Open</> : <Download width={13} height={13} />}</button>
                </li>
              ))}
            </ul>
          </Card>

          <Card icon={<Lock width={15} height={15} />} title="Access & Retention">
            <Meta label="Access classification" value={job.restricted ? 'Restricted' : 'Internal'} />
            <Meta label="Search visibility" value="Authorised users" />
            <Meta label="Retention category" value="Permanent" />
            <Meta label="Legal basis" value="Parliamentary Records Act" />
            <button className={styles.cardLink} onClick={() => showToast('Access rules — who may view this record.')}>View access rules</button>
          </Card>

          <Card icon={<Link2 width={15} height={15} />} title="Related Records" action={<button className={styles.cardHeadLink} onClick={() => openSheet('link')}>View all <ArrowRight width={12} height={12} /></button>}>
            <ul className={styles.relatedList}>
              {RELATED.map((r) => (
                <li key={r.ref}><button type="button" className={styles.relBtn} onClick={() => navigate(`/search?q=${encodeURIComponent(r.title)}`)}><span className={styles.relIcon}><FileText width={14} height={14} /></span><span className={styles.relText}><span className={styles.relTitle}>{r.title}</span><span className={styles.relRef}>{r.ref}</span></span><span className={styles.relTag}>{r.rel}</span></button></li>
              ))}
            </ul>
          </Card>

          <Card icon={<SearchIcon width={15} height={15} />} title="Search & Index Status">
            <div className={styles.indexTop}><span className={styles.indexOk}><Check width={13} height={13} /></span><div><p className={styles.indexTitle}>{archived ? 'Indexed and searchable' : 'Not yet indexed'}</p><p className={styles.indexSub}>{archived ? 'Available in Legislative Search.' : 'Complete archiving to index this record.'}</p></div></div>
            <Meta label="Search status" value={archived ? 'Indexed' : 'Pending'} />
            <Meta label="Full-text search" value={archived ? 'Available' : '—'} />
            <Meta label="Keywords extracted" value="24" />
            <Meta label="Index quality score" value="92%" />
            <button className={styles.cardLink} onClick={() => navigate(`/search?q=${encodeURIComponent(job.title)}`)} disabled={!archived}>View in Legislative Search</button>
          </Card>

          <Card icon={<Eye width={15} height={15} />} title="Document Preview">
            <div className={styles.previewBox}><ScanThumb pageNumber={1} /></div>
            <button className={styles.cardLink} onClick={() => setTab('Original Scan')}>Open original scan</button>
          </Card>

          <Card icon={<ScanLine width={15} height={15} />} title="Digitisation Details">
            <Meta label="Source file" value="NA_Order_Paper_12_June_1984.pdf" />
            <Meta label="File checksum" value={<span className={styles.ok}><Check width={12} height={12} /> {job.checksum} (verified)</span>} />
            <Meta label="Pages detected" value={String(job.pageCount)} />
            <Meta label="Scan quality (avg.)" value="Good (enhanced)" />
            <Meta label="OCR confidence (avg.)" value={<StatusBadge tone={conf.tone} size="sm">{job.ocrConfidence}% {conf.label}</StatusBadge>} />
            <button className={styles.cardLink} onClick={() => navigate(`/archive/ocr/jobs/${job.id}`)}>View digitisation job</button>
          </Card>

          <Card icon={<History width={15} height={15} />} title="Audit Quick View" action={<button className={styles.cardHeadLink} onClick={() => openSheet('history')}>Full history <ArrowRight width={12} height={12} /></button>}>
            <ul className={styles.auditMini}>
              {[['File uploaded', '15 Jul, 10:42'], ['OCR processing completed', '15 Jul, 11:07'], ['Verification completed', '18 Jul, 09:35'], ['Quality review approved', '18 Jul, 11:18'], ['Record archived & indexed', '18 Jul, 11:31']].map(([label, time]) => (
                <li key={label}><span className={styles.auditDot} /><span>{label}</span><span className={styles.auditTime}>{time}</span></li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === 'Original Scan' && (
        <div className={styles.scanTab}>
          <div className={styles.scanTabInner}><ScanPage lines={job.pages?.find((p) => p.n === 7)?.lines ?? []} pageNumber={7} showRegions={false} /></div>
          <p className={styles.scanNote}>Original source scan · preserved unchanged · page 7 of {job.pageCount}</p>
        </div>
      )}
      {tab === 'Verified Text' && (
        <div className={styles.textTab}>
          {(job.pages?.find((p) => p.n === 7)?.lines ?? []).map((l) => <p key={l.id} className={styles.vtLine}>{l.text}</p>)}
        </div>
      )}
      {tab === 'Structure' && (
        <div className={styles.simpleTab}><ul className={styles.structList}>{(job.structure ?? []).map((n) => (<li key={n.id}><b>{n.label}</b>{n.children?.map((c) => <div key={c.id} className={styles.structChild}>{c.label}</div>)}</li>))}</ul></div>
      )}
      {tab === 'Metadata' && (
        <div className={styles.simpleTab}><ul className={styles.metaTab}>{(job.metadata ?? []).map((m) => (<li key={m.field}><span>{m.field}</span><b>{m.value}</b><StatusBadge tone={m.state === 'Confirmed' ? 'green' : m.state === 'Needs Review' ? 'red' : 'gold'} size="sm">{m.state}</StatusBadge></li>))}</ul></div>
      )}
      {tab === 'Relationships' && (
        <div className={styles.simpleTab}><ul className={styles.relFull}>{RELATED.map((r) => (<li key={r.ref}><span className={styles.relIcon}><FileText width={14} height={14} /></span><span className={styles.relText}><span className={styles.relTitle}>{r.title}</span><span className={styles.relRef}>{r.ref}</span></span><span className={styles.relTag}>{r.rel}</span></li>))}</ul></div>
      )}
      {tab === 'Versions' && (
        <div className={styles.simpleTab}><p className={styles.simpleNote}>Version 1.0 — Verified Record · archived {fmtDate(new Date().toISOString())}. Historical records preserve a single verified version; the original scan is retained as source evidence.</p></div>
      )}
      {tab === 'Activity' && (
        <div className={styles.simpleTab}><button className={styles.cardLink} onClick={() => openSheet('history')}>Open the full verification history</button></div>
      )}

      <ArchiveSheet open={sheet === 'archive'} onClose={closeSheet} job={job} showToast={showToast} />
      <VerificationHistorySheet open={sheet === 'history'} onClose={closeSheet} job={job} showToast={showToast} />
      <MetadataSheet open={sheet === 'metadata'} onClose={closeSheet} job={job} showToast={showToast} />
      <LinkRelatedSheet open={sheet === 'link'} onClose={closeSheet} showToast={showToast} />
      <RequestScanSheet open={sheet === 'rescan'} onClose={closeSheet} showToast={showToast} />
      <ToastHost />
    </AppShell>
  );
}

function Card({ icon, title, action, children }: { icon: React.ReactNode; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className={styles.card}>
      <header className={styles.cardHead}><span className={styles.cardIcon}>{icon}</span><h2 className={styles.cardTitle}>{title}</h2>{action}</header>
      <div className={styles.cardBody}>{children}</div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className={styles.metaRow}><span className={styles.metaLabel}>{label}</span><span className={styles.metaValue}>{value}</span></div>;
}
