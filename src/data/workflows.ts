import type { WorkflowTemplate, WorkflowStageDef } from './types';

// ---- Workflow Catalogue seed (Priority 0 sanity sprint) -------------------
// All ten required legislative workflow types are configured here. Bills,
// Order Paper and Supply carry fully authored stage configurations (they have
// dedicated detail routes); the other seven carry realistic, lighter configs so
// their detail pages are complete and no control is ever dead.
//
// Non-Bill stages and rules are illustrative and must carry the SOP-confirmation
// notice — the National Assembly's final stage maps are agreed during inception.

type StageSeed =
  Pick<WorkflowStageDef, 'id' | 'name' | 'icon' | 'tone' | 'owner' | 'description'> &
  Partial<WorkflowStageDef>;

// Build a stage, filling any unset facet with realistic, name-derived defaults so
// every stage of every workflow reads as genuinely configured.
function buildStages(
  seeds: StageSeed[],
  ctx: { abbrev: string; headRole: string },
): WorkflowStageDef[] {
  return seeds.map((s, i) => {
    const prev = seeds[i - 1];
    const sla = s.sla ?? 3;
    const slaUnit = s.slaUnit ?? 'Days';
    return {
      sla,
      slaUnit,
      requiredApproval: s.requiredApproval ?? 'Required',
      escalationTrigger: s.escalationTrigger ?? `After ${sla} ${slaUnit.toLowerCase()}`,
      allowRework: s.allowRework ?? true,
      autoAdvance: s.autoAdvance ?? (i < seeds.length - 1),
      active: s.active ?? true,
      entryConditions: s.entryConditions ?? [
        prev ? `${prev.name} completed` : 'Record created and validated',
        'Required inputs and documents available',
        'Assigned officer confirmed',
      ],
      exitConditions: s.exitConditions ?? [
        `${s.name} completed`,
        'Required approval recorded',
        'Outputs generated',
      ],
      roles: s.roles ?? [
        `Primary: ${s.owner}`,
        `Support: ${ctx.headRole}`,
        `Escalation: Director, ${ctx.abbrev}`,
      ],
      tasks: s.tasks ?? [
        `Carry out ${s.name.toLowerCase()}`,
        'Confirm requirements and record decision',
        'Attach completion evidence',
      ],
      documents: s.documents ?? [
        'Current working document',
        `${s.name} checklist`,
        'Decision memo',
      ],
      notifications: s.notifications ?? [
        'Stage assigned',
        'Deadline approaching',
        `${s.name} completed`,
      ],
      escalations: s.escalations ?? [
        `Overdue > ${sla} ${slaUnit.toLowerCase()} → Escalate to Director, ${ctx.abbrev}`,
      ],
      auditEvents: s.auditEvents ?? [
        'Stage entered',
        'Task completed',
        'Approval recorded',
        'Stage advanced',
      ],
      outputs: s.outputs ?? [`${s.name} checklist`],
      ...s,
    };
  });
}

