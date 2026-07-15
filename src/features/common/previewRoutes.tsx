import { Archive, ScanLine, Inbox, BarChart3, ShieldCheck, HelpCircle, PenLine, History, GitBranch, Stamp } from 'lucide-react';
import { ShelledPage } from './ShelledPage';
import { PreviewPanel } from './PreviewPanel';

const primary = 'NA-BILL-2026-015';

export function DocumentArchivePage() {
  return (
    <ShelledPage breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Document Archive' }]}
      title="Document Archive" subtitle="Metadata-driven access to canonical records, supporting files and historical scans.">
      <PreviewPanel icon={Archive}
        intro="Every legislative document is stored as a manifestation of its structured canonical record — PDF, accessible HTML and Akoma Ntoso XML — with version, classification and retention state."
        capabilities={['Folderless, metadata-driven browsing', 'Signed and published documents', 'Historical scanned records', 'Retention and access history']}
        links={[{ label: 'Search legislative records', to: '/search' }, { label: 'Open the primary Bill workspace', to: `/legislative/${primary}` }]}
      />
    </ShelledPage>
  );
}

export function OcrImportPage() {
  return (
    <ShelledPage breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'OCR Import' }]}
      title="OCR Import and Verification" subtitle="Digitise historical documents with human verification before they become searchable records.">
      <PreviewPanel icon={ScanLine}
        intro="Scanned records are enhanced, text-extracted and metadata-tagged, then held for human verification. Extracted content never becomes an official record automatically."
        capabilities={['Guided upload and scan enhancement', 'Confidence indicators on extracted text', 'Side-by-side scan and text verification', 'Explicit human confirmation before archiving']}
        links={[{ label: 'Go to the Document Archive', to: '/documents' }]}
      />
    </ShelledPage>
  );
}

export function ParticipationInboxPage() {
  return (
    <ShelledPage breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Submission Inbox' }]}
      title="Public Participation Inbox" subtitle="Receive, validate, classify and route public submissions into the legislative process.">
      <PreviewPanel icon={Inbox}
        intro="Citizen submissions enter a controlled internal review queue before being associated with an official record. Public status stays clear without exposing internal information."
        capabilities={['Completeness and duplicate checks', 'Classification and routing to DLS or DLPS', 'Citizen-visible status updates', 'Links back to the related Bill']}
        links={[{ label: 'View the public portal', to: '/public' }, { label: 'Open the primary Bill workspace', to: `/legislative/${primary}` }]}
      />
    </ShelledPage>
  );
}

export function AnalyticsPage() {
  return (
    <ShelledPage breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Analytics' }]}
      title="Executive Analytics" subtitle="Decision-oriented oversight of legislative workload, readiness and compliance.">
      <PreviewPanel icon={BarChart3}
        intro="A decision-oriented view of institutional readiness — workflow health, directorate workload, publication readiness and compliance — with drill-down from every metric to the underlying records."
        capabilities={['Items by stage and average time in stage', 'Bottleneck and returned-for-revision rates', 'Sitting and publication readiness', 'Compliance exceptions and audit links']}
        links={[{ label: 'Open Audit & Compliance', to: '/audit' }]}
      />
    </ShelledPage>
  );
}

export function AuditPage() {
  return (
    <ShelledPage breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Audit & Compliance' }]}
      title="Audit and Compliance Explorer" subtitle="Complete, append-only traceability of every legislative action.">
      <PreviewPanel icon={ShieldCheck}
        intro="Every action — creation, AI-assisted edits, approvals, signatures and publication — is recorded in an immutable, append-only audit trail the Clerk can export without technical intervention."
        capabilities={['Filter by user, role, record, action and stage', 'Before-and-after values with integrity status', 'Human-readable event detail', 'Export a sample audit report']}
        links={[{ label: 'Back to Executive Analytics', to: '/analytics' }]}
      />
    </ShelledPage>
  );
}

export function HelpPage() {
  return (
    <ShelledPage breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Help & training' }]}
      title="Help and Training" subtitle="Guidance, training material and support for the Legislative Information Management System.">
      <PreviewPanel icon={HelpCircle}
        intro="Role-specific guidance, drafting standards and training resources for staff across the Directorate of Legal Services and the Directorate of Legislative and Procedural Services."
        capabilities={['Getting started for each role', 'Drafting and validation standards', 'Workflow and approval guidance', 'Contact institutional support']}
        links={[{ label: 'Return to the Command Centre', to: '/dashboard' }]}
      />
    </ShelledPage>
  );
}

export function DraftingEditorPage() {
  return (
    <ShelledPage breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Legislative Work', to: '/work' }, { label: 'Structured Drafting' }]}
      title="Structured Drafting Workspace" subtitle="Structured, validated and version-aware legislative drafting with a controlled AI assistant.">
      <PreviewPanel icon={PenLine}
        intro="A three-column drafting environment: document structure on the left, a page-like legislative editor in the centre, and comments, validation and a controlled AI assistant on the right."
        capabilities={['Clause structure with warnings and comment counts', 'Automatic numbering and legislative elements', 'AI suggestions requiring explicit human confirmation', 'Rule-based validation and version-aware saving']}
        links={[{ label: 'Open the Bill workspace', to: `/legislative/${primary}` }, { label: 'View version history', to: `/legislative/${primary}/versions` }]}
      />
    </ShelledPage>
  );
}

export function VersionsPage() {
  return (
    <ShelledPage breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Legislative Work', to: '/work' }, { label: 'Version History' }]}
      title="Version History and Comparison" subtitle="Preserved legislative history with side-by-side and redline comparison.">
      <PreviewPanel icon={History}
        intro="Every version is preserved and identifiable — current working version, latest approved version and published version. No version is ever deletable; changes are superseded, withdrawn or corrected."
        capabilities={['Compare any two versions side by side or inline', 'Change summaries and changed-clauses view', 'Download PDF, HTML or Akoma Ntoso XML', 'Permanent record identifiers']}
        links={[{ label: 'Open the Bill workspace', to: `/legislative/${primary}` }]}
      />
    </ShelledPage>
  );
}

export function WorkflowPage() {
  return (
    <ShelledPage breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Legislative Work', to: '/work' }, { label: 'Workflow & Approvals' }]}
      title="Workflow and Approvals" subtitle="Where the record is, why it is there and what must happen next.">
      <PreviewPanel icon={GitBranch}
        intro="The illustrative configured workflow shows completed, current, upcoming, returned and blocked stages, with a full approval history and permission-aware actions."
        capabilities={['Stage map with current stage highlighted', 'Approval history with approver, decision and version', 'Permission-restricted actions with clear explanations', 'Transition history and required next actions']}
        links={[{ label: 'Open the Bill workspace', to: `/legislative/${primary}` }]}
      />
    </ShelledPage>
  );
}

export function PublishPage() {
  return (
    <ShelledPage breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Legislative Work', to: '/work' }, { label: 'Signature & Publication' }]}
      title="Signature, Seal and Publication" subtitle="Controlled generation and publication of official legislative outputs.">
      <PreviewPanel icon={Stamp}
        intro="A controlled publication centre with a pre-publication checklist, mock qualified electronic signature, institutional seal and generation of official PDF, accessible HTML and Akoma Ntoso XML."
        capabilities={['Pre-publication checklist and validation', 'Mock signature with identity confirmation', 'Institutional seal application', 'Downloadable official outputs and public URL']}
        links={[{ label: 'Open the Bill workspace', to: `/legislative/${primary}` }]}
      />
    </ShelledPage>
  );
}
