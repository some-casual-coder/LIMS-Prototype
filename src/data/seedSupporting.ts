import type {
  Version, Task, AppNotification, Submission, Comment,
  AiSuggestion, ValidationIssue,
} from './types';

const PRIMARY = 'NA-BILL-2026-015';

// 4–6 versions of the primary Bill. No version is ever deletable.
export const versionsSeed: Version[] = [
  {
    id: 'v-015-1', recordId: PRIMARY, version: '1.0', label: 'Initial Draft', status: 'Initial Draft',
    createdById: 'dls-drafter', createdAt: '2026-05-18T09:15:00+03:00',
    reason: 'Initial draft prepared from the approved Bill template.',
    approvalState: 'Superseded', recordIdentifier: 'REC-015-0001', outputs: ['HTML'],
  },
  {
    id: 'v-015-2', recordId: PRIMARY, version: '2.0', label: 'Internal Review Draft', status: 'Internal Review Draft',
    createdById: 'dls-drafter', createdAt: '2026-06-04T14:40:00+03:00',
    reason: 'Incorporated internal drafting review comments on Clauses 4–9.',
    approvalState: 'Superseded', recordIdentifier: 'REC-015-0002', outputs: ['HTML'],
  },
  {
    id: 'v-015-3', recordId: PRIMARY, version: '3.0', label: 'Revised Draft', status: 'Revised Draft',
    createdById: 'dls-drafter', createdAt: '2026-06-24T11:05:00+03:00',
    reason: 'Restructured vulnerable-user protections and added assisted access provisions.',
    approvalState: 'Superseded', recordIdentifier: 'REC-015-0003', outputs: ['HTML', 'PDF'],
  },
  {
    id: 'v-015-4', recordId: PRIMARY, version: '4.0', label: 'Legal Review Draft', status: 'Legal Review Draft',
    createdById: 'dls-drafter', createdAt: '2026-07-14T10:42:00+03:00',
    reason: 'Submitted for legal review with revised Clause 14 and cross-references.',
    approvalState: 'Submitted', recordIdentifier: 'REC-015-0004', outputs: ['HTML', 'PDF'], isOfficial: false,
  },
  {
    id: 'v-015-41', recordId: PRIMARY, version: '4.1', label: 'Clause 14 Correction', status: 'Correction',
    createdById: 'dls-drafter', createdAt: '2026-07-15T00:00:00+03:00',
    reason: 'Correction to the Clause 14 cross-reference raised in legal review.',
    approvalState: 'Draft', recordIdentifier: 'REC-015-0005', outputs: [],
  },
  {
    id: 'v-015-5', recordId: PRIMARY, version: '5.0', label: 'Approved Legal Version', status: 'Approved Legal Version',
    createdById: 'dls-reviewer', createdAt: '2026-07-15T00:00:00+03:00',
    reason: 'Not yet approved.', approvalState: 'Not yet available', recordIdentifier: 'REC-015-0006', outputs: [],
  },
];