// ---- Bills — Full Lifecycle (authoritative, 6 stages) ---------------------
const billStages = buildStages(
  [
    {
      id: 'instruction', name: 'Instruction', icon: 'ClipboardList', tone: 'grey',
      owner: 'Record Owner', description: 'Register the legislative instruction and open the Bill record.',
      sla: 2,
      entryConditions: ['Approved legislative proposal received', 'Originating office confirmed', 'Directorate assigned'],
      exitConditions: ['Bill record created', 'Reference reserved', 'Initial tasks generated'],
      tasks: ['Confirm instruction and policy documents', 'Reserve canonical reference', 'Assign owner and drafter'],
      documents: ['Instruction memo', 'Policy statement', 'Approval to draft'],
      outputs: ['Bill record', 'Initial task set'],
    },
    {
      id: 'drafting', name: 'Drafting', icon: 'PenLine', tone: 'blue',
      owner: 'Drafter', description: 'Structure clauses and prepare the working draft for review.',
      sla: 10,
      entryConditions: ['Bill record is created', 'Approved template applied', 'Instruction validated'],
      exitConditions: ['Draft structured and validated', 'Clause numbering applied', 'Submitted for legal review'],
      tasks: ['Draft and structure clauses', 'Apply automatic numbering', 'Run drafting validation', 'Submit for review'],
      documents: ['Working draft (DOCX)', 'Drafting checklist', 'Explanatory memorandum'],
      outputs: ['Structured working draft', 'Validation report'],
    },
    {
      id: 'legal-review', name: 'Legal Review', icon: 'Scale', tone: 'green',
      owner: 'Legal Reviewer', description: 'Legal and constitutional review of the working draft.',
      sla: 5, requiredApproval: 'Required', escalationTrigger: 'After 48 hours',
      entryConditions: ['Bill record is created', 'All required instruction documents are uploaded', 'Instruction is validated'],
      exitConditions: ['Legal review is completed', 'All issues resolved or accepted', 'Approval recorded'],
      roles: ['Primary: Legal Reviewer', 'Support: Clerk', 'Escalation: Director, DLS'],
      tasks: ['Run legal & constitutional check', 'Review & provide comments', 'Request revisions (if any)', 'Approve or escalate'],
      documents: ['Clean draft (DOCX)', 'PBO assessment (if applicable)', 'Legal review checklist', 'Approval memo'],
      notifications: ['Assignment created', 'Review requested', 'Deadline approaching (24h)', 'Review completed'],
      escalations: ['Overdue review > 48 hours → Escalate to Director, DLS', 'Overdue > 72 hours → Escalate to Head of DLS'],
      auditEvents: ['Workflow created', 'Stage entered', 'Task assigned', 'Revision submitted', 'Approval recorded', 'Signature applied', 'Publication completed'],
      outputs: ['Legal review checklist', 'Approval memo', 'Comment summary'],
    },
    {
      id: 'procedural-review', name: 'Procedural Review', icon: 'ClipboardCheck', tone: 'gold',
      owner: 'Procedural Reviewer', description: 'Confirm procedural readiness and publication information.',
      sla: 4,
      entryConditions: ['Legal review approved', 'Blocking comments resolved', 'PBO requirement satisfied where applicable'],
      exitConditions: ['Procedural checks complete', 'Publication information confirmed', 'Routed for signature'],
      roles: ['Primary: Procedural Reviewer', 'Support: Clerk (Procedural)', 'Escalation: Director, DLPS'],
      tasks: ['Confirm procedural readiness', 'Verify publication information', 'Route for signature'],
      documents: ['Procedural review checklist', 'Publication information sheet'],
      outputs: ['Procedural readiness confirmation'],
    },
    {
      id: 'signature', name: 'Signature', icon: 'Signature', tone: 'blue',
      owner: 'Authorised Signatory', description: 'Qualified electronic signature and institutional seal.',
      sla: 2, requiredApproval: 'Required',
      entryConditions: ['Procedural review complete', 'Approved publication version locked', 'Validation passed'],
      exitConditions: ['Qualified signature applied', 'Institutional seal applied', 'Version locked as official'],
      roles: ['Primary: Authorised Signatory', 'Custodian: Seal Custodian', 'Escalation: Clerk'],
      tasks: ['Confirm signer certificate', 'Apply qualified signature', 'Apply institutional seal'],
      documents: ['Approved publication version', 'Signature certificate', 'Seal record'],
      notifications: ['Signature requested', 'Signature applied', 'Seal applied'],
      outputs: ['Signed and sealed manifestation'],
    },
    {
      id: 'publication', name: 'Publication', icon: 'Globe', tone: 'red',
      owner: 'Publication Officer', description: 'Generate official outputs and publish to configured destinations.',
      sla: 1, autoAdvance: false,
      entryConditions: ['Signed and sealed version available', 'Official outputs generated and validated', 'Destinations configured'],
      exitConditions: ['Outputs transmitted to destinations', 'Public record available', 'Publication event recorded'],
      roles: ['Primary: Publication Officer', 'Authoriser: Clerk', 'Support: ICT'],
      tasks: ['Generate PDF, HTML and AKN XML', 'Transmit to destinations', 'Confirm public availability'],
      documents: ['Official PDF', 'Accessible HTML', 'Akoma Ntoso XML', 'Publication manifest'],
      notifications: ['Publication ready', 'Publication completed', 'Publication transmission failed'],
      outputs: ['Official PDF', 'Accessible HTML', 'Akoma Ntoso XML'],
    },
  ],
  { abbrev: 'DLS', headRole: 'Clerk' },
);

