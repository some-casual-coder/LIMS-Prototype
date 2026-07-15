import { useState } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, CheckCircle2, CircleAlert, CircleCheck,
  ClipboardCheck, Copy, Download, ExternalLink, FileCode2, FileText, Globe2,
  KeyRound, Landmark, Lock, RadioTower, RefreshCw, ScrollText, Send, ShieldCheck,
  Stamp, TriangleAlert, XCircle,
} from 'lucide-react';
import { AppShell } from '@/components/shell';
import { Button, SideSheet, StatusBadge } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import { recordAudit, notify } from '@/mocks/mockApi';
import { useToast } from '@/features/search/Toast';
import { paths } from '@/routes/paths';
import { PRIMARY_RECORD_ID } from '@/data/seed';
import type { PublicationDestination, PublicationOutput } from '@/data/publication';
import { publicationStatusCopy } from '@/data/publication';
import type { RoleId } from '@/data/types';
import { officerName, officerRole } from '../tasks/taskShared';
import styles from './PublicationCentre.module.css';

const CAN_PUBLISH: RoleId[] = ['clerk', 'ict-admin'];
const CAN_PREPARE: RoleId[] = ['dlps-officer', 'clerk', 'ict-admin'];

export function PublicationCentre() {
  const { id = PRIMARY_RECORD_ID } = useParams();
  const [params, setParams] = useSearchParams();
  const record = useDemoStore((s) => s.records.find((r) => r.id === id));
  const publication = useDemoStore((s) => s.publication);
  const roleId = useDemoStore((s) => s.currentRole);
  const applySignature = useDemoStore((s) => s.applyPublicationSignature);
  const applySeal = useDemoStore((s) => s.applyPublicationSeal);
  const markReady = useDemoStore((s) => s.markPublicationReady);
  const publishRecord = useDemoStore((s) => s.publishRecord);
  const retryDestination = useDemoStore((s) => s.retryPublicationDestination);
  const { showToast, ToastHost } = useToast();
  const [publicationNote, setPublicationNote] = useState('Final publication authorised after legal, procedural, PBO, signature and seal checks.');

  const sheet = params.get('sheet');
  const closeSheet = () => setParams((p) => { p.delete('sheet'); return p; });
  const openSheet = (name: string) => setParams((p) => { p.set('sheet', name); return p; });

  const isPrimary = publication.recordId === id;
  const canPublish = !!roleId && CAN_PUBLISH.includes(roleId);
  const canPrepare = !!roleId && CAN_PREPARE.includes(roleId);
  const signed = publication.signatureStatus === 'Verified';
  const sealed = publication.sealStatus === 'Applied';
  const readyToPublish = signed && sealed && publication.state === 'ready-to-publish';
  const published = publication.state === 'published';
  const partial = publication.state === 'partially-transmitted';
  const blocked = getBlockingIssues(signed, sealed);
  const status = publicationStatusCopy[publication.state];

  const actor = roleId ?? 'clerk';
  const audit = (actionType: 'Signature' | 'Seal' | 'Publication', description: string, previousValue?: string, newValue?: string) =>
    recordAudit({ recordId: publication.recordId, actorId: actor, actionType, description, previousValue, newValue, version: publication.version });

  function doSign() {
    applySignature();
    audit('Signature', `Qualified signature applied to Version ${publication.version} by ${officerName(publication.signerId)}.`, 'Ready for Signature', 'Fully Signed');
    notify({ category: 'Publication', recipientId: 'clerk', recordId: publication.recordId, title: 'Signature completed', body: 'The publication version has been signed and is ready for institutional seal.' });
    showToast('Qualified signature applied and verified.');
    closeSheet();
  }

  function doSeal() {
    applySeal();
    audit('Seal', `Institutional seal ${publication.sealReference} applied by ${officerName(publication.sealCustodianId)}.`, 'Seal Required', 'Signed and Sealed');
    notify({ category: 'Publication', recipientId: 'clerk', recordId: publication.recordId, title: 'Seal applied', body: 'The publication package is ready for secure transfer.' });
    showToast('Institutional seal applied. Publication package is ready.');
    closeSheet();
  }

  function doPrepareTransfer() {
    markReady();
    audit('Publication', 'Publication manifest prepared for secure transfer.', 'Signed and Sealed', 'Ready to Publish');
    showToast('Publication manifest prepared.');
    openSheet('publication-manifest');
  }

  function doPublish() {
    publishRecord(publicationNote);
    audit('Publication', `Version ${publication.version} published as ${publication.officialReference}.`, 'Ready to Publish', 'Published');
    notify({ category: 'Publication', recipientId: 'clerk', recordId: publication.recordId, title: 'Publication completed', body: 'Digital Public Services Bill, 2026 has been published and indexed.' });
    notify({ category: 'Publication', recipientId: 'dls-drafter', recordId: publication.recordId, title: 'Publication completed', body: 'The official public manifestations are now available.' });
    showToast('Published successfully. Search and Repository now show the public version.');
    closeSheet();
  }

  function doRetry() {
    retryDestination();
    audit('Publication', 'Failed publication destination retried successfully.', 'Partially Transmitted', 'Published');
    showToast('Public website transmission completed.');
  }

  function doCopyLink() {
    navigator.clipboard?.writeText(publication.publicUrl ?? 'https://www.assembly.go.ke/acts/2026/12');
    showToast('Public link copied.');
  }

  function downloadOutput(output: PublicationOutput) {
    const body = `Digital Public Services Bill, 2026\n${publication.officialReference}\n${output.label}\nIllustrative export for front-end prototype.\n`;
    const blob = new Blob([body], { type: output.format === 'PDF' ? 'application/pdf' : output.format === 'HTML' ? 'text/html' : 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = output.name;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${output.label} downloaded.`);
  }

  const allDestinationsReady = publication.destinations.every((d) => d.status === 'Ready' || d.status === 'Complete' || d.status === 'Not configured');
  const canProceed = signed && sealed && allDestinationsReady;

  if (!record || !isPrimary) {
    return (
      <AppShell breadcrumb={[{ label: 'Legislative Work', to: paths.work }, { label: 'Publication Centre' }]}>
        <section className={styles.notFound}>
          <h1>Publication Centre unavailable</h1>
          <p>This front-end prototype currently wires publication controls to the canonical Bill record.</p>
          <Button variant="primary" to={paths.recordPublish()}>Open canonical publication centre</Button>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell breadcrumb={[{ label: 'Bills', to: paths.work }, { label: record.title, to: paths.record(record.id) }, { label: 'Publication Centre' }]}>
      <div className={styles.page}>
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Signature, seal and publication</p>
            <div className={styles.titleRow}>
              <h1>{record.title}</h1>
              <StatusBadge tone={published ? 'green' : partial ? 'amber' : 'blue'} icon={published ? <CheckCircle2 width={12} height={12} /> : <ClipboardCheck width={12} height={12} />}>{status.label}</StatusBadge>
            </div>
            <p className={styles.meta}>{record.reference} · Version {publication.version} — {publication.versionLabel} · {record.directorate}</p>
            <p className={styles.summary}>Controlled publication of the approved version as official PDF, accessible HTML and Akoma Ntoso XML manifestations.</p>
          </div>
          <div className={styles.stageCard}>
            <span>Current stage</span>
            <strong>{published ? 'Published' : signed ? 'Publication' : 'Signature'}</strong>
            <small>{published ? 'Stage 6 of 6' : signed ? 'Stage 6 of 6' : 'Stage 5 of 6'}</small>
            <Link to={paths.recordWorkflow(record.id)}>View full workflow <ExternalLink width={13} height={13} /></Link>
          </div>
        </header>

        {partial && (
          <div className={styles.partialAlert} role="status">
            <TriangleAlert width={18} height={18} />
            <div><strong>Published internally, public website transmission failed.</strong><span>Retry the failed destination before showing the full public success state.</span></div>
            <Button variant="secondary" size="sm" leftIcon={<RefreshCw width={14} height={14} />} onClick={doRetry}>Retry failed destination</Button>
          </div>
        )}

        <div className={styles.grid}>
          <section className={styles.panel}>
            <div className={styles.panelHead}><h2>Readiness checklist</h2><span>{blocked.length === 0 ? 'All checks passed' : `${blocked.length} blocking issue${blocked.length > 1 ? 's' : ''}`}</span></div>
            <ul className={styles.checklist}>
              <CheckRow label="Legal approval" status="Completed" />
              <CheckRow label="Procedural review" status="Completed" />
              <CheckRow label="AKN validation" status="Passed" />
              <CheckRow label="Financial Impact (PBO)" status="Satisfied" />
              <CheckRow label="Required signature" status={signed ? 'Verified' : 'Required'} meta={signed ? '1 of 1' : '0 of 1'} action={() => openSheet('signature')} />
              <CheckRow label="Institutional seal" status={sealed ? 'Applied' : 'Required'} action={() => openSheet('seal')} />
              <CheckRow label="Final outputs" status="Ready" action={() => openSheet('publication-manifest')} />
            </ul>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}><h2>Official outputs</h2><button onClick={() => openSheet('publication-manifest')}>Open manifest</button></div>
            <ul className={styles.outputList}>
              {publication.outputs.map((o) => <OutputRow key={o.id} output={o} onDownload={() => downloadOutput(o)} />)}
            </ul>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}><h2>Publication destinations</h2><button onClick={() => openSheet('transmission-details')}>View details</button></div>
            <ul className={styles.destList}>
              {publication.destinations.map((d) => <DestinationRow key={d.id} destination={d} />)}
            </ul>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}><h2>Summary</h2><span>{status.short}</span></div>
            <dl className={styles.summaryList}>
              <div><dt>Version to be published</dt><dd>{publication.version}</dd></div>
              <div><dt>Last updated</dt><dd>{publication.preparedAt}</dd></div>
              <div><dt>Prepared by</dt><dd>{officerName(publication.preparedBy)}</dd></div>
              <div><dt>Next action</dt><dd>{nextAction(signed, sealed, published, partial)}</dd></div>
            </dl>
          </section>
        </div>

        {blocked.length > 0 && !published && !partial && (
          <section className={styles.blockers}>
            <CircleAlert width={18} height={18} />
            <div>
              <h2>Blocking issues</h2>
              <p>The following items must be completed before publication:</p>
              <ul>{blocked.map((b) => <li key={b}>{b}</li>)}</ul>
            </div>
          </section>
        )}

        {(readyToPublish || published || partial) && (
          <SecureTransferPanel
            outputs={publication.outputs}
            destinations={publication.destinations}
            published={published}
            partial={partial}
            publicationTimestamp={publication.publicationTimestamp}
            officialReference={publication.officialReference}
            signerId={publication.signerId}
            sealReference={publication.sealReference}
            publicUrl={publication.publicUrl}
            immutableAuditRef={publication.immutableAuditRef}
            note={publicationNote}
            setNote={setPublicationNote}
            canPublish={canPublish}
            onPublish={() => openSheet('transmission-details')}
            onCopyLink={doCopyLink}
            onRetry={doRetry}
          />
        )}

        <footer className={styles.actions}>
          <Button variant="secondary" to={paths.record(record.id)} leftIcon={<ArrowLeft width={16} height={16} />}>Back to Bill Workspace</Button>
          <div>
            {!signed && <Button variant="secondary" onClick={() => openSheet('signature')}>Go to Signatures</Button>}
            {signed && !sealed && <Button variant="secondary" onClick={() => openSheet('seal')}>Apply Institutional Seal</Button>}
            {signed && sealed && !readyToPublish && !published && !partial && <Button variant="secondary" onClick={doPrepareTransfer} disabled={!canPrepare}>Prepare Transfer</Button>}
            <span title={canProceed && canPublish ? undefined : !canPublish ? 'Publishing requires Clerk or ICT administrator authority.' : 'Complete signature, seal and destination readiness before publishing.'}>
              <Button variant="primary" disabled={!canProceed || !canPublish || published} onClick={() => openSheet('transmission-details')}>
                {published ? 'Published' : 'Proceed to Publication'}
              </Button>
            </span>
          </div>
        </footer>
      </div>

      {sheet === 'signature' && (
        <SignatureSheet canSign={!!roleId && CAN_PUBLISH.includes(roleId)} onClose={closeSheet} onSign={doSign} />
      )}
      {sheet === 'seal' && (
        <SealSheet canSeal={!!roleId && CAN_PUBLISH.includes(roleId)} signed={signed} onClose={closeSheet} onSeal={doSeal} />
      )}
      {sheet === 'publication-manifest' && (
        <ManifestSheet onClose={closeSheet} onDownload={downloadOutput} />
      )}
      {sheet === 'transmission-details' && (
        <TransmissionSheet
          note={publicationNote}
          setNote={setPublicationNote}
          canPublish={canPublish}
          ready={canProceed}
          onClose={closeSheet}
          onPublish={doPublish}
        />
      )}
      <ToastHost />
    </AppShell>
  );
}

function CheckRow({ label, status, meta, action }: { label: string; status: string; meta?: string; action?: () => void }) {
  const tone = status === 'Required' ? 'amber' : status === 'Passed' || status === 'Completed' || status === 'Satisfied' || status === 'Verified' || status === 'Applied' || status === 'Ready' ? 'green' : 'grey';
  return (
    <li className={styles.checkRow}>
      <span className={styles.checkIcon}>{status === 'Required' ? <TriangleAlert width={15} height={15} /> : <CircleCheck width={15} height={15} />}</span>
      <span className={styles.checkLabel}>{label}</span>
      <StatusBadge tone={tone} size="sm">{status}</StatusBadge>
      {meta && <span className={styles.metaChip}>{meta}</span>}
      {action && <button onClick={action} aria-label={`Open ${label}`}>Open</button>}
    </li>
  );
}

function OutputRow({ output, onDownload }: { output: PublicationOutput; onDownload: () => void }) {
  const icon = output.format === 'PDF' ? <FileText width={16} height={16} /> : output.format === 'HTML' ? <Globe2 width={16} height={16} /> : <FileCode2 width={16} height={16} />;
  return (
    <li className={styles.outputRow}>
      <span className={styles.fileIcon}>{icon}</span>
      <div><strong>{output.label}</strong><span>{output.name} · {output.size}</span></div>
      <StatusBadge tone={output.validation === 'Failed' ? 'red' : 'green'} size="sm">{output.validation}</StatusBadge>
      <button onClick={onDownload} aria-label={`Download ${output.label}`}><Download width={14} height={14} /></button>
    </li>
  );
}

function DestinationRow({ destination }: { destination: PublicationDestination }) {
  const tone = destination.status === 'Complete' || destination.status === 'Ready' ? 'green' : destination.status === 'Failed' ? 'red' : destination.status === 'Not configured' ? 'grey' : 'amber';
  const icon = destination.status === 'Failed' ? <XCircle width={12} height={12} /> : destination.status === 'Complete' || destination.status === 'Ready' ? <CircleCheck width={12} height={12} /> : undefined;
  return (
    <li className={styles.destRow}>
      <span><RadioTower width={15} height={15} /></span>
      <div><strong>{destination.name}</strong><small>{destination.type}</small></div>
      <StatusBadge tone={tone} size="sm" icon={icon}>{destination.status}</StatusBadge>
    </li>
  );
}

function SignatureSheet({ canSign, onClose, onSign }: { canSign: boolean; onClose: () => void; onSign: () => void }) {
  const publication = useDemoStore((s) => s.publication);
  const [otp, setOtp] = useState('428913');
  const verified = otp.length === 6;
  return (
    <SideSheet open onClose={onClose} size="xl" title="Qualified Signature"
      footer={<SheetFooter audit><Button variant="ghost" onClick={onClose}>Cancel</Button><span title={canSign ? undefined : 'Signing requires Clerk authority for this prototype.'}><Button variant="primary" leftIcon={<Lock width={15} height={15} />} disabled={!canSign || !verified || publication.signatureStatus === 'Verified'} onClick={onSign}>Sign Document</Button></span></SheetFooter>}>
      <div className={styles.infoBanner}><ShieldCheck width={16} height={16} /><p>You are applying a legally valid digital signature to this document. Ensure all details are correct before signing.</p></div>
      <MetaRows rows={[
        ['Document', 'Digital Public Services Bill, 2026'],
        ['Signer', `${officerName(publication.signerId)} — ${officerRole(publication.signerId)}`],
        ['Role', 'Authorised Signatory'],
        ['Certificate Authority', 'Kenya National CA — Class 3 (illustrative)'],
        ['Certificate Validity', '12 May 2025 – 12 May 2028'],
        ['Revocation Status', 'Valid'],
        ['Signature Method', 'Qualified electronic signature — PKI illustrative'],
        ['Signing Timestamp', '18 Jul 2026, 11:02 AM EAT'],
        ['Reason', 'Final signature prior to publication'],
        ['Version Being Signed', `${publication.version} (${publication.versionLabel})`],
      ]} />
      <section className={styles.mfaBox}>
        <div><KeyRound width={17} height={17} /><strong>MFA confirmation</strong></div>
        <label>One-time code<input id="publication-signature-otp" name="publication-signature-otp" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" aria-label="One-time code" /></label>
        <StatusBadge tone={verified ? 'green' : 'amber'} size="sm">{verified ? 'Verified' : 'Required'}</StatusBadge>
      </section>
    </SideSheet>
  );
}

function SealSheet({ canSeal, signed, onClose, onSeal }: { canSeal: boolean; signed: boolean; onClose: () => void; onSeal: () => void }) {
  const publication = useDemoStore((s) => s.publication);
  return (
    <SideSheet open onClose={onClose} size="xl" title="Apply Institutional Seal"
      footer={<SheetFooter audit><Button variant="ghost" onClick={onClose}>Cancel</Button><span title={!signed ? 'The seal cannot be applied until the required signature is complete.' : canSeal ? undefined : 'Only Clerk authority or an authorised seal custodian may apply the institutional seal.'}><Button variant="primary" leftIcon={<Lock width={15} height={15} />} disabled={!signed || !canSeal || publication.sealStatus === 'Applied'} onClick={onSeal}>Apply Seal</Button></span></SheetFooter>}>
      <div className={styles.infoBanner}><Landmark width={16} height={16} /><p>Applying the official institutional seal affirms the authenticity of this Act as a true record of the National Assembly.</p></div>
      <MetaRows rows={[
        ['Institution', 'National Assembly of Kenya'],
        ['Authorised Custodian', `${officerName(publication.sealCustodianId)} — ${officerRole(publication.sealCustodianId)}`],
        ['Seal Reference', publication.sealReference],
        ['Version', `${publication.version} — Signed publication version`],
        ['Date', '18 Jul 2026'],
        ['Purpose', 'Official publication of approved legislative record'],
      ]} />
      <div className={styles.sealPreview}>
        <div><strong>Digital Public Services Bill, 2026</strong><span>{publication.officialReference}</span></div>
        <div className={styles.sealMark}><Stamp width={42} height={42} /><span>Illustrative seal</span></div>
      </div>
      <p className={styles.warningNote}><TriangleAlert width={15} height={15} /> Once applied, the seal becomes part of the official manifestation and cannot be removed without a recorded superseding process.</p>
    </SideSheet>
  );
}

function ManifestSheet({ onClose, onDownload }: { onClose: () => void; onDownload: (o: PublicationOutput) => void }) {
  const publication = useDemoStore((s) => s.publication);
  return (
    <SideSheet open onClose={onClose} size="xxl" title="Publication Manifest">
      <table className={styles.manifestTable}>
        <thead><tr><th>File</th><th>Format</th><th>Size</th><th>Checksum</th><th>Signature</th><th>Seal</th><th>Action</th></tr></thead>
        <tbody>
          {publication.outputs.map((o) => (
            <tr key={o.id}><td>{o.name}</td><td>{o.format}</td><td>{o.size}</td><td>{o.checksum}</td><td>{o.signatureState}</td><td>{o.sealState}</td><td><button onClick={() => onDownload(o)}>Download</button></td></tr>
          ))}
        </tbody>
      </table>
      <p className={styles.auditNotice}><ScrollText width={14} height={14} /> Manifest inspection is recorded as an access event in the audit trail.</p>
    </SideSheet>
  );
}

function TransmissionSheet({ note, setNote, canPublish, ready, onClose, onPublish }: {
  note: string; setNote: (v: string) => void; canPublish: boolean; ready: boolean; onClose: () => void; onPublish: () => void;
}) {
  const publication = useDemoStore((s) => s.publication);
  return (
    <SideSheet open onClose={onClose} size="xl" title="Secure Transfer and Publication"
      footer={<SheetFooter audit><Button variant="ghost" onClick={onClose}>Cancel</Button><span title={ready && canPublish ? undefined : !canPublish ? 'Publishing requires Clerk or ICT administrator authority.' : 'Signature, seal and destination readiness are required before publishing.'}><Button variant="primary" leftIcon={<Send width={15} height={15} />} disabled={!ready || !canPublish || publication.state === 'published'} onClick={onPublish}>Publish Now</Button></span></SheetFooter>}>
      <div className={styles.infoBanner}><BadgeCheck width={16} height={16} /><p>You are publishing Version {publication.version} as the official public manifestation.</p></div>
      <MetaRows rows={[
        ['Prepared by', officerName(publication.preparedBy)],
        ['Prepared on', publication.preparedAt],
        ['Checksum algorithm', 'SHA-256'],
        ['Encryption', 'TLS 1.2'],
        ['Audit trail', 'Enabled'],
      ]} />
      <label className={styles.noteLabel}>Publication note<textarea id="publication-note" name="publication-note" value={note} onChange={(e) => setNote(e.target.value)} rows={4} /></label>
      <ul className={styles.destList}>{publication.destinations.map((d) => <DestinationRow key={d.id} destination={d} />)}</ul>
    </SideSheet>
  );
}

function SecureTransferPanel(props: {
  outputs: PublicationOutput[]; destinations: PublicationDestination[]; published: boolean; partial: boolean; publicationTimestamp?: string;
  officialReference: string; signerId: string; sealReference: string; publicUrl?: string; immutableAuditRef?: string; note: string;
  setNote: (v: string) => void; canPublish: boolean; onPublish: () => void; onCopyLink: () => void; onRetry: () => void;
}) {
  return (
    <section className={styles.transferGrid}>
      <div className={styles.transferMain}>
        <h2>Secure transfer and publication</h2>
        <table className={styles.outputTable}>
          <thead><tr><th>File</th><th>Format</th><th>Size</th><th>Status</th></tr></thead>
          <tbody>{props.outputs.map((o) => <tr key={o.id}><td>{o.name}</td><td>{o.format}</td><td>{o.size}</td><td><StatusBadge tone="green" size="sm">Ready</StatusBadge></td></tr>)}</tbody>
        </table>
        <div className={styles.destinationBox}>
          <h3>Target destinations and transmission</h3>
          <ul>{props.destinations.map((d) => <DestinationRow key={d.id} destination={d} />)}</ul>
        </div>
      </div>
      <aside className={styles.transmissionSummary}>
        <h2>Transmission summary</h2>
        <MetaRows rows={[
          ['Prepared by', 'Ruth Naliaka'],
          ['Prepared on', '18 Jul 2026, 11:20 AM EAT'],
          ['Checksum algorithm', 'SHA-256'],
          ['Encryption', 'TLS 1.2'],
          ['Audit trail', 'Enabled'],
        ]} />
        {!props.published && !props.partial && <Button variant="primary" block leftIcon={<Send width={15} height={15} />} onClick={props.onPublish}>Publish Now</Button>}
        {props.partial && <Button variant="primary" block leftIcon={<RefreshCw width={15} height={15} />} onClick={props.onRetry}>Retry Website Transmission</Button>}
      </aside>
      {(props.published || props.partial) && (
        <div className={styles.successPanel}>
          <div className={props.partial ? styles.partialIcon : styles.successIcon}>{props.partial ? <TriangleAlert width={38} height={38} /> : <CheckCircle2 width={42} height={42} />}</div>
          <h2>{props.partial ? 'Partially transmitted' : 'Published successfully'}</h2>
          <p>{props.partial ? 'Internal destinations are complete. The public website needs retry.' : 'The Act has been officially published and is now publicly accessible.'}</p>
          <dl>
            <div><dt>Publication timestamp</dt><dd>{props.publicationTimestamp}</dd></div>
            <div><dt>Official reference</dt><dd>{props.officialReference}</dd></div>
            <div><dt>Signed by</dt><dd>{officerName(props.signerId)} <StatusBadge tone="green" size="sm">Verified</StatusBadge></dd></div>
            <div><dt>Institutional seal</dt><dd>{props.sealReference} <StatusBadge tone="green" size="sm">Verified</StatusBadge></dd></div>
            <div><dt>Public URL</dt><dd>{props.publicUrl ? <button onClick={props.onCopyLink}>{props.publicUrl} <Copy width={13} height={13} /></button> : 'Retry required'}</dd></div>
            <div><dt>Immutable record</dt><dd>{props.immutableAuditRef}</dd></div>
          </dl>
          <div className={styles.successActions}>
            {!props.partial && <Button variant="primary" to={paths.publicBill()} leftIcon={<Globe2 width={15} height={15} />}>View Public Record</Button>}
            <Button variant="secondary" to={paths.record()} leftIcon={<ArrowLeft width={15} height={15} />}>Open Bill Workspace</Button>
          </div>
        </div>
      )}
    </section>
  );
}

function MetaRows({ rows }: { rows: Array<[string, string]> }) {
  return <dl className={styles.metaRows}>{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>;
}

function SheetFooter({ children, audit }: { children: React.ReactNode; audit?: boolean }) {
  return <div className={styles.sheetFooter}>{audit && <span><ScrollText width={13} height={13} /> Audit event will be recorded.</span>}<div>{children}</div></div>;
}

function getBlockingIssues(signed: boolean, sealed: boolean): string[] {
  const issues = [];
  if (!signed) issues.push('All required signatures must be applied.');
  if (!sealed) issues.push('Institutional seal must be affixed.');
  return issues;
}

function nextAction(signed: boolean, sealed: boolean, published: boolean, partial: boolean) {
  if (published) return 'Open public record';
  if (partial) return 'Retry public website transmission';
  if (!signed) return 'Apply qualified signature';
  if (!sealed) return 'Apply institutional seal';
  return 'Publish official manifestations';
}
