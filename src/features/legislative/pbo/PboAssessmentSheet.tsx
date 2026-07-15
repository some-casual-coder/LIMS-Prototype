import { useState } from 'react';
import {
  TriangleAlert, CircleAlert, CircleCheck, CheckCircle2, ShieldCheck, Clock,
  Send, Bell, Copy, Download, Lock, FileText, FileSpreadsheet, ExternalLink,
  ArrowRight, ArrowLeft, RefreshCw, LifeBuoy, Package, ScrollText,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SideSheet, Button, StatusBadge, Avatar } from '@/components/ui';
import { useDemoStore } from '@/store/demoStore';
import { recordAudit, notify } from '@/mocks/mockApi';
import { useToast } from '@/features/search/Toast';
import { paths } from '@/routes/paths';
import { TASKS_RECORD_ID } from '@/data/billTasks';
import { pboStatusMeta, type PboDoc, type PboState } from '@/data/pbo';
import { officerName, officerRole, officerInitials } from '../tasks/taskShared';
import type { RoleId } from '@/data/types';
import styles from './PboAssessmentSheet.module.css';

// Roles authorised for the privileged PBO actions (illustrative §58 matrix):
// send/reminder is broad; recording the response, satisfying the requirement
// and preparing a manual transfer require director-level or Clerk authority.
const CAN_SEND: RoleId[] = ['dls-drafter', 'dls-reviewer', 'clerk', 'ict-admin'];
const CAN_ADMINISTER: RoleId[] = ['dls-reviewer', 'clerk', 'ict-admin'];

const docIcon = (fmt: string) => (fmt === 'XLSX' ? <FileSpreadsheet width={16} height={16} /> : <FileText width={16} height={16} />);