// ---- Order Paper (illustrative, 5 stages) ---------------------------------
const orderPaperStages = buildStages(
  [
    {
      id: 'compilation', name: 'Compilation', icon: 'FileText', tone: 'grey',
      owner: 'Order Paper Officer', description: 'Initiate and compile items for the Order Paper.',
      sla: 1,
      entryConditions: ['Sitting calendar is available', 'Agenda inputs received from committees/directorates', 'Business references captured', 'Deadlines communicated'],
      tasks: ['Compile agenda items', 'Verify sequence of business', 'Confirm member notices'],
      documents: ['Draft Order Paper', 'Supporting notices', 'Sitting schedule'],
      outputs: ['Compiled agenda'],
    },
    {
      id: 'internal-review', name: 'Internal Review', icon: 'Search', tone: 'blue',
      owner: 'Procedural Reviewer', description: 'Check completeness, format and compliance.',
      sla: 1,
      exitConditions: ['Completeness confirmed', 'Format and compliance checks passed', 'No outstanding action items'],
      tasks: ['Check completeness and format', 'Confirm compliance', 'Clear action items'],
      documents: ['Draft Order Paper', 'Compliance checklist'],
      outputs: ['Reviewed Order Paper'],
    },
    {
      id: 'sitting-readiness', name: 'Sitting Readiness', icon: 'CheckCircle2', tone: 'green',
      owner: 'Order Paper Officer', description: 'Final checks, seating and sequencing validation.',
      sla: 2, slaUnit: 'Days', requiredApproval: 'Director, DLPS', escalationTrigger: 'After 2 days',
      entryConditions: ['Sitting calendar is available', 'Agenda inputs received from committees/directorates', 'Business references captured', 'Deadlines communicated'],
      exitConditions: ['Sitting readiness checks complete', 'No outstanding action items', 'Required approvals recorded', 'All outputs generated'],
      roles: ['Order Paper Officer', 'Procedural Reviewer', 'Clerk (Procedural)', 'Director, DLPS'],
      tasks: ['Compile agenda items', 'Verify sequence of business', 'Confirm member notices', 'Check deadlines & requirements', 'Finalize order paper'],
      documents: ['Draft Order Paper', 'Supporting notices', 'Sitting schedule', 'Approval memo'],
      notifications: ['Assignment created', 'Sitting deadline approaching', 'Approval completed', 'Publication ready'],
      escalations: ['Overdue internal review (> 1 day) → Escalate to Clerk (Procedural)', 'Overdue approval (> 2 days) → Escalate to Head of DLPS'],
      auditEvents: ['Workflow created', 'Stage advanced', 'Review completed', 'Approval recorded', 'Publication completed'],
      outputs: ['Sitting readiness checklist', 'Member notices confirmed', 'Validated agenda sequence', 'Draft order paper (final)'],
    },
    {
      id: 'approval', name: 'Approval', icon: 'ShieldCheck', tone: 'gold',
      owner: 'Clerk (Procedural)', description: 'Authorisation by the Clerk / Presiding Officer.',
      sla: 1, requiredApproval: 'Clerk / Presiding Officer',
      tasks: ['Review final Order Paper', 'Record authorisation', 'Assign Order Paper number'],
      documents: ['Final Order Paper', 'Approval memo'],
      outputs: ['Authorised Order Paper'],
    },
    {
      id: 'publication', name: 'Publication', icon: 'Globe', tone: 'red',
      owner: 'Publication Officer', description: 'Order Paper issued and published for the sitting.',
      sla: 4, slaUnit: 'Hours', autoAdvance: false,
      exitConditions: ['Order Paper number assigned', 'Published for the sitting', 'Publication completed successfully'],
      tasks: ['Generate official Order Paper', 'Publish for the sitting', 'Notify members and directorates'],
      documents: ['Official Order Paper (PDF)', 'Publication manifest'],
      notifications: ['Publication ready', 'Publication completed'],
      outputs: ['Official Order Paper (PDF)', 'Accessible HTML'],
    },
  ],
  { abbrev: 'DLPS', headRole: 'Clerk (Procedural)' },
);