// 12–20 tasks across records; several tied to the primary Bill.
export const tasksSeed: Task[] = [
  { id: 't-101', recordId: PRIMARY, title: 'Complete legal review of Version 4.0', assigneeId: 'dls-reviewer', dueDate: '2026-07-16', status: 'In Progress', stage: 'Legal Review' },
  { id: 't-102', recordId: PRIMARY, title: 'Resolve blocking comment on Clause 14', assigneeId: 'dls-drafter', dueDate: '2026-07-16', status: 'Open', stage: 'Legal Review', dependency: 't-101' },
  { id: 't-103', recordId: PRIMARY, title: 'Confirm accessibility metadata complete', assigneeId: 'dls-drafter', dueDate: '2026-07-17', status: 'Open', stage: 'Legal Review' },
  { id: 't-104', recordId: PRIMARY, title: 'Prepare procedural review checklist', assigneeId: 'dlps-officer', dueDate: '2026-07-19', status: 'Open', stage: 'Procedural Review', dependency: 't-101' },
  { id: 't-105', recordId: 'NA-BILL-2026-011', title: 'Finalise procedural review', assigneeId: 'dlps-officer', dueDate: '2026-07-18', status: 'In Progress', stage: 'Procedural Review' },
  { id: 't-106', recordId: 'NA-BILL-2026-004', title: 'Route for signature', assigneeId: 'dlps-officer', dueDate: '2026-07-18', status: 'Open', stage: 'Awaiting Signature' },
  { id: 't-107', recordId: 'NA-BILL-2026-019', title: 'Complete internal drafting review', assigneeId: 'dls-drafter', dueDate: '2026-08-01', status: 'In Progress', stage: 'Drafting' },
  { id: 't-108', recordId: 'NA-SI-2026-016', title: 'Align regulations with Clause 5 standards', assigneeId: 'counsel-mumo', dueDate: '2026-07-24', status: 'Open', stage: 'Legal Review' },
  { id: 't-109', recordId: 'NA-VP-2026-088', title: 'Obtain signature authorisation', assigneeId: 'clerk', dueDate: '2026-07-15', status: 'Open', stage: 'Awaiting Signature' },
  { id: 't-110', recordId: 'NA-OP-2026-089', title: 'Confirm order of business', assigneeId: 'dlps-officer', dueDate: '2026-07-15', status: 'Blocked', stage: 'Procedural Review' },
  { id: 't-111', recordId: 'NA-SUP-2026-003', title: 'Complete supply procedural review', assigneeId: 'dlps-officer', dueDate: '2026-07-20', status: 'In Progress', stage: 'Procedural Review' },
  { id: 't-112', recordId: PRIMARY, title: 'Review two new public submissions', assigneeId: 'participation-officer', dueDate: '2026-07-16', status: 'Open', stage: 'Legal Review' },
  { id: 't-113', recordId: 'NA-PET-2026-014', title: 'Assess petition admissibility', assigneeId: 'dlps-officer', dueDate: '2026-07-22', status: 'Open', stage: 'Procedural Review' },
  { id: 't-114', recordId: 'NA-STMT-2026-050', title: 'Review committee statement', assigneeId: 'dls-reviewer', dueDate: '2026-07-23', status: 'Open', stage: 'Legal Review' },
  { id: 't-115', recordId: PRIMARY, title: 'Version 3.0 comments incorporated', assigneeId: 'dls-drafter', dueDate: '2026-06-24', status: 'Completed', stage: 'Drafting', completedAt: '2026-06-24T11:05:00+03:00' },
];