export function PboAssessmentSheet({ onClose }: { onClose: () => void }) {
  const pbo = useDemoStore((s) => s.pbo);
  const roleId = useDemoStore((s) => s.currentRole);
  const sendPboRequest = useDemoStore((s) => s.sendPboRequest);
  const receivePboResponse = useDemoStore((s) => s.receivePboResponse);
  const markPboSatisfied = useDemoStore((s) => s.markPboSatisfied);
  const retryPboRequest = useDemoStore((s) => s.retryPboRequest);
  const preparePboManualTransfer = useDemoStore((s) => s.preparePboManualTransfer);
  const { showToast, ToastHost } = useToast();

  const [reviewing, setReviewing] = useState(false);

  const actor = (roleId as string) ?? 'dls-reviewer';
  const canSend = !!roleId && CAN_SEND.includes(roleId);
  const canAdminister = !!roleId && CAN_ADMINISTER.includes(roleId);

  function audit(description: string) {
    recordAudit({ recordId: TASKS_RECORD_ID, actorId: actor, actionType: 'Workflow', description });
  }

  function doSend() {
    sendPboRequest();
    audit(`PBO package prepared and request sent to the Parliamentary Budget Office (Gateway ref ${pbo.gatewayRef ?? 'PBO-REQ-2026-00847'}).`);
    notify({ category: 'Review', recipientId: 'dls-drafter', recordId: TASKS_RECORD_ID, title: 'PBO request sent', body: 'The financial-impact assessment request has been delivered to the Parliamentary Budget Office.' });
    showToast('Request sent to the Parliamentary Budget Office.');
    setReviewing(false);
  }
  function doReminder() {
    audit('Reminder sent to the Parliamentary Budget Office for the pending financial-impact note.');
    showToast('Reminder sent to the Parliamentary Budget Office.');
  }
  function doEscalate() {
    audit('PBO request escalated — pending financial-impact assessment.');
    notify({ category: 'Deadline', recipientId: 'dls-reviewer', recordId: TASKS_RECORD_ID, title: 'PBO request escalated', body: 'The pending PBO assessment has been escalated for attention.' });
    showToast('PBO request escalated.');
  }
  function doReceive() {
    receivePboResponse();
    audit('PBO financial-impact note received (FIN-PBO-2026-00847.pdf).');
    notify({ category: 'Review', recipientId: 'dls-drafter', recordId: TASKS_RECORD_ID, title: 'PBO response received', body: 'The Parliamentary Budget Office has returned the financial-impact note.' });
    showToast('PBO financial-impact note recorded.');
  }
  function doSatisfy() {
    markPboSatisfied();
    audit('PBO requirement satisfied — Legal Review blocking dependency cleared.');
    notify({ category: 'Approval', recipientId: 'dls-reviewer', recordId: TASKS_RECORD_ID, title: 'PBO requirement satisfied', body: 'The PBO blocking dependency is cleared. Legal Review can now be advanced.' });
    notify({ category: 'Approval', recipientId: 'dlps-officer', recordId: TASKS_RECORD_ID, title: 'PBO requirement satisfied', body: 'Legal Review no longer has a blocking PBO dependency.' });
    // Toast doubles as the screen-reader announcement (role=status, aria-live).
    showToast('PBO requirement satisfied. Legal Review now has no blocking dependencies.');
  }
  function doRetry() {
    retryPboRequest();
    audit('PBO gateway retry succeeded — request delivered.');
    showToast('Request re-sent to the Parliamentary Budget Office.');
  }
  function doEscalateIct() {
    audit('PBO gateway failure escalated to ICT Support.');
    notify({ category: 'System', recipientId: 'ict-admin', recordId: TASKS_RECORD_ID, title: 'PBO gateway failure', body: 'A PBO integration gateway failure has been escalated for investigation.' });
    showToast('Escalated to ICT Support.');
  }
  function doPrepareManual() {
    preparePboManualTransfer();
    audit('PBO manual secure-transfer package prepared (encrypted, with manifest and checksum).');
    showToast('Secure transfer package prepared.');
  }
  function doConfirmManual() {
    // A manual transfer sends the package but does NOT satisfy the requirement —
    // the PBO must still return an assessment.
    sendPboRequest();
    audit('PBO package transferred manually via the secure channel; awaiting assessment.');
    showToast('Manual transfer confirmed. Awaiting PBO assessment.');
  }

  const copyRef = () => { navigator.clipboard?.writeText(pbo.gatewayRef ?? ''); showToast('Gateway reference copied.'); };

  // ---- Banner --------------------------------------------------------------
  const banner = (() => {
    switch (pbo.state) {
      case 'required': return { tone: 'amber', icon: <TriangleAlert width={18} height={18} />, title: 'Financial-impact assessment required', sub: 'This workflow is blocked until the PBO assessment is completed.' };
      case 'sent': return { tone: 'blue', icon: <Clock width={18} height={18} />, title: 'Request sent to Parliamentary Budget Office', sub: 'Awaiting assessment and financial-impact note.' };
      case 'received': return { tone: 'green', icon: <CircleCheck width={18} height={18} />, title: 'PBO assessment received', sub: 'A Financial Impact Note has been provided by the PBO.' };
      case 'satisfied': return { tone: 'green', icon: <CheckCircle2 width={18} height={18} />, title: 'PBO requirement satisfied', sub: 'Legal Review has no blocking dependencies remaining.' };
      case 'failed': return { tone: 'red', icon: <CircleAlert width={18} height={18} />, title: 'PBO gateway unavailable', sub: 'Unable to connect to the PBO integration gateway.' };
      case 'manual-transfer': return { tone: 'blue', icon: <ShieldCheck width={18} height={18} />, title: 'Manual secure transfer prepared', sub: 'Send the encrypted package to the PBO through the secure manual channel.' };
    }
  })();

  const auditLink = (
    <Link to={paths.audit} className={styles.auditLink}><ScrollText width={13} height={13} /> Audit history</Link>
  );

  // ---- Package-review interstitial -----------------------------------------
  if (reviewing) {
    return (
      <SideSheet open onClose={onClose} size="xl" title="PBO Assessment"
        footer={<div className={styles.footer}><Button variant="ghost" leftIcon={<ArrowLeft width={15} height={15} />} onClick={() => setReviewing(false)}>Back</Button><Button variant="primary" leftIcon={<Send width={16} height={16} />} onClick={doSend}>Confirm and Send</Button></div>}>
        <h3 className={styles.reviewHead}>Review package before sending</h3>
        <p className={styles.reviewIntro}>The following package will be transmitted to the Parliamentary Budget Office through the secure integration gateway.</p>
        <dl className={styles.metaList}>
          <div><dt>Receiving office</dt><dd>{pbo.receivingOffice}</dd></div>
          <div><dt>Access classification</dt><dd><RestrictedPill /></dd></div>
          <div><dt>Requesting officer</dt><dd>{officerName(pbo.requestingOfficerId)}</dd></div>
        </dl>
        <SectionLabel>Documents ({pbo.documents.length})</SectionLabel>
        <ul className={styles.docList}>{pbo.documents.map((d) => <DocRow key={d.name} doc={d} showMeta />)}</ul>
        <p className={styles.auditNotice}><Lock width={13} height={13} /> This action will be recorded in the immutable audit trail.</p>
        <ToastHost />
      </SideSheet>
    );
  }

  // ---- Per-state body + footer ---------------------------------------------
  let body: React.ReactNode = null;
  let footer: React.ReactNode = null;

  if (pbo.state === 'required') {
    body = (
      <>
        <SectionLabel>Request status</SectionLabel>
        <div className={styles.statusRow}><CircleAlert width={16} height={16} className={styles.mutedIcon} /><div><div className={styles.statusStrong}>Not sent</div><div className={styles.statusSub}>Request has not yet been sent to the Parliamentary Budget Office.</div></div></div>

        <SectionLabel>Required documents</SectionLabel>
        <ul className={styles.docList}>{pbo.documents.map((d) => <DocRow key={d.name} doc={d} showRequirement />)}</ul>

        <SectionLabel>Requesting officer</SectionLabel>
        <PersonRow id={pbo.requestingOfficerId} />
        <SectionLabel>PBO liaison</SectionLabel>
        <PersonRow id={pbo.liaisonId} />

        <div className={styles.dueRow}><span className={styles.dueLabel}>Request due date</span><span className={styles.dueValue}>{pbo.dueLabel} <span className={styles.dueIn}>· {pbo.dueInLabel}</span></span></div>

        <SectionLabel>Notes</SectionLabel>
        <p className={styles.notes}>{pbo.reason}</p>
      </>
    );
    footer = (
      <div className={styles.footer}>
        {auditLink}
        <span title={canSend ? undefined : 'Sending a PBO request requires a drafter, reviewer or Clerk role.'}>
          <Button variant="primary" leftIcon={<Send width={16} height={16} />} disabled={!canSend} onClick={() => setReviewing(true)}>Send to PBO</Button>
        </span>
      </div>
    );
  }

  if (pbo.state === 'sent' || pbo.state === 'manual-transfer') {
    body = (
      <>
        <SectionLabel>Request summary</SectionLabel>
        <dl className={styles.metaList}>
          <div><dt>Gateway request reference</dt><dd className={styles.refValue}>{pbo.gatewayRef}<button className={styles.copyBtn} onClick={copyRef} aria-label="Copy gateway reference"><Copy width={13} height={13} /></button></dd></div>
          <div><dt>Request sent</dt><dd>{pbo.requestSentAt}</dd></div>
          <div><dt>Receiving office</dt><dd>{pbo.receivingOffice}</dd></div>
          <div><dt>Access classification</dt><dd><RestrictedPill /></dd></div>
          <div><dt>Delivery status</dt><dd><StatusBadge tone="green" size="sm" icon={<CircleCheck width={11} height={11} />}>{pbo.deliveryStatus}</StatusBadge></dd></div>
          <div><dt>Expected response</dt><dd>{pbo.expectedResponse}</dd></div>
          {pbo.state === 'manual-transfer' && <div><dt>Transfer manifest</dt><dd>{pbo.manifestRef}</dd></div>}
        </dl>

        <SectionLabel>Submitted documents ({pbo.documents.length})</SectionLabel>
        <ul className={styles.docList}>{pbo.documents.map((d) => <DocRow key={d.name} doc={d} showMeta showChecksum />)}</ul>

        {pbo.timeline.length > 0 && (
          <>
            <SectionLabel>Timeline</SectionLabel>
            <ol className={styles.timeline}>
              {pbo.timeline.map((t, i) => (
                <li key={i} className={t.done ? styles.tlDone : styles.tlPending}>
                  <span className={styles.tlDot} aria-hidden>{t.done ? <CircleCheck width={13} height={13} /> : <Clock width={13} height={13} />}</span>
                  <span className={styles.tlLabel}>{t.label}</span>
                  {t.at && <span className={styles.tlAt}>{t.at}</span>}
                </li>
              ))}
            </ol>
          </>
        )}

        <SectionLabel>Actions</SectionLabel>
        <div className={styles.inlineActions}>
          <Button variant="secondary" size="sm" leftIcon={<Bell width={14} height={14} />} onClick={doReminder}>Send Reminder</Button>
          <Button variant="secondary" size="sm" leftIcon={<TriangleAlert width={14} height={14} />} onClick={doEscalate}>Escalate Request</Button>
        </div>
      </>
    );
    footer = (
      <div className={styles.footer}>
        {auditLink}
        <span title={canAdminister ? undefined : 'Recording the PBO response requires the Director of Legal Services or the Clerk.'}>
          <Button variant="primary" leftIcon={<Download width={16} height={16} />} disabled={!canAdminister} onClick={doReceive}>Record PBO Response</Button>
        </span>
      </div>
    );
  }

  if (pbo.state === 'received') {
    body = (
      <>
        <SectionLabel>Assessment summary</SectionLabel>
        <div className={styles.pboOfficer}><Avatar initials={officerInitials(pbo.liaisonId)} name={officerName(pbo.liaisonId)} size={30} /><div><div className={styles.personName}>{officerName(pbo.liaisonId)}</div><div className={styles.personRole}>{officerRole(pbo.liaisonId)} · Parliamentary Budget Office</div></div></div>
        <dl className={styles.metaList}>
          <div><dt>Response received</dt><dd>{pbo.responseAt}</dd></div>
          <div><dt>Financial Impact Note</dt><dd><button className={styles.fileLink} onClick={() => showToast('Preview is illustrative in this prototype.')}>{pbo.finNote} <Download width={13} height={13} /></button><span className={styles.fileMeta}>PDF · {pbo.finNoteSize}</span></dd></div>
          <div><dt>Validation status</dt><dd><StatusBadge tone="green" size="sm" icon={<CircleCheck width={11} height={11} />}>{pbo.validation}</StatusBadge></dd></div>
          <div><dt>Linked canonical record</dt><dd><span className={styles.linkedRef}>{pbo.linkedRecordRef} <ExternalLink width={12} height={12} /></span></dd></div>
        </dl>

        <SectionLabel>Response summary</SectionLabel>
        <p className={styles.summaryText}>{pbo.responseSummary}</p>
        <p className={styles.illustrativeNote}>Illustrative content — not an actual PBO determination.</p>

        <div className={styles.nextSteps}><div className={styles.nextTitle}>Next steps</div><p>Mark the PBO requirement as satisfied to allow the workflow to proceed to the next stage.</p></div>
      </>
    );
    footer = (
      <div className={styles.footer}>
        {auditLink}
        <span title={canAdminister ? undefined : 'Satisfying the requirement requires the Director of Legal Services or the Clerk.'}>
          <Button variant="primary" leftIcon={<CheckCircle2 width={16} height={16} />} disabled={!canAdminister} onClick={doSatisfy}>Mark Requirement Satisfied</Button>
        </span>
      </div>
    );
  }

  if (pbo.state === 'satisfied') {
    body = (
      <>
        <SectionLabel>Assessment summary</SectionLabel>
        <dl className={styles.metaList}>
          <div><dt>Financial Impact Note</dt><dd><span className={styles.fileLink}>{pbo.finNote}</span><span className={styles.fileMeta}>PDF · {pbo.finNoteSize}</span></dd></div>
          <div><dt>Validation status</dt><dd><StatusBadge tone="green" size="sm" icon={<CircleCheck width={11} height={11} />}>Validated</StatusBadge></dd></div>
          <div><dt>Linked canonical record</dt><dd><span className={styles.linkedRef}>{pbo.linkedRecordRef} <ExternalLink width={12} height={12} /></span></dd></div>
        </dl>
        <div className={styles.clearedNote}><CheckCircle2 width={16} height={16} /><p>Legal Review no longer has a blocking PBO dependency. The stage can now be advanced from the workflow &amp; stage gates screen.</p></div>
        <p className={styles.auditNotice}><Lock width={13} height={13} /> This action was recorded in the immutable audit trail.</p>
      </>
    );
    footer = (
      <div className={styles.footer}>
        {auditLink}
        <Button variant="primary" to={paths.recordWorkflow(pbo.recordId)} rightIcon={<ArrowRight width={16} height={16} />}>Open workflow &amp; gates</Button>
      </div>
    );
  }

  if (pbo.state === 'failed') {
    body = (
      <>
        <SectionLabel>Integration status</SectionLabel>
        <dl className={styles.metaList}>
          <div><dt>Current state</dt><dd><StatusBadge tone="red" size="sm" icon={<CircleAlert width={11} height={11} />}>Unavailable</StatusBadge></dd></div>
          <div><dt>Your request</dt><dd>Safely queued</dd></div>
          <div><dt>Last attempt</dt><dd>{pbo.lastAttemptAt}</dd></div>
          <div><dt>Error code</dt><dd>{pbo.errorCode}</dd></div>
          <div><dt>Details</dt><dd>Service temporarily unavailable. The request will retry automatically.</dd></div>
        </dl>

        <div className={styles.reassure}><div className={styles.nextTitle}>What happens next?</div><p>Your request will be automatically sent when the gateway is restored, and you will be notified. No document has been lost.</p></div>

        <div className={styles.inlineActions}>
          <Button variant="secondary" size="sm" leftIcon={<RefreshCw width={14} height={14} />} onClick={doRetry}>Retry Now</Button>
          <Button variant="secondary" size="sm" leftIcon={<LifeBuoy width={14} height={14} />} onClick={doEscalateIct}>Escalate to ICT Support</Button>
        </div>

        <SectionLabel>Manual secure transfer (fallback)</SectionLabel>
        <p className={styles.notes}>You may securely send the documents to the PBO manually if this is urgent. Preparing a package does not satisfy the assessment requirement.</p>
        <span title={canAdminister ? undefined : 'Preparing a secure transfer requires the Director of Legal Services or the Clerk.'}>
          <Button variant="secondary" leftIcon={<Package width={15} height={15} />} disabled={!canAdminister} onClick={doPrepareManual}>Prepare Secure Package</Button>
        </span>

        <p className={styles.auditNotice}><Lock width={13} height={13} /> An integration-failure event has been recorded in the audit trail.</p>
      </>
    );
    footer = (
      <div className={styles.footer}>
        {auditLink}
        <Button variant="primary" leftIcon={<RefreshCw width={16} height={16} />} onClick={doRetry}>Retry Now</Button>
      </div>
    );
  }

  // Manual-transfer reuses the sent body above; append a fallback footer action.
  if (pbo.state === 'manual-transfer') {
    footer = (
      <div className={styles.footer}>
        {auditLink}
        <span title={canAdminister ? undefined : 'Confirming a manual transfer requires the Director of Legal Services or the Clerk.'}>
          <Button variant="primary" leftIcon={<ShieldCheck width={16} height={16} />} disabled={!canAdminister} onClick={doConfirmManual}>Confirm Manual Transfer</Button>
        </span>
      </div>
    );
  }

  return (
    <SideSheet open onClose={onClose} size="xl" title="PBO Assessment" footer={footer}>
      <div className={`${styles.banner} ${styles['banner_' + banner!.tone]}`}>
        <span className={styles.bannerIcon} aria-hidden>{banner!.icon}</span>
        <div><div className={styles.bannerTitle}>{banner!.title}</div><div className={styles.bannerSub}>{banner!.sub}</div></div>
      </div>
      {body}
      <ToastHost />
    </SideSheet>
  );
}