// ---- Supply (illustrative, 7 stages, financial dependency) ----------------
const supplyStages = buildStages(
  [
    { id: 'estimates-intake', name: 'Estimates Intake', icon: 'Inbox', tone: 'grey', owner: 'Supply Officer', description: 'Receive estimates, indents and supporting requests.', sla: 3 },
    { id: 'compilation', name: 'Compilation', icon: 'FileText', tone: 'blue', owner: 'Supply Officer', description: 'Compile and structure the supply schedule.', sla: 4 },
    {
      id: 'financial-clearance', name: 'Financial Clearance', icon: 'Landmark', tone: 'gold',
      owner: 'Budget Liaison', description: 'Obtain financial clearance and PBO input.', sla: 7,
      requiredApproval: 'Financial clearance',
      entryConditions: ['Supply schedule compiled', 'Financial assumptions attached', 'PBO liaison assigned'],
      exitConditions: ['Financial clearance received', 'Costing confirmed', 'Clearance recorded'],
      tasks: ['Request PBO / financial clearance', 'Attach financial-impact note', 'Confirm costing'],
      documents: ['Estimates', 'Financial clearance', 'Costing summary'],
      outputs: ['Financial clearance record'],
    },
    { id: 'committee-review', name: 'Committee Review', icon: 'Users', tone: 'green', owner: 'Committee Clerk', description: 'Departmental committee review of the supply schedule.', sla: 5 },
    { id: 'legal-review', name: 'Legal Review', icon: 'Scale', tone: 'green', owner: 'Legal Reviewer', description: 'Legal consistency and compliance review.', sla: 4 },
    { id: 'approval', name: 'Approval', icon: 'ShieldCheck', tone: 'gold', owner: 'Director, DLPS', description: 'Procedural and financial approval.', sla: 3, requiredApproval: 'Required' },
    {
      id: 'publication', name: 'Publication', icon: 'Globe', tone: 'red', owner: 'Publication Officer',
      description: 'Publish the approved supply record.', sla: 2, autoAdvance: false,
      outputs: ['Official PDF', 'Accessible HTML', 'Akoma Ntoso XML'],
    },
  ],
  { abbrev: 'DLS / DLPS', headRole: 'Director, DLPS' },
);

// ---- Lighter workflows (complete detail pages, default facets) -------------
const votesStages = buildStages([
  { id: 'compilation', name: 'Compilation', icon: 'FileText', tone: 'grey', owner: 'Records Officer', description: 'Compile the record of the sitting.' },
  { id: 'correction', name: 'Correction', icon: 'PenLine', tone: 'blue', owner: 'Records Officer', description: 'Apply corrections raised by Members and staff.' },
  { id: 'review', name: 'Review', icon: 'Search', tone: 'green', owner: 'Procedural Reviewer', description: 'Confirm accuracy against the proceedings.' },
  { id: 'approval', name: 'Approval', icon: 'ShieldCheck', tone: 'gold', owner: 'Clerk (Procedural)', description: 'Authorise the final record.' },
  { id: 'final-record', name: 'Final Record', icon: 'Globe', tone: 'red', owner: 'Publication Officer', description: 'Publish the authoritative Votes and Proceedings.', autoAdvance: false },
], { abbrev: 'DLPS', headRole: 'Clerk (Procedural)' });

const questionsStages = buildStages([
  { id: 'submission', name: 'Submission', icon: 'Inbox', tone: 'grey', owner: 'Questions Officer', description: 'Receive Members’ questions.' },
  { id: 'admissibility', name: 'Admissibility Review', icon: 'Search', tone: 'blue', owner: 'Procedural Reviewer', description: 'Assess admissibility against Standing Orders.' },
  { id: 'scheduling', name: 'Scheduling', icon: 'CalendarClock', tone: 'gold', owner: 'Questions Officer', description: 'Schedule for the appropriate sitting.' },
  { id: 'answered', name: 'Answered & Published', icon: 'Globe', tone: 'green', owner: 'Publication Officer', description: 'Record the response and publish.', autoAdvance: false },
], { abbrev: 'DLPS', headRole: 'Clerk (Procedural)' });

const statementsStages = buildStages([
  { id: 'submission', name: 'Submission', icon: 'Inbox', tone: 'grey', owner: 'Statements Officer', description: 'Receive requests for statements.' },
  { id: 'review', name: 'Review', icon: 'Search', tone: 'blue', owner: 'Procedural Reviewer', description: 'Confirm scope and admissibility.' },
  { id: 'scheduling', name: 'Scheduling', icon: 'CalendarClock', tone: 'gold', owner: 'Statements Officer', description: 'Schedule delivery in the House.' },
  { id: 'delivered', name: 'Delivered & Recorded', icon: 'Globe', tone: 'green', owner: 'Records Officer', description: 'Record delivery and publish.', autoAdvance: false },
], { abbrev: 'DLPS', headRole: 'Clerk (Procedural)' });