// 10–15 notifications across recipients.
export const notificationsSeed: AppNotification[] = [
  { id: 'n-201', category: 'Review', recipientId: 'dls-reviewer', recordId: PRIMARY, title: 'Legal review requested', body: 'Digital Public Services Bill, 2026 — Version 4.0 submitted for legal review by Grace Wanjiku.', createdAt: '2026-07-14T10:43:00+03:00', read: false },
  { id: 'n-202', category: 'Public Submission', recipientId: 'participation-officer', recordId: PRIMARY, title: 'Two new public submissions', body: 'Two submissions received on the Digital Public Services Bill, 2026 and are awaiting completeness checks.', createdAt: '2026-07-14T12:05:00+03:00', read: false },
  { id: 'n-203', category: 'Deadline', recipientId: 'dls-drafter', recordId: PRIMARY, title: 'Due in two days', body: 'Digital Public Services Bill, 2026 is due on 24 July 2026. Legal review is in progress.', createdAt: '2026-07-14T08:00:00+03:00', read: false },
  { id: 'n-204', category: 'Assignment', recipientId: 'dlps-officer', recordId: 'NA-BILL-2026-011', title: 'Procedural review assigned', body: 'Affordable Housing Levy (Amendment) Bill, 2026 assigned to you for procedural review.', createdAt: '2026-07-12T16:11:00+03:00', read: true },
  { id: 'n-205', category: 'Approval', recipientId: 'clerk', recordId: 'NA-BILL-2026-004', title: 'Awaiting authorisation', body: 'County Governments (Public Participation) Bill, 2026 is awaiting signature authorisation.', createdAt: '2026-07-11T11:31:00+03:00', read: false },
  { id: 'n-206', category: 'Publication', recipientId: 'clerk', recordId: 'NA-BILL-2026-008', title: 'Publication complete', body: 'Public Finance Management (Amendment) Bill, 2026 was published on 1 June 2026.', createdAt: '2026-06-01T09:05:00+03:00', read: true },
  { id: 'n-207', category: 'Return', recipientId: 'dls-drafter', recordId: PRIMARY, title: 'Awaiting your action', body: 'A blocking comment is open on Clause 14. Resolve it to progress legal review.', createdAt: '2026-07-14T13:20:00+03:00', read: false },
  { id: 'n-208', category: 'Deadline', recipientId: 'dlps-officer', recordId: 'NA-OP-2026-089', title: 'Order Paper due today', body: 'Order Paper for Wednesday, 15 July 2026 requires confirmation before the sitting.', createdAt: '2026-07-14T17:31:00+03:00', read: false },
  { id: 'n-209', category: 'System', recipientId: 'ict-admin', title: 'Scheduled backup complete', body: 'Nightly backup completed successfully. Integrity verification passed.', createdAt: '2026-07-14T02:00:00+03:00', read: true },
  { id: 'n-210', category: 'Review', recipientId: 'dls-reviewer', recordId: 'NA-STMT-2026-050', title: 'Statement review requested', body: 'Statement on Digital Public Services Rollout submitted for legal review.', createdAt: '2026-07-11T16:01:00+03:00', read: true },
  { id: 'n-211', category: 'Deadline', recipientId: 'clerk', recordId: 'NA-VP-2026-088', title: 'Signature required today', body: 'Votes and Proceedings for 14 July 2026 awaits signature authorisation.', createdAt: '2026-07-14T19:01:00+03:00', read: false },
  { id: 'n-212', category: 'Public Submission', recipientId: 'participation-officer', recordId: 'NA-PET-2026-014', title: 'New petition submissions', body: 'Three new submissions received on the Petition on Access to Digital Government Services in Rural Areas.', createdAt: '2026-07-11T14:05:00+03:00', read: true },
];