// ---- Small presentational helpers -----------------------------------------
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className={styles.sectionLabel}>{children}</div>;
}

function DocRow({ doc, showRequirement, showMeta, showChecksum }: { doc: PboDoc; showRequirement?: boolean; showMeta?: boolean; showChecksum?: boolean }) {
  return (
    <li className={styles.docRow}>
      <span className={styles.docIcon} aria-hidden>{docIcon(doc.format)}</span>
      <span className={styles.docName}>{doc.name}{doc.version && <span className={styles.docVersion}>{doc.version}</span>}</span>
      {showMeta && <span className={styles.docMeta}>{doc.format} · {doc.size}{showChecksum && doc.checksum ? ` · ${doc.checksum}` : ''}</span>}
      {showRequirement && (
        <StatusBadge tone={doc.requirement === 'Required' ? 'amber' : 'grey'} size="sm">{doc.requirement}</StatusBadge>
      )}
    </li>
  );
}

function PersonRow({ id }: { id: string }) {
  return (
    <div className={styles.personRow}>
      <Avatar initials={officerInitials(id)} name={officerName(id)} size={30} />
      <div><div className={styles.personName}>{officerName(id)}</div><div className={styles.personRole}>{officerRole(id)}</div></div>
    </div>
  );
}

function RestrictedPill() {
  return <span className={styles.restricted}><Lock width={11} height={11} /> Restricted</span>;
}

// ---- Reusable PBO status card (Bill Workspace overview / dependency) -------
export function PboStatusCard({ state, onOpen }: { state: PboState; onOpen: () => void }) {
  const meta = pboStatusMeta[state];
  const icon = state === 'required' ? <TriangleAlert width={17} height={17} />
    : state === 'failed' ? <CircleAlert width={17} height={17} />
    : state === 'satisfied' ? <CheckCircle2 width={17} height={17} />
    : state === 'received' ? <CircleCheck width={17} height={17} />
    : <Clock width={17} height={17} />;
  const label = state === 'required' ? 'Open PBO Assessment' : 'View PBO Assessment';
  return (
    <section className={`${styles.statusCard} ${styles['statusCard_' + meta.tone]}`}>
      <div className={styles.statusCardHead}><span className={styles.statusCardIcon} aria-hidden>{icon}</span><h3 className={styles.statusCardTitle}>{meta.label}</h3></div>
      <p className={styles.statusCardBody}>{meta.short}</p>
      <button className={styles.statusCardLink} onClick={onOpen}>{label} <ArrowRight width={14} height={14} /></button>
    </section>
  );
}