const petitionsStages = buildStages([
  { id: 'submission', name: 'Submission', icon: 'Inbox', tone: 'grey', owner: 'Participation Officer', description: 'Receive the petition and confirm completeness.' },
  { id: 'admissibility', name: 'Admissibility Review', icon: 'Search', tone: 'blue', owner: 'Procedural Reviewer', description: 'Assess admissibility and duplicate risk.' },
  { id: 'referral', name: 'Committee Referral', icon: 'Users', tone: 'gold', owner: 'Committee Clerk', description: 'Refer to the relevant committee.' },
  { id: 'consideration', name: 'Consideration', icon: 'ClipboardCheck', tone: 'green', owner: 'Committee Clerk', description: 'Committee consideration and response.' },
  { id: 'reported', name: 'Reported & Closed', icon: 'Globe', tone: 'red', owner: 'Records Officer', description: 'Report to the House and update the petitioner.', autoAdvance: false },
], { abbrev: 'DLS / DLPS', headRole: 'Committee Clerk' });

const motionsStages = buildStages([
  { id: 'notice', name: 'Notice', icon: 'FileText', tone: 'grey', owner: 'Motions Officer', description: 'Receive notice of motion.' },
  { id: 'review', name: 'Review', icon: 'Search', tone: 'blue', owner: 'Legal Reviewer', description: 'Review wording and admissibility.' },
  { id: 'scheduling', name: 'Scheduling', icon: 'CalendarClock', tone: 'gold', owner: 'Motions Officer', description: 'Schedule the motion for debate.' },
  { id: 'debate', name: 'Debate', icon: 'MessagesSquare', tone: 'green', owner: 'Clerk (Procedural)', description: 'Debated in the House.' },
  { id: 'resolved', name: 'Resolved & Recorded', icon: 'Globe', tone: 'red', owner: 'Records Officer', description: 'Record the resolution and publish.', autoAdvance: false },
], { abbrev: 'DLS', headRole: 'Clerk (Procedural)' });

const papersStages = buildStages([
  { id: 'intake', name: 'Intake', icon: 'Inbox', tone: 'grey', owner: 'Papers Officer', description: 'Receive papers laid before the House.' },
  { id: 'metadata', name: 'Metadata Confirmation', icon: 'Tags', tone: 'blue', owner: 'Records Officer', description: 'Confirm metadata and classification.' },
  { id: 'sitting-linkage', name: 'Sitting Linkage', icon: 'CalendarClock', tone: 'gold', owner: 'Papers Officer', description: 'Link to the relevant sitting.' },
  { id: 'filed', name: 'Filed', icon: 'Archive', tone: 'green', owner: 'Records Officer', description: 'File and make searchable.', autoAdvance: false },
], { abbrev: 'DLS / DLPS', headRole: 'Clerk (Procedural)' });

const siStages = buildStages([
  { id: 'drafting', name: 'Drafting', icon: 'PenLine', tone: 'grey', owner: 'Drafter', description: 'Draft the statutory instrument.' },
  { id: 'legal-review', name: 'Legal Review', icon: 'Scale', tone: 'blue', owner: 'Legal Reviewer', description: 'Legal and constitutional review.' },
  { id: 'compliance', name: 'Compliance Check', icon: 'ShieldCheck', tone: 'gold', owner: 'Compliance Officer', description: 'Confirm compliance with the parent Act.' },
  { id: 'approval', name: 'Approval', icon: 'ClipboardCheck', tone: 'green', owner: 'Director, DLS', description: 'Legal approval of the instrument.' },
  { id: 'publication', name: 'Publication', icon: 'Globe', tone: 'red', owner: 'Publication Officer', description: 'Publish and gazette the instrument.', autoAdvance: false },
], { abbrev: 'DLS', headRole: 'Director, DLS' });