// 8–12 citizen submissions. PPS-2026-00841 is the tracked reference.
export const submissionsSeed: Submission[] = [
  { id: 'PPS-2026-00841', recordId: PRIMARY, participantType: 'Individual', participantName: 'James Mwangi', email: 'j.mwangi@example.co.ke', phone: '+254700000841', county: 'Nairobi', clauseNumber: 14, position: 'Suggest amendment', text: 'Clause 14 should require that at least one non-digital access point be maintained in every sub-county, not merely at locations that are "reasonably accessible". Rural residents often travel long distances to reach any government office.', attachments: ['supporting-note.pdf'], submittedAt: '2026-07-14T11:58:00+03:00', citizenStatus: 'Received', completeness: 'Complete', duplicateRisk: 'None', citizenMessage: 'Your submission has been received and is awaiting a completeness check.', lastUpdated: '2026-07-14T11:58:00+03:00' },
  { id: 'PPS-2026-00838', recordId: PRIMARY, participantType: 'Organisation', participantName: 'Grace Kilonzo', organisation: 'Kenya Disability Rights Alliance', email: 'info@kdra.example.org', county: 'Machakos', clauseNumber: 5, position: 'Support', text: 'We strongly support Clause 5. We recommend that the accessibility standards referenced be published within six months of commencement so that public entities have a clear compliance target.', attachments: ['kdra-position-paper.pdf'], submittedAt: '2026-07-13T15:20:00+03:00', citizenStatus: 'Under parliamentary review', completeness: 'Complete', duplicateRisk: 'None', assignedOfficerId: 'participation-officer', internalNote: 'Substantive organisational submission — route to DLS.', citizenMessage: 'Your submission is under parliamentary review.', lastUpdated: '2026-07-14T09:00:00+03:00' },
  { id: 'PPS-2026-00835', recordId: PRIMARY, participantType: 'Individual', participantName: 'Aisha Noor', email: 'aisha.noor@example.co.ke', county: 'Garissa', clauseNumber: 6, position: 'Support', text: 'Assisted digital access is essential in areas with low literacy. Please ensure staff at access points are trained to help in local languages.', attachments: [], submittedAt: '2026-07-13T10:05:00+03:00', citizenStatus: 'Under parliamentary review', completeness: 'Complete', duplicateRisk: 'Low', assignedOfficerId: 'participation-officer', citizenMessage: 'Your submission is under parliamentary review.', lastUpdated: '2026-07-13T16:00:00+03:00' },
  { id: 'PPS-2026-00830', recordId: PRIMARY, participantType: 'Individual', participantName: 'Peter Kariuki', email: 'p.kariuki@example.co.ke', county: 'Nakuru', clauseNumber: 7, position: 'Oppose', text: 'I am concerned that identity verification requirements may still exclude people without a national ID. The Bill should address this explicitly.', attachments: [], submittedAt: '2026-07-12T18:40:00+03:00', citizenStatus: 'Associated with legislative process', completeness: 'Complete', duplicateRisk: 'None', assignedOfficerId: 'participation-officer', citizenMessage: 'Your submission has been associated with the legislative process.', lastUpdated: '2026-07-13T11:00:00+03:00' },
  { id: 'PPS-2026-00827', recordId: PRIMARY, participantType: 'Individual', participantName: 'Mary Wambui', email: 'm.wambui@example.co.ke', county: 'Kiambu', position: 'General observation', text: 'This is a welcome Bill. Please make the plain-language summary available in more languages.', attachments: [], submittedAt: '2026-07-12T09:15:00+03:00', citizenStatus: 'Under parliamentary review', completeness: 'Complete', duplicateRisk: 'None', assignedOfficerId: 'participation-officer', citizenMessage: 'Your submission is under parliamentary review.', lastUpdated: '2026-07-12T14:00:00+03:00' },
  { id: 'PPS-2026-00824', recordId: PRIMARY, participantType: 'Individual', participantName: 'John Otieno', email: 'j.otieno@example.co.ke', county: 'Kisumu', clauseNumber: 14, position: 'Suggest amendment', text: 'Clause 14 protections should extend to older persons who may not be captured by the disability definition.', attachments: [], submittedAt: '2026-07-11T13:00:00+03:00', citizenStatus: 'Completeness check', completeness: 'Incomplete', duplicateRisk: 'Possible', internalNote: 'Possible duplicate of PPS-2026-00841 — confirm before routing.', citizenMessage: 'Your submission is undergoing a completeness check.', lastUpdated: '2026-07-11T15:30:00+03:00' },
  { id: 'PPS-2026-00819', recordId: PRIMARY, participantType: 'Organisation', participantName: 'Samuel Leteipa', organisation: 'Rural Connectivity Forum', email: 'contact@rcf.example.org', county: 'Kajiado', clauseNumber: 8, position: 'Support', text: 'Service availability reporting under Clause 8 should be disaggregated by region so that rural service gaps are visible.', attachments: ['rcf-brief.pdf'], submittedAt: '2026-07-10T16:45:00+03:00', citizenStatus: 'Consideration completed', completeness: 'Complete', duplicateRisk: 'None', assignedOfficerId: 'participation-officer', citizenMessage: 'Consideration of your submission is complete.', lastUpdated: '2026-07-12T10:00:00+03:00' },
  { id: 'PPS-2026-00812', recordId: 'NA-PET-2026-014', participantType: 'Individual', participantName: 'Fatuma Ali', email: 'f.ali@example.co.ke', county: 'Marsabit', position: 'General observation', text: 'Please expand mobile service points for government services in remote areas.', attachments: [], submittedAt: '2026-07-09T12:00:00+03:00', citizenStatus: 'Under parliamentary review', completeness: 'Complete', duplicateRisk: 'None', assignedOfficerId: 'participation-officer', citizenMessage: 'Your submission is under parliamentary review.', lastUpdated: '2026-07-10T09:00:00+03:00' },
];

// Seed comments on the primary Bill; Clause 14 carries a blocking comment.
export const commentsSeed: Comment[] = [
  { id: 'C-104', recordId: PRIMARY, clauseNumber: 14, authorId: 'dls-reviewer', text: 'The cross-reference in subsection (3) points to section 13 but should be confirmed against the renumbered performance-reporting clause. Marking as blocking until resolved.', createdAt: '2026-07-14T13:15:00+03:00', blocking: true, resolved: false },
  { id: 'C-103', recordId: PRIMARY, clauseNumber: 14, authorId: 'dls-reviewer', text: 'Consider whether "reasonably accessible" in paragraph (b) needs a defined threshold.', createdAt: '2026-07-14T13:10:00+03:00', blocking: false, resolved: false },
  { id: 'C-098', recordId: PRIMARY, clauseNumber: 5, authorId: 'counsel-mumo', text: 'Confirm the accessibility standard citation once the accompanying regulations are finalised.', createdAt: '2026-07-13T10:00:00+03:00', blocking: false, resolved: true },
  { id: 'C-095', recordId: PRIMARY, clauseNumber: 6, authorId: 'dls-drafter', text: 'Resolved: assisted access confirmed to be at no additional cost.', createdAt: '2026-07-12T09:30:00+03:00', blocking: false, resolved: true },
];

// Pre-authored, advisory AI suggestions. Never auto-applied.
export const aiSuggestionsSeed: AiSuggestion[] = [
  {
    id: 'ai-c14-clarity', recordId: PRIMARY, clauseNumber: 14, kind: 'Clearer wording',
    targetText: 'ensure that assisted digital access under section 6 is available at locations reasonably accessible to vulnerable users',
    suggestedText: 'ensure that assisted digital access under section 6 is available at locations that vulnerable users can reach without unreasonable difficulty, having regard to distance, cost and connectivity',
    explanation: 'Replaces the open-ended phrase "reasonably accessible" with concrete factors, which addresses the reviewer’s comment and improves legal certainty. This is a suggestion only — review before inserting.',
  },
  {
    id: 'ai-c14-consistency', recordId: PRIMARY, clauseNumber: 14, kind: 'Consistency',
    targetText: 'in accordance with section 13',
    suggestedText: 'in accordance with section 13 (service performance reporting)',
    explanation: 'Adds a parenthetical clause title to make the cross-reference self-explanatory and easier to verify. Advisory only.',
  },
  {
    id: 'ai-c14-note', recordId: PRIMARY, clauseNumber: 14, kind: 'Explanatory note',
    targetText: 'A public entity shall take all reasonable measures to ensure that a vulnerable user is not disadvantaged',
    suggestedText: 'Explanatory note: Clause 14 places a positive duty on public entities to prevent disadvantage to vulnerable users, complementing the accessibility duty in Clause 5 and the assisted-access duty in Clause 6.',
    explanation: 'A drafting note for internal use; it would not form part of the enacted text. Advisory only.',
  },
];

// Rule-based validation. The Clause 14 cross-reference issue is resolvable in the demo.
export const validationSeed: ValidationIssue[] = [
  { id: 'val-1', recordId: PRIMARY, severity: 'Info', message: 'Clause numbering is valid and sequential.', resolved: true, resolvable: false },
  { id: 'val-2', recordId: PRIMARY, severity: 'Info', message: 'Required metadata is complete.', resolved: true, resolvable: false },
  { id: 'val-3', recordId: PRIMARY, clauseNumber: 14, severity: 'Warning', message: 'Cross-reference in Clause 14 requires review — confirm the reference to section 13.', resolved: false, resolvable: true },
  { id: 'val-4', recordId: PRIMARY, clauseNumber: 2, severity: 'Info', message: 'All defined terms are introduced before first use.', resolved: true, resolvable: false },
  { id: 'val-5', recordId: PRIMARY, severity: 'Info', message: 'No unresolved structural errors detected.', resolved: true, resolvable: false },
];