// ---- The ten catalogue templates ------------------------------------------
export const workflowTemplatesSeed: WorkflowTemplate[] = [
  {
    type: 'Order Paper', slug: 'order-paper', name: 'Order Paper Workflow', workflowId: 'WF-OP-001',
    description: 'Workflow for the compilation, review and publication of Order Papers.',
    directorate: 'Directorate of Legislative and Procedural Services', directorateAbbrev: 'DLPS',
    version: 'v1.1', publishState: 'Published', configStatus: 'Active', activeRecords: 18,
    lastUpdated: '2026-07-10', lastUpdatedBy: 'Grace Wanjiku', adminId: 'wf-admin-mwangi-s', illustrative: true,
    stages: orderPaperStages, approvalsCount: 2, outputs: ['PDF', 'Accessible HTML'],
    rolesSummary: ['Order Paper Officer', 'Procedural Reviewer', 'Clerk (Procedural)', 'Director, DLPS'],
    previewNotes: [
      { category: 'Deadline', title: 'Sitting deadline approaching', body: 'Order Paper due before the next sitting.', at: 'Today, 9:10 AM' },
      { category: 'Approval', title: 'Approval completed', body: 'Sitting readiness approved by Director, DLPS.', at: 'Yesterday, 4:30 PM' },
    ],
    comparison: {
      directorate: 'DLPS', version: 'v1.1', status: 'Published', stages: 5, activeRecords: 18, approvals: 2,
      pboDependency: 'Not required', keyDocuments: ['Compiled items', 'Sitting notices', 'Cover memorandum'],
      duration: 'Hours to days',
    },
  },
  {
    type: 'Votes and Proceedings', slug: 'votes-and-proceedings', name: 'Votes and Proceedings Workflow', workflowId: 'WF-VP-001',
    description: 'Workflow for compiling, correcting and authorising the record of proceedings.',
    directorate: 'Directorate of Legislative and Procedural Services', directorateAbbrev: 'DLPS',
    version: 'v2.3', publishState: 'Published', configStatus: 'Complete', activeRecords: 22,
    lastUpdated: '2026-07-11', lastUpdatedBy: 'Mary Chebet', adminId: 'wf-admin-chebet', illustrative: true,
    stages: votesStages, approvalsCount: 2, outputs: ['PDF', 'Accessible HTML'],
    rolesSummary: ['Records Officer', 'Procedural Reviewer', 'Clerk (Procedural)'],
    previewNotes: [
      { category: 'Review', title: 'Corrections received', body: 'Member corrections submitted for the last sitting.', at: 'Today, 8:05 AM' },
      { category: 'Approval', title: 'Record authorised', body: 'Final record authorised for publication.', at: '11 Jul, 5:00 PM' },
    ],
    comparison: {
      directorate: 'DLPS', version: 'v2.3', status: 'Published', stages: 5, activeRecords: 22, approvals: 2,
      pboDependency: 'Not required', keyDocuments: ['Draft record', 'Correction schedule', 'Approval memo'],
      duration: 'Days',
    },
  },
  {
    type: 'Question', slug: 'questions', name: 'Questions Workflow', workflowId: 'WF-QN-001',
    description: 'Workflow for receiving, assessing and scheduling Members’ questions.',
    directorate: 'Directorate of Legislative and Procedural Services', directorateAbbrev: 'DLPS',
    version: 'v1.8', publishState: 'Published', configStatus: 'Complete', activeRecords: 26,
    lastUpdated: '2026-07-09', lastUpdatedBy: 'Faith Chelangat', adminId: 'wf-admin-chelangat', illustrative: true,
    stages: questionsStages, approvalsCount: 2, outputs: ['PDF', 'Accessible HTML'],
    rolesSummary: ['Questions Officer', 'Procedural Reviewer', 'Publication Officer'],
    previewNotes: [
      { category: 'Deadline', title: 'Scheduling deadline', body: 'Questions to be scheduled for Thursday’s sitting.', at: 'Today, 10:00 AM' },
      { category: 'System', title: 'Admissibility review', body: 'Three questions awaiting admissibility review.', at: 'Yesterday, 2:15 PM' },
    ],
    comparison: {
      directorate: 'DLPS', version: 'v1.8', status: 'Published', stages: 4, activeRecords: 26, approvals: 2,
      pboDependency: 'Not required', keyDocuments: ['Question notice', 'Admissibility note'],
      duration: 'Days',
    },
  },
  {
    type: 'Statement', slug: 'statements', name: 'Statements Workflow', workflowId: 'WF-ST-001',
    description: 'Workflow for receiving, reviewing and scheduling statements.',
    directorate: 'Directorate of Legislative and Procedural Services', directorateAbbrev: 'DLPS',
    version: 'v1.6', publishState: 'Published', configStatus: 'Active', activeRecords: 14,
    lastUpdated: '2026-07-08', lastUpdatedBy: 'Lilian Otieno', adminId: 'wf-admin-otieno-l', illustrative: true,
    stages: statementsStages, approvalsCount: 1, outputs: ['PDF', 'Accessible HTML'],
    rolesSummary: ['Statements Officer', 'Procedural Reviewer', 'Records Officer'],
    previewNotes: [
      { category: 'Review', title: 'Statement received', body: 'A Cabinet statement request has been received.', at: 'Today, 7:45 AM' },
      { category: 'Deadline', title: 'Delivery scheduled', body: 'Delivery scheduled for the afternoon sitting.', at: 'Yesterday, 3:20 PM' },
    ],
    comparison: {
      directorate: 'DLPS', version: 'v1.6', status: 'Published', stages: 4, activeRecords: 14, approvals: 1,
      pboDependency: 'Not required', keyDocuments: ['Statement request', 'Scheduling note'],
      duration: 'Days',
    },
  },
  {
    type: 'Petition', slug: 'petitions', name: 'Petitions Workflow', workflowId: 'WF-PT-001',
    description: 'Workflow for receiving, assessing and considering public petitions.',
    directorate: 'Directorate of Legal Services', directorateAbbrev: 'DLS / DLPS',
    version: 'v1.5', publishState: 'Draft', configStatus: 'Needs Review', activeRecords: 11,
    lastUpdated: '2026-07-07', lastUpdatedBy: 'Esther Wambui', adminId: 'wf-admin-wambui', illustrative: true,
    stages: petitionsStages, approvalsCount: 3, outputs: ['PDF', 'Accessible HTML'],
    rolesSummary: ['Participation Officer', 'Procedural Reviewer', 'Committee Clerk', 'Records Officer'],
    previewNotes: [
      { category: 'System', title: 'Configuration in review', body: 'Admissibility rules are being updated for approval.', at: 'Today, 11:30 AM' },
      { category: 'Review', title: 'New petition received', body: 'A public petition is awaiting completeness checks.', at: '07 Jul, 1:05 PM' },
    ],
    comparison: {
      directorate: 'DLS / DLPS', version: 'v1.5', status: 'Draft', stages: 5, activeRecords: 11, approvals: 3,
      pboDependency: 'Not required', keyDocuments: ['Petition', 'Admissibility note', 'Committee report'],
      duration: 'Weeks',
    },
  },
  {
    type: 'Motion', slug: 'motions', name: 'Motions Workflow', workflowId: 'WF-MO-001',
    description: 'Workflow for notice, review, scheduling and resolution of motions.',
    directorate: 'Directorate of Legal Services', directorateAbbrev: 'DLS',
    version: 'v2.0', publishState: 'Published', configStatus: 'Complete', activeRecords: 19,
    lastUpdated: '2026-07-10', lastUpdatedBy: 'Brian Ndiritu', adminId: 'wf-admin-ndiritu', illustrative: true,
    stages: motionsStages, approvalsCount: 2, outputs: ['PDF', 'Accessible HTML'],
    rolesSummary: ['Motions Officer', 'Legal Reviewer', 'Clerk (Procedural)', 'Records Officer'],
    previewNotes: [
      { category: 'Review', title: 'Notice of motion', body: 'A new notice of motion is awaiting review.', at: 'Today, 9:40 AM' },
      { category: 'Deadline', title: 'Scheduled for debate', body: 'Motion scheduled for next week’s sitting.', at: 'Yesterday, 4:00 PM' },
    ],
    comparison: {
      directorate: 'DLS', version: 'v2.0', status: 'Published', stages: 5, activeRecords: 19, approvals: 2,
      pboDependency: 'Not required', keyDocuments: ['Notice of motion', 'Review note'],
      duration: 'Days to weeks',
    },
  },
  {
    type: 'Papers Laid', slug: 'papers-laid', name: 'Papers Laid Workflow', workflowId: 'WF-PL-001',
    description: 'Workflow for intake, metadata confirmation, sitting linkage and filing of papers.',
    directorate: 'Directorate of Legal Services', directorateAbbrev: 'DLS / DLPS',
    version: 'v2.2', publishState: 'Published', configStatus: 'Active', activeRecords: 16,
    lastUpdated: '2026-07-11', lastUpdatedBy: 'Caroline Mutua', adminId: 'wf-admin-mutua-c', illustrative: true,
    stages: papersStages, approvalsCount: 1, outputs: ['PDF', 'Accessible HTML'],
    rolesSummary: ['Papers Officer', 'Records Officer', 'Procedural Reviewer'],
    previewNotes: [
      { category: 'System', title: 'Paper laid', body: 'A report has been laid and needs metadata confirmation.', at: 'Today, 8:50 AM' },
      { category: 'Approval', title: 'Filed', body: 'Sessional paper filed and made searchable.', at: 'Yesterday, 5:10 PM' },
    ],
    comparison: {
      directorate: 'DLS / DLPS', version: 'v2.2', status: 'Published', stages: 4, activeRecords: 16, approvals: 1,
      pboDependency: 'Not required', keyDocuments: ['Laid paper', 'Metadata sheet'],
      duration: 'Days',
    },
  },
  {
    type: 'Bill', slug: 'bills', name: 'Bills Workflow', workflowId: 'WF-BILLS-001',
    description: 'Full Bill lifecycle from instruction to authoritative publication.',
    directorate: 'Directorate of Legal Services', directorateAbbrev: 'DLS',
    version: 'v3.2', publishState: 'Published', configStatus: 'Complete', activeRecords: 12,
    lastUpdated: '2026-07-12', lastUpdatedBy: 'Grace Wanjiku', adminId: 'wf-admin-njeri', illustrative: false,
    stages: billStages, approvalsCount: 4, outputs: ['PDF', 'HTML', 'AKN XML'],
    rolesSummary: ['Drafter', 'Reviewer', 'Legal Reviewer', 'Clerk', 'Procedural Reviewer', 'Director, DLS'],
    previewNotes: [
      { category: 'Review', title: 'Review requested', body: 'Legal review requested for Clause 14.', at: 'Today, 10:42 AM' },
      { category: 'Deadline', title: 'Deadline approaching', body: 'Publication due in 2 days.', at: 'Tomorrow, 4:00 PM' },
    ],
    comparison: {
      directorate: 'DLS', version: 'v3.2', status: 'Published', stages: 6, activeRecords: 12, approvals: 4,
      pboDependency: 'Often (assessment required)', keyDocuments: ['Draft Bill', 'Explanatory memorandum', 'PBO assessment', 'Legal opinion'],
      duration: 'Weeks to months',
    },
  },
  {
    type: 'Statutory Instrument', slug: 'statutory-instruments', name: 'Statutory Instruments Workflow', workflowId: 'WF-SI-001',
    description: 'Workflow for drafting, reviewing and publishing statutory instruments.',
    directorate: 'Directorate of Legal Services', directorateAbbrev: 'DLS',
    version: 'v1.7', publishState: 'Draft', configStatus: 'Needs Review', activeRecords: 9,
    lastUpdated: '2026-07-06', lastUpdatedBy: 'Patrick Odhiambo', adminId: 'wf-admin-odhiambo', illustrative: true,
    stages: siStages, approvalsCount: 2, outputs: ['PDF', 'HTML', 'AKN XML'],
    rolesSummary: ['Drafter', 'Legal Reviewer', 'Compliance Officer', 'Director, DLS'],
    previewNotes: [
      { category: 'System', title: 'Compliance rules under review', body: 'Parent-Act compliance checks are being updated.', at: 'Today, 12:20 PM' },
      { category: 'Review', title: 'Instrument in drafting', body: 'A statutory instrument is being drafted for review.', at: '06 Jul, 3:45 PM' },
    ],
    comparison: {
      directorate: 'DLS', version: 'v1.7', status: 'Draft', stages: 5, activeRecords: 9, approvals: 2,
      pboDependency: 'Conditional', keyDocuments: ['Draft instrument', 'Compliance checklist', 'Parent Act reference'],
      duration: 'Weeks',
    },
  },
  {
    type: 'Supply', slug: 'supply', name: 'Supply Workflow', workflowId: 'WF-SU-001',
    description: 'Workflow for supply estimates, financial clearance, review and publication.',
    directorate: 'Directorate of Legislative and Procedural Services', directorateAbbrev: 'DLS / DLPS',
    version: 'v1.0', publishState: 'Published', configStatus: 'Active', activeRecords: 8,
    lastUpdated: '2026-07-05', lastUpdatedBy: 'Beatrice Auma', adminId: 'wf-admin-auma', illustrative: true,
    stages: supplyStages, approvalsCount: 5, outputs: ['PDF', 'HTML', 'AKN XML'],
    rolesSummary: ['Supply Officer', 'Budget Liaison', 'Committee Clerk', 'Legal Reviewer', 'Director, DLPS'],
    previewNotes: [
      { category: 'System', title: 'Financial clearance pending', body: 'PBO / financial clearance requested for the schedule.', at: 'Today, 11:05 AM' },
      { category: 'Review', title: 'Estimates received', body: 'New estimates received and compiled.', at: '05 Jul, 2:30 PM' },
    ],
    comparison: {
      directorate: 'DLS / DLPS', version: 'v1.0', status: 'Published', stages: 7, activeRecords: 8, approvals: 5,
      pboDependency: 'Required (financial clearance)', keyDocuments: ['Estimates', 'Procurement documents', 'Financial clearance', 'Contract documents'],
      duration: 'Weeks',
    },
  },
];
