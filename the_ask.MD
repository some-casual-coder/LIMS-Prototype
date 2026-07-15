Yes. The strongest approach is **not five isolated screens**. It is one coherent, clickable legislative journey with five visually exceptional “hero screens” supported by enough secondary screens, drawers, modals and state changes to make the system feel real.

The coding is achievable with React and AI-assisted development. The bigger risks are inconsistent data, generic government-dashboard design, dead buttons, and a demo path that does not tell a clear story. A strong developer could build this in roughly **7–10 focused working days**, assuming the design direction and sample content are settled. It should not be treated as a two-day throwaway because polish and demo reliability are what will make it tender-winning.

Below is a brief that can be handed directly to the prototype developer.

---

# LIMS Functional Mock Prototype

## Product, UX and Implementation Brief

## 1. Project overview

Build a high-fidelity, functional front-end prototype of a **Legislative Information Management System for the National Assembly of Kenya**.

The prototype must demonstrate how the National Assembly can:

* Receive legislative instructions.
* Create and manage legislative records.
* Draft structured Bills.
* Review and redline proposed changes.
* Route work through controlled workflows.
* Preserve every version.
* Approve, sign, seal and publish official documents.
* Search current and historical legislative information.
* Receive and process citizen participation.
* Monitor performance and compliance.
* Produce a complete audit trail.

The proposed real system covers legislative drafting, document management, workflow processing, archival, search, public participation, security and auditability. Its three desired outcomes are increased productivity, legally defensible quality and compliance, and permission-aware knowledge sharing. 

This prototype is intended for a tender demonstration. It is not a production application and will not connect to an actual backend.

---

# 2. Core product statement

> **LIMS is the National Assembly’s single trusted workspace for creating, processing, approving, publishing, finding and auditing legislative information.**

The prototype should make that statement visually and functionally obvious.

It must not feel like:

* A generic records-management system.
* A collection of unrelated dashboards.
* A basic document uploader.
* A Microsoft Word clone.
* A public website with an admin panel attached.

It should feel like a purpose-built legislative operating system.

---

# 3. Prototype strategy

## 3.1 Five hero screens

These are the five screens that should receive the highest level of visual detail and presentation polish:

1. **Legislative Command Centre**
2. **Bill Workspace**
3. **Structured Drafting and Redline Workspace**
4. **Legislative Search and Knowledge Explorer**
5. **Public Participation Experience**

These are the screens that can be featured in screenshots and shown as the central evidence of UI/UX quality.

## 3.2 Supporting screens

The prototype should also include enough supporting routes and states to complete the journey:

* Create Legislative Instruction
* Version History and Comparison
* Workflow and Approvals
* Signature, Seal and Publication
* Public Participation Staff Inbox
* OCR Import and Verification
* Clerk’s Analytics Dashboard
* Audit and Compliance Explorer
* Notifications
* Document Archive

The result will probably contain approximately:

* **5 hero screens**
* **10–14 supporting routes**
* **20–30 modal, drawer, loading, confirmation and status states**
* Approximately **11 genuinely different page layouts**, because several routes will reuse the same shell and components

This is more manageable than building 20 completely different designs.

---

# 4. Prototype type

The output must be a static React application that builds into files that can be uploaded directly to a CDN or static host.

## Required characteristics

* React
* TypeScript
* Vite or equivalent static build tool
* No production backend
* No mandatory environment variables
* No API keys
* No database
* No authentication provider
* No paid external services
* All data bundled with the application
* All important demo interactions functional
* Build output generated into a `dist` directory
* Deployable to Cloudflare Pages, Netlify, Vercel, GitHub Pages, S3/CloudFront or another CDN host

## Routing

Use one of the following:

* `HashRouter`, which is safest for raw CDN hosting without rewrite rules.
* `BrowserRouter` only where the host is configured to return `index.html` for unknown routes.

For the safest tender handover, `HashRouter` is recommended.

Example routes:

```text
/#/login
/#/dashboard
/#/work
/#/legislative/new
/#/legislative/NA-BILL-2026-015
/#/legislative/NA-BILL-2026-015/draft
/#/legislative/NA-BILL-2026-015/versions
/#/legislative/NA-BILL-2026-015/workflow
/#/legislative/NA-BILL-2026-015/publish
/#/search
/#/documents/import
/#/participation
/#/analytics
/#/audit

/#/public
/#/public/bills/NA-BILL-2026-015
/#/public/bills/NA-BILL-2026-015/participate
/#/public/track/PPS-2026-00841
```

---

# 5. Important prototype principles

## 5.1 One connected story

Every primary screen should revolve around the same sample Bill and related records.

A user should be able to see a Bill on the dashboard, open its workspace, edit it, send it for review, approve it, publish it, find it through search and see citizen submissions connected to it.

## 5.2 No dead buttons on the main demo path

Every button used during the demonstration must:

* Open a route.
* Change a visible state.
* Open a relevant modal.
* Start a loading animation.
* Create a notification.
* Update a status.
* Download a sample file.
* Show a confirmation.

Buttons outside the main path may be disabled, but they must display a meaningful tooltip such as:

> Available when the Parliamentary Budget Office integration is configured.

## 5.3 AI must remain visibly human-controlled

The proposal states that AI output is only advisory and cannot modify canonical content without explicit user confirmation. 

Therefore:

* AI suggestions must never silently replace document text.
* The user must choose **Insert**, **Edit before inserting**, or **Dismiss**.
* Accepted AI suggestions must appear in the audit activity.
* The interface should label AI content as a suggestion.
* The prototype may display “Local AI available” or “Secure AI assistant”.

## 5.4 The official version must always be clear

Every legislative screen must make it easy to identify:

* Current working version
* Latest approved version
* Published version
* Draft versus official output
* Who owns the document
* Current lifecycle stage
* Access classification

## 5.5 Public and internal experiences must be visually separate

The proposal treats the public portal as a separate component with its own citizen identity environment and controlled routing into the internal system. 

Therefore:

* The public portal should not use the internal application sidebar.
* Citizens should never see internal comments, staff identities, confidential documents or approval controls.
* Public submissions must appear in an internal review queue before being associated with the official legislative record.

---

# 6. Users and personas

All prototype names should be synthetic and labelled as demonstration data where appropriate.

## 6.1 Senior Legal Counsel — DLS drafter

**Demo persona:** Grace Wanjiku
**Directorate:** Directorate of Legal Services
**Role:** Senior Legal Counsel

### Primary goals

* Register a legislative instruction.
* Start a Bill from an approved template.
* Draft and structure clauses.
* Review AI suggestions.
* Resolve comments.
* Run document validation.
* Submit the draft for review.
* Respond to returned work.
* Generate a new version.

### Main concerns

* Working on the correct version.
* Avoiding formatting and numbering mistakes.
* Meeting due dates.
* Knowing which comments remain unresolved.
* Ensuring the draft is legally and structurally valid.

---

## 6.2 DLS reviewer or director

**Demo persona:** David Otieno
**Role:** Director or Principal Reviewer, DLS

### Primary goals

* See items awaiting legal review.
* Compare the submitted draft with the previous version.
* Review proposed changes.
* Accept or reject redlines.
* Add comments against specific clauses.
* Return the document for revision.
* Approve the legal review stage.

### Main concerns

* Whether all changes are visible.
* Whether comments have been resolved.
* Whether the correct officer made each change.
* Whether approving the draft will lock or advance the version.

---

## 6.3 DLPS procedural officer

**Demo persona:** Ruth Naliaka
**Directorate:** Directorate of Legislative and Procedural Services

### Primary goals

* Perform procedural review.
* Confirm document readiness.
* Associate the Bill with relevant parliamentary business.
* Confirm publication information.
* Prepare the official output.
* Route the Bill for signature or final authorisation.

### Main concerns

* Correct lifecycle stage.
* Completeness.
* Scheduling and publication deadlines.
* Correct official format.
* Whether legal review is complete.

---

## 6.4 Clerk or senior executive

**Demo persona:** Office of the Clerk

### Primary goals

* See legislative workload across directorates.
* Identify delayed or blocked work.
* View items requiring approval.
* Monitor sitting and publication readiness.
* Inspect compliance.
* Review public-participation activity.
* Export an audit report.

### Main concerns

* Institutional readiness.
* Bottlenecks.
* Accountability.
* Compliance.
* Whether parliamentary business is at risk.

---

## 6.5 Public Participation Officer

**Demo persona:** Miriam Achieng

### Primary goals

* Review new public submissions.
* Check completeness and attachments.
* Detect duplicates or irrelevant material.
* Classify a submission.
* Route it to the correct Bill or directorate.
* Update citizen-visible status.
* Respond to citizen queries.

### Main concerns

* Citizen privacy.
* Incomplete submissions.
* Duplicate submissions.
* Correct internal routing.
* Maintaining a clear public status without revealing confidential internal information.

---

## 6.6 Citizen

**Demo persona:** James Mwangi

### Primary goals

* Find a Bill open for public participation.
* Understand the Bill in accessible language.
* Read or download the official document.
* Submit comments.
* Upload supporting evidence.
* Receive a reference number.
* Track the submission.

### Main concerns

* Whether their input was received.
* Where their submission is in the process.
* What information is public.
* Whether the process is understandable on a phone.

---

## 6.7 ICT administrator

This is a secondary persona and does not need a full hero journey.

### Primary goals

* Manage users and roles.
* Configure workflow rules.
* View system status.
* Configure document types.
* Verify backups.
* Export operational reports.

The proposal expects National Assembly ICT staff eventually to manage users, roles, configuration, workflows and audit exports independently. 

---

# 7. Illustrative permissions matrix

The exact production permission model will be confirmed during inception. This prototype matrix is illustrative.

| Capability                     |   DLS Drafter | DLS Reviewer |       DLPS Officer |        Clerk |  Public Officer |  Citizen |
| ------------------------------ | ------------: | -----------: | -----------------: | -----------: | --------------: | -------: |
| Create legislative instruction |           Yes |          Yes |            Limited |           No |              No |       No |
| Edit assigned draft            |           Yes |      Limited |                 No |           No |              No |       No |
| Comment on draft               |           Yes |          Yes |                Yes |    View only |              No |       No |
| Accept or reject redlines      |  Own/assigned |          Yes |            Limited |           No |              No |       No |
| Submit for review              |           Yes |          Yes |                Yes |           No |              No |       No |
| Approve legal stage            |            No |          Yes |                 No |           No |              No |       No |
| Approve procedural stage       |            No |           No |                Yes |           No |              No |       No |
| Final authorisation            |            No |           No |            Limited |          Yes |              No |       No |
| Sign or seal                   |            No |           No |           Initiate |    Authorise |              No |       No |
| Publish                        |            No |           No | Yes after approval |    Authorise |              No |       No |
| View confidential record       | Assigned only |          Yes |      Relevant only |          Yes |              No |       No |
| Process public submissions     |            No |           No |       View summary | View reports |             Yes | Own only |
| Export full audit              |            No |  Directorate |        Directorate |          Yes | Submission only |       No |

Where a user lacks permission:

* The action may be hidden.
* Or the action may be disabled with an explanatory message.
* The prototype should demonstrate at least one permission restriction.

Example:

> You can review and comment on this version, but final approval is restricted to the Director of Legal Services.

---

# 8. Main demonstration record

Use one central fictional record throughout the prototype.

## Sample Bill

**Title:** Digital Public Services Bill, 2026
**Prototype label:** Demonstration Record
**Reference:** NA/BILL/2026/015
**Workflow type:** Bill
**Originating office:** Parliamentary Legislative Proposal Unit
**Responsible directorate:** Directorate of Legal Services
**Assigned drafter:** Grace Wanjiku
**Reviewer:** David Otieno
**Procedural officer:** Ruth Naliaka
**Priority:** High
**Due date:** 24 July 2026
**Confidentiality:** Internal until publication
**Current version:** Version 4.0 — Legal Review Draft
**Public participation:** Open after publication
**Current illustrative stage:** Legal Review

## Suggested Bill structure

The draft should contain realistic but fictional content:

1. Short title
2. Interpretation
3. Application
4. Principles of digital public services
5. Accessibility of digital services
6. Assisted digital access
7. Identity verification
8. Service availability
9. Data minimisation
10. Interoperability
11. Notification of decisions
12. Appeals
13. Service performance reporting
14. Protection of vulnerable users
15. Regulations
16. Transitional provisions
17. Commencement

Clause 14 should be used prominently in the review and audit demonstrations.

The content should be substantial enough to make the editor, search results and version comparisons believable. Avoid lorem ipsum.

---

# 9. Illustrative Bill workflow

The proposal states that the final detailed workflows will be modelled during inception. The prototype must therefore label its sequence as an **illustrative configured workflow**, not as a confirmed official National Assembly process. 

Use the following state machine:

```text
Instruction Received
        ↓
Intake and Assignment
        ↓
Drafting
        ↓
Legal Review
        ↘
     Revision Requested
        ↓
Legal Approval
        ↓
Procedural Review
        ↓
Awaiting Signature
        ↓
Signed and Sealed
        ↓
Published
        ↓
Archived / Superseded
```

Supported backward transitions:

* Legal Review → Revision Requested
* Procedural Review → Revision Requested
* Awaiting Signature → Procedural Review
* Publication check → Revision Requested

Each transition should record:

* Previous stage
* New stage
* Actor
* Date and time
* Comment or reason
* Version
* Resulting task
* Notification recipient

---

# 10. Internal information architecture

## Main navigation

### Home

* Command Centre
* My Work
* Notifications

### Legislative Work

* Bills
* Motions
* Questions
* Statements
* Petitions
* Order Papers
* Votes and Proceedings
* Papers Laid
* Statutory Instruments
* Supply

The proposal explicitly covers these ten workflow types, with DLS, DLPS or both responsible depending on the process. 

### Drafting

* My Drafts
* Templates
* Review Queue

### Documents and Knowledge

* Document Archive
* Search
* OCR Import
* Saved Searches

### Public Participation

* Submission Inbox
* Active Consultations
* Citizen Queries
* Participation Reports

### Oversight

* Executive Analytics
* Audit and Compliance
* Reports

### Administration

* Users and Roles
* Workflow Configuration
* Document Types
* System Status

Only the sections relevant to the selected demo role should appear.

---

# 11. Shared internal application shell

All staff-facing pages should use a common application shell.

## Header

Include:

* National Assembly identity
* “Legislative Information Management System”
* Global search
* Network or sync indicator
* Notification bell
* Help
* Current role
* User profile

## Sidebar

* Expandable and collapsible
* Current section clearly highlighted
* Role-aware
* Avoid excessive nested navigation

## Page header

Each page should have:

* Breadcrumbs
* Clear title
* Supporting context
* Primary action
* Secondary actions
* Classification where applicable

## Status treatment

Statuses must use:

* Text
* Icon
* Shape or badge
* Colour

Colour alone must never communicate meaning.

## Demo environment bar

Add a discreet bar such as:

> Demonstration environment — all records and identities are fictional.

Include two demo controls:

* **Switch role**
* **Reset demonstration**

These controls should be visually separated from real application controls.

---

# 12. Detailed screen inventory

## Screen 1: Demo access and role switcher

**Priority:** P0
**Users:** Presenter and all internal personas

### Purpose

Allow the presenter to enter the prototype as a selected persona without implementing authentication.

### Content

* National Assembly identity
* LIMS product name
* Brief secure-system introduction
* Persona cards:

  * DLS Drafter
  * DLS Reviewer
  * DLPS Officer
  * Clerk
  * Public Participation Officer
  * ICT Administrator
* “Enter workspace” button
* “View public portal” link

### Interaction

Selecting a persona changes:

* Dashboard content
* Available navigation
* Permitted actions
* Notifications
* Assigned tasks
* Profile information

### Mock behaviour

Display a brief “Verifying role and secure access” animation before entering the workspace.

Do not ask for fake passwords unless a simulated MFA step is specifically used during signing.

---

## Screen 2: Legislative Command Centre

**Priority:** P0 and hero screen
**Primary users:** DLS drafter, reviewer and DLPS officer

### Purpose

Give the user an actionable view of work requiring attention.

### Required content

#### Personal work summary

* Assigned to me
* Awaiting my review
* Returned for revision
* Due this week
* Overdue
* Recently completed

#### Priority work queue

Each row should show:

* Legislative title
* Reference
* Workflow type
* Stage
* Priority
* Due date
* Assigned officer
* Last activity
* Required next action

#### Sitting and publication readiness

Display a compact section such as:

* 4 items awaiting procedural review
* 2 items due for publication
* 1 item blocked by unresolved validation issue

#### Recent activity

Examples:

* Version 4.0 submitted for legal review
* Two public submissions received
* Clause 14 comment resolved
* Signature request created

#### Quick actions

* New legislative instruction
* Start from template
* Import historical document
* Search legislative records

### Core interactions

* Filter queue by urgency, stage, workflow and directorate.
* Open a legislative workspace.
* Mark a notification as read.
* Start a new instruction.
* Switch between “My work” and “Directorate work”.
* Save a queue view.

### UX requirement

Do not fill the upper portion with generic charts. The first thing the user should see is what requires action.

---

## Screen 3: My Work queue

**Priority:** P1
**Users:** Internal staff

### Purpose

Provide a larger operational queue than the dashboard.

### Content

* Table and optional card view
* Saved views
* Filter drawer
* Bulk selection
* Sorting
* Search within work items

### Suggested saved views

* Awaiting my action
* Due within 48 hours
* Returned to me
* Awaiting another officer
* Recently completed
* Confidential items
* Publication queue

### Interactions

* Open item
* Reassign, where permitted
* Add reminder
* Export list
* Save filters
* Pin item to dashboard

---

## Screen 4: Create Legislative Instruction

**Priority:** P0
**Primary user:** DLS drafter or authorised intake officer

### Purpose

Register a new Bill or amendment request and create its permanent workspace.

### Format

Use a three-step wizard.

### Step 1: Instruction details

Fields:

* Workflow type
* Title
* Short title
* Instruction type:

  * New Bill
  * Amendment Bill
  * Revision of existing draft
* Sponsor or originating office
* Responsible directorate
* Priority
* Target completion date
* Confidentiality
* Description or drafting instructions

### Step 2: People and supporting material

Fields:

* Assigned drafter
* Reviewer
* Collaborators
* Supporting documents
* Related legislation
* Related parliamentary business
* PBO review required
* Public participation anticipated

### Step 3: Review and create

Show:

* Complete summary
* Missing information warnings
* Generated reference preview
* Workflow preview
* Initial tasks
* Access summary

### Core interactions

* Save as draft
* Upload sample document
* Add related Bill
* Assign officers
* Create instruction
* Cancel with confirmation

### Success state

After creation:

1. Show a processing state:

   * Registering legislative work
   * Assigning permanent reference
   * Creating document workspace
   * Applying workflow
   * Notifying assigned officers
2. Display success:

   * `NA/BILL/2026/015 created`
3. Open the Bill Workspace.

---

## Screen 5: Bill Workspace

**Priority:** P0 and hero screen
**Users:** All authorised internal users

### Purpose

Act as the single source of truth for the legislative item.

### Header

Include:

* Bill title
* Official reference
* Workflow type
* Current stage
* Version
* Priority
* Classification
* Assigned owner
* Due date
* Last updated
* “Demonstration record” indicator

### Primary actions

Depending on role:

* Continue drafting
* Review document
* Submit for review
* Return for revision
* Approve stage
* Request signature
* Publish
* More actions

### Tabs

#### Overview

Show:

* Current stage and stage summary
* Next required action
* Completion checklist
* Responsible officers
* Key dates
* Current blockers
* Short AI-generated summary
* Public-participation status
* Related records

#### Tasks

Show:

* Open tasks
* Assigned user
* Due date
* Status
* Dependency
* Completion history

#### Documents

Show:

* Canonical master
* Supporting files
* Generated outputs
* Scanned records
* File classification
* Version
* Access level

#### Versions

Show version history and official status.

#### Workflow

Show the stage map, approvals and transition history.

#### Public Participation

Show:

* Consultation status
* Opening and closing dates
* Number of submissions
* Submission themes
* Routing status
* Public page preview

#### Activity and Audit

Show a readable timeline of actions.

### Important display pattern

The workspace must explicitly distinguish:

* **Canonical legislative record**
* **Current working version**
* **Generated PDF**
* **Published public version**

The proposal stores legislative content using Akoma Ntoso and treats PDF, HTML and XML as manifestations of the structured record rather than unrelated files. 

### Core interactions

* Open editor.
* Switch tabs.
* Assign or complete task.
* View version.
* Open related record.
* Inspect audit event.
* Submit to next workflow stage.
* Preview public page.
* Download generated output.

---

## Screen 6: Structured Drafting Workspace

**Priority:** P0 and hero screen
**Primary user:** DLS drafter

### Purpose

Demonstrate professional legislative drafting that is structured, validated and version-aware.

### Layout

Use a three-column layout.

#### Left: Document structure

Show:

* Long title
* Preamble
* Parts
* Clauses
* Subclauses
* Schedules
* Metadata

Capabilities:

* Collapse and expand
* Jump to clause
* Show warnings
* Show comments count
* Indicate changed sections

#### Centre: Document editor

Show a page-like legislative document.

Capabilities:

* Rich text editing
* Clause insertion
* Automatic numbering
* Insert subclause
* Add heading
* Add definition
* Create cross-reference
* Add annotation
* Track changes
* Search within document
* Page or continuous layout

#### Right: Context panel

Tabs:

* Comments
* AI Assistant
* Validation
* Metadata
* Related law

### Toolbar

Include:

* Undo and redo
* Formatting
* Insert legislative element
* Track changes
* Compare
* Validate
* AI assistance
* Save
* Submit for review
* More

### AI actions

* Summarise selected clause
* Suggest clearer wording
* Check consistency
* Identify possible ambiguity
* Compare with related provisions
* Draft an explanatory note

Every suggestion must show:

* Suggested text
* Explanation
* Insert
* Edit before inserting
* Dismiss

### Validation

Seed several checks:

* Clause numbering valid
* Required metadata complete
* Cross-reference in Clause 14 requires review
* Defined term used before definition
* No unresolved structural errors

At least one issue should be resolvable during the demonstration.

### Save states

Display:

* Saving…
* Saved locally
* Synced to canonical record
* Version 4.0
* Last saved by Grace Wanjiku at 10:42

### Core interactions

* Select Clause 14.
* Edit text.
* Request an AI suggestion.
* Insert the suggestion only after confirmation.
* Add or resolve a comment.
* Run validation.
* Fix a validation issue.
* Submit for review.

---

## Screen 7: Review and Redline Mode

**Priority:** P0
**Primary user:** DLS reviewer

This may reuse the drafting screen with a review mode rather than being a completely separate layout.

### Required capabilities

* Track additions and deletions.
* View changes by author.
* Accept one change.
* Reject one change.
* Accept all non-controversial changes.
* Comment against a specific clause.
* Request clarification.
* Mark comment as blocking.
* Compare with previous version.
* Return for revision.
* Approve legal stage.

### Visual treatment

* Insertions and deletions must be visible but not visually overwhelming.
* A change summary should show:

  * 8 additions
  * 3 deletions
  * 4 modified clauses
  * 2 unresolved comments
  * 1 blocking issue

### Return-for-revision modal

Require:

* Reason
* Affected clauses
* Due date
* Assignee
* Whether a new version is required

On confirmation:

* Stage changes to Revision Requested.
* Drafter receives notification.
* New task appears.
* Activity timeline is updated.

---

## Screen 8: Version History and Comparison

**Priority:** P0
**Users:** Drafter, reviewer, DLPS, Clerk

### Purpose

Prove that legislative history is preserved.

### Version list

Example:

* Version 1.0 — Initial Draft
* Version 2.0 — Internal Review Draft
* Version 3.0 — Revised Draft
* Version 4.0 — Legal Review Draft
* Version 4.1 — Clause 14 Correction
* Version 5.0 — Approved Legal Version
* Published Version — Not yet available

Each version should show:

* Created by
* Date and time
* Status
* Reason
* Approval state
* Permanent record identifier
* Available outputs

### Comparison modes

* Side by side
* Inline redline
* Change summary
* Changed clauses only

### Core interactions

* Select any two versions.
* Compare them.
* Jump to Clause 14.
* Restore a working copy from a previous version.
* Download PDF, HTML or AKN XML.
* Mark a version as official, only where permitted.

### Important rule

No version should appear deletable.

An action may be labelled:

* Supersede version
* Withdraw working draft
* Create corrected version

But never “Delete legislative history”.

---

## Screen 9: Workflow and Approvals

**Priority:** P0
**Users:** All internal roles

### Purpose

Show where the Bill is, why it is there and what must happen next.

### Main workflow visual

Display the illustrative stage map with:

* Completed stages
* Current stage
* Upcoming stages
* Returned stages
* Blocked stages

### Current stage panel

Show:

* Stage owner
* Entered on
* Time in stage
* Due date
* Required actions
* Required approvals
* Completion criteria
* Blockers

### Approval history

Each approval should display:

* Approver
* Role
* Decision
* Date and time
* Comment
* Version approved
* Signature status

### Core interactions

* Submit to legal review.
* Return for revision.
* Approve legal review.
* Route to procedural review.
* Request signature.
* View permission restriction.
* Inspect past transition.

### Permission demonstration

When logged in as the drafter, display a disabled approval action:

> Final legal approval requires the Director of Legal Services role.

---

## Screen 10: Signature, Seal and Publication Centre

**Priority:** P0
**Primary users:** DLPS officer and authorised approver

### Purpose

Demonstrate controlled generation and publication of official outputs.

### Pre-publication checklist

* Legal approval complete
* Procedural review complete
* No unresolved blocking comments
* AKN validation passed
* Required metadata complete
* Signature verified
* Seal applied
* Public classification confirmed
* Public participation dates configured

### Signature section

Display:

* Signatory
* Role
* Signature certificate status
* Signed version
* Date and time
* Verification status

### Mock signature flow

1. Click “Request signature”.
2. Show identity confirmation.
3. Enter a prefilled or simple demo OTP.
4. Display “Applying qualified electronic signature”.
5. Show signed and verified status.
6. Add an audit event.

### Seal flow

* Select authorised institutional seal.
* Confirm version.
* Apply.
* Show timestamp and custodian.

### Output generation

Generate or simulate:

* Official PDF
* Public HTML
* Akoma Ntoso XML

Use a progress animation:

```text
Validating canonical document
Generating official PDF
Rendering accessible HTML
Preparing AKN XML
Applying publication metadata
Completing publication package
```

### Download behaviour

Bundle sample files in the app and allow actual browser downloads:

* `digital-public-services-bill-2026.pdf`
* `digital-public-services-bill-2026.html`
* `digital-public-services-bill-2026.xml`

### Publication success

Show:

* Published status
* Publication date
* Public URL
* Version
* Signature status
* Public participation period
* “View public page” action

---

## Screen 11: Legislative Search and Knowledge Explorer

**Priority:** P0 and hero screen
**Users:** Internal staff and Clerk

### Purpose

Demonstrate full-text search, semantic search, archive retrieval and institutional memory.

### Search bar

Support example queries:

```text
affordable housing levy
```

```text
legislation concerning deductions from employee income for housing
```

```text
Which Bills contain protections for citizens without digital access?
```

### Search modes

The interface may show:

* All
* Exact text
* Meaning and context
* Within current Bill

Do not require the user to understand technical terms such as embeddings.

### Filters

* Document type
* Year
* Status
* Directorate
* Sponsor
* Legislative stage
* Date range
* Public or restricted
* Related Bill
* Version
* Historical scan
* Signed document

### Results

Each result should show:

* Title
* Reference
* Document type
* Stage or status
* Year
* Relevant text excerpt
* Matching clause
* Version
* Access level
* Why it matched
* Related records

### Search detail preview

When a result is selected, show:

* Document summary
* Matching passages
* Legislative structure
* Versions
* Related records
* Public status
* Open workspace
* View official document

### AI summary

A summary may answer:

> This Bill contains three provisions relevant to assisted digital access: Clauses 5, 6 and 14.

Include sources within the result, such as clickable clause references. AI should not produce an unsupported answer without linked records.

### Mock behaviour

Use deterministic result sets based on recognised keywords.

For unrecognised queries, return a general seeded set rather than an empty broken state.

---

## Screen 12: OCR Import and Verification

**Priority:** P1
**Primary users:** Archive or records staff

### Purpose

Demonstrate historical document digitisation without implementing real OCR.

### Import step

Allow upload or selection of a bundled sample scan.

Fields:

* Document type
* Approximate year
* Source archive
* Access level
* Related record
* Notes

### OCR animation

Use a dignified page scanning animation:

1. Uploading document
2. Detecting pages
3. Enhancing scan quality
4. Extracting text
5. Detecting headings and clauses
6. Generating metadata
7. Running confidence checks

### Verification workspace

Display:

* Scan image on the left
* Extracted text on the right
* Confidence indicators
* Highlighted low-confidence text
* Suggested metadata
* “Needs human review” label

### Core interactions

* Correct an OCR error.
* Confirm title and year.
* Link document to a Bill.
* Mark page as verified.
* Submit to archive.
* Make searchable.

### Important rule

OCR output must not become official automatically. The user must explicitly confirm verification.

---

## Screen 13: Document Archive

**Priority:** P1
**Users:** Internal staff

### Purpose

Provide structured access to canonical records, supporting files and historical content.

### Content

* Folderless metadata-driven browsing
* Document type collections
* Recent imports
* Signed documents
* Historical scans
* Retention status
* Restricted documents
* Saved collections

### Record display

Show:

* Document title
* Canonical record
* Version
* Format
* Classification
* Related Bill
* Owner
* Retention category
* Last accessed
* Signature state

### Core interactions

* Filter.
* Preview.
* Open related legislative workspace.
* View versions.
* Download permitted format.
* Inspect access history.
* Add to collection.

---

# 13. Public participation experience

## Screen 14: Public Portal Home

**Priority:** P0 and part of hero experience
**Users:** Citizens

### Purpose

Provide a clear, accessible public entry point into current parliamentary participation opportunities.

### Visual shell

This should have:

* Public Parliament or National Assembly header
* Search
* Bills and legislative business
* Public participation
* Petitions
* Track a submission
* Accessibility controls
* Help and contact information

It should not use the internal sidebar.

### Hero content

* “Have your say on legislation”
* Explanation of how participation works
* Active consultations
* Search legislative information
* Track an existing submission

### Active consultation cards

Each card should show:

* Bill title
* Plain-language summary
* Closing date
* Days remaining
* Participation type
* View and participate action

### Additional content

* How participation works
* Recently published Bills
* Petitions information
* Frequently asked questions
* Accessible formats

---

## Screen 15: Public Bill Page

**Priority:** P0 and hero screen
**Users:** Citizens

### Purpose

Help citizens understand a Bill and participate meaningfully.

### Required content

* Bill title
* Reference
* Current public status
* Published date
* Participation closing date
* Plain-language summary
* What the Bill proposes
* Who may be affected
* Key provisions
* Important dates
* Official document downloads
* Accessible HTML version
* Participation instructions
* “Submit your views” button

### Optional enhancements

* Listen to summary
* Increase text size
* High-contrast mode
* Switch language placeholder
* Frequently asked questions
* Related documents

### Important distinction

Clearly label:

* Plain-language summary
* Official legislative text

The summary must not appear to replace the official document.

---

## Screen 16: Citizen Submission Form

**Priority:** P0
**Users:** Citizens

### Format

Use a progressive multi-step form.

### Step 1: About the participant

* Individual or organisation
* Full name
* Email
* Phone, optional
* County
* Organisation, where relevant

### Step 2: Submission

* General submission or specific clause
* Select clause
* Position:

  * Support
  * Oppose
  * Suggest amendment
  * General observation
* Submission text
* Supporting documents

### Step 3: Consent and review

* Review submission
* Privacy notice
* Declaration
* Preferred notification channel
* Submit

### Success state

Display:

* Reference: `PPS-2026-00841`
* Date submitted
* Bill
* Submission type
* Confirmation sent
* Track submission button
* Download acknowledgement

### Mock interaction

Submission should immediately:

* Add a new record to local state.
* Create a tracking reference.
* Appear in the Public Participation Officer’s inbox.
* Increase the submission count on the Bill Workspace.
* Create a notification.

---

## Screen 17: Track Public Submission

**Priority:** P0
**Users:** Citizens

### Search

Enter:

* Submission reference
* Email or phone verification field

For the prototype, use a known reference.

### Citizen-visible stages

Use public-safe wording:

```text
Received
Completeness check
Under parliamentary review
Associated with legislative process
Consideration completed
Closed
```

Do not expose internal officer comments or confidential workflow information.

### Detail

Show:

* Reference
* Related Bill
* Date submitted
* Current status
* Last updated
* Attachments received
* Public messages
* Contact support action

---

# 14. Internal public-participation management

## Screen 18: Public Participation Inbox

**Priority:** P0
**Primary user:** Public Participation Officer

### Purpose

Receive, validate, classify and route public input.

### Queue columns

* Reference
* Citizen or organisation
* Related Bill
* Submission type
* Date received
* Completeness
* Duplicate risk
* Current status
* Assigned officer
* Required action

### Saved views

* New
* Incomplete
* Potential duplicates
* Awaiting routing
* Assigned to DLS
* Assigned to DLPS
* Citizen response required
* Completed

### Interactions

* Open submission.
* Mark complete.
* Request missing information.
* Classify.
* Link to Bill.
* Route to responsible team.
* Update public status.
* Add internal note.

---

## Screen 19: Submission Review Detail

**Priority:** P0 or implemented as a drawer
**Primary user:** Public Participation Officer

### Layout

#### Submission summary

* Reference
* Participant
* Bill
* Clause
* Position
* Date
* Consent
* Attachments

#### Submission content

Display the citizen’s text and evidence.

#### Internal processing

* Completeness
* Duplicate check
* Classification
* Related Bill
* Responsible directorate
* Assigned officer
* Internal note
* Citizen-visible message

### Actions

* Accept and route
* Request more information
* Mark duplicate
* Reject as invalid, with reason
* Associate with Bill
* Update citizen status

### Connected result

After routing:

* Bill Workspace public-participation count updates.
* An activity event appears.
* Citizen tracking changes to “Under parliamentary review”.
* Assigned internal officer receives notification.

---

# 15. Executive and governance screens

## Screen 20: Clerk’s Analytics Dashboard

**Priority:** P0
**Primary user:** Clerk or senior leadership

### Purpose

Provide decision-oriented oversight.

### Top summary

* Active legislative items
* Awaiting approval
* Overdue
* At risk for sitting or publication
* Published this month
* Public submissions received
* Compliance exceptions

### Decision-oriented panels

#### Workflow health

* Items by stage
* Average days in stage
* Bottleneck stage
* Returned-for-revision rate

#### Directorate workload

* DLS active work
* DLPS active work
* Joint workflows
* Work by officer or team

#### Readiness

* Sitting-day readiness
* Publication queue
* Items awaiting signature
* Validation failures

#### Public participation

* Active consultations
* Submissions by Bill
* Submissions by county
* Pending citizen responses
* Average processing time

#### Compliance

* Unsigned publication attempts
* Unresolved audit exceptions
* Access-review reminders
* Records approaching retention action

### Core interactions

* Filter date range.
* Filter directorate.
* Click metric to open underlying records.
* Export report.
* Save dashboard view.
* Open audit explorer.

### UX requirement

Charts should support decisions and link to records. Avoid decorative pie charts with no clear action.

---

## Screen 21: Audit and Compliance Explorer

**Priority:** P0
**Primary users:** Clerk, compliance staff and authorised directors

### Purpose

Demonstrate complete traceability and immutable history.

### Filters

* Date range
* User
* Role
* Directorate
* Record
* Action type
* Workflow stage
* Access event
* Approval
* Publication
* Signature
* Security event

### Audit rows

Show:

* Timestamp
* Actor
* Role
* Action
* Record
* Previous value or stage
* New value or stage
* Version
* Device or session indicator
* Result

### Example events

* Grace Wanjiku created Version 4.0.
* AI suggestion inserted into Clause 14 after confirmation.
* David Otieno returned draft for revision.
* Grace Wanjiku resolved Comment C-104.
* David Otieno approved legal review.
* Ruth Naliaka requested signature.
* Office of the Clerk authorised publication.
* Public page published.
* Citizen submission PPS-2026-00841 linked to the Bill.

### Event detail drawer

Include:

* Human-readable explanation
* Technical event ID
* Related record
* Before and after values
* Version
* User
* Timestamp
* Integrity status
* Export event

### Export

Allow the user to download a sample CSV or PDF audit report.

The proposal requires an immutable append-only audit record and audit reports that the Clerk can access without technical intervention. 

---

## Screen 22: Notifications Centre

**Priority:** P1
**Users:** Internal staff

### Categories

* Assignments
* Reviews
* Deadlines
* Returns
* Approvals
* Public submissions
* Publications
* System

### Interactions

* Mark read.
* Open related record.
* Filter unread.
* Set reminder.
* Manage preferences.

### Example notification

> Digital Public Services Bill, 2026 was returned for revision. Clause 14 contains one blocking comment. Due tomorrow at 4:00 PM.

---

# 16. Happy paths

## Happy Path A: Register a new Bill and create its workspace

**Persona:** Grace Wanjiku, DLS Drafter

1. Grace enters LIMS.
2. The Command Centre shows her work and deadlines.
3. She clicks **New legislative instruction**.
4. She selects **Bill** and **New Bill**.
5. She enters the title, originating office, directorate, priority and due date.
6. She selects confidentiality as **Internal until publication**.
7. She assigns herself as drafter and David Otieno as reviewer.
8. She uploads two supporting documents.
9. She marks that public participation is anticipated.
10. She reviews the workflow preview.
11. She creates the instruction.
12. The system assigns `NA/BILL/2026/015`.
13. The Bill Workspace opens.
14. The audit timeline records creation.
15. The assigned reviewer receives a notification.

### Demonstrated value

* Structured intake
* Permanent identity
* Automatic workflow
* Assignment
* Auditability
* Reduced manual re-keying

---

## Happy Path B: Draft, use AI safely and validate

**Persona:** Grace Wanjiku

1. Grace opens the Bill Workspace.
2. She clicks **Continue drafting**.
3. The approved Bill template opens.
4. She navigates to Clause 14 using the structure tree.
5. She edits the clause.
6. She selects a sentence and asks AI to suggest clearer wording.
7. The AI panel shows a suggestion and explanation.
8. Grace clicks **Edit before inserting**.
9. She adjusts the wording.
10. She confirms insertion.
11. The change appears as tracked.
12. The activity log records that an AI suggestion was inserted after human confirmation.
13. Grace runs validation.
14. A cross-reference issue is highlighted.
15. She corrects it.
16. Validation changes to passed.
17. She submits the draft for legal review.
18. Version 4.0 is created.
19. David receives a review task.

### Demonstrated value

* Structured legislative drafting
* AI augmentation without surrendering control
* Validation
* Automatic versioning
* Workflow integration

---

## Happy Path C: Review, redline and return for revision

**Persona:** David Otieno, DLS Reviewer

1. The presenter switches to David’s role.
2. His dashboard shows **1 item awaiting legal review**.
3. He opens the Digital Public Services Bill.
4. He enters review mode.
5. The system shows a summary of changes.
6. He compares Versions 3.0 and 4.0.
7. He accepts one change.
8. He rejects another.
9. He adds a blocking comment to Clause 14.
10. He clicks **Return for revision**.
11. He enters the reason and due date.
12. The Bill stage becomes **Revision Requested**.
13. Grace receives a notification.
14. The audit timeline records the return.

### Follow-on

15. Switch to Grace.
16. Grace opens the returned task.
17. She resolves the comment.
18. She submits Version 4.1.
19. Switch back to David.
20. David confirms the issue is resolved.
21. He approves legal review.
22. The Bill routes to DLPS.

### Demonstrated value

* Controlled collaboration
* Visible redlining
* No emailed duplicate documents
* Responsibility and deadlines
* Defensible approval history

---

## Happy Path D: Sign, seal and publish

**Personas:** Ruth Naliaka and Office of the Clerk

1. Ruth opens the procedural review task.
2. She checks the pre-publication checklist.
3. She confirms the AKN validation passed.
4. She confirms metadata and public classification.
5. She routes the Bill for signature.
6. Switch to the Clerk role.
7. The Clerk sees an item awaiting authorisation.
8. The Clerk reviews the approved version.
9. The Clerk starts the mock signature flow.
10. The prototype displays MFA or OTP confirmation.
11. The signature is applied and verified.
12. The institutional seal is applied.
13. The Clerk authorises publication.
14. The system generates PDF, HTML and AKN XML.
15. The Bill stage becomes **Published**.
16. A public URL becomes active.
17. The presenter opens the public Bill page.
18. The audit trail records all actions.

### Demonstrated value

* Controlled publication
* E-signature and seal
* Multiple official formats
* Clear official version
* Public transparency

---

## Happy Path E: Citizen participates and tracks the submission

**Persona:** James Mwangi

1. James opens the public portal.
2. He sees the Digital Public Services Bill under active consultations.
3. He opens its public page.
4. He reads the plain-language summary.
5. He opens Clause 14.
6. He clicks **Submit your views**.
7. He enters his details.
8. He selects Clause 14.
9. He chooses **Suggest amendment**.
10. He writes his submission.
11. He attaches supporting evidence.
12. He reviews and submits.
13. The system issues reference `PPS-2026-00841`.
14. James opens the tracking page.
15. Status is displayed as **Received**.

### Staff continuation

16. Switch to Miriam, Public Participation Officer.
17. Miriam’s inbox shows the new submission.
18. She opens it.
19. She confirms completeness.
20. She associates it with the Digital Public Services Bill.
21. She routes it to DLS.
22. Citizen-visible status becomes **Under parliamentary review**.
23. The Bill Workspace displays one additional public submission.
24. James’s tracking page reflects the updated status.

### Demonstrated value

* Citizen accessibility
* Submission acknowledgement
* Controlled internal routing
* Public transparency
* Connection between public input and legislative work

---

## Happy Path F: Search and retrieve institutional knowledge

**Persona:** DLS Drafter or Clerk

1. The user searches:

   > Which Bills contain protections for citizens without digital access?
2. Search returns the Digital Public Services Bill and historical related records.
3. The result explains that Clauses 5, 6 and 14 are relevant.
4. The user opens Clause 14 directly.
5. The user views the published version and a previous draft.
6. The user opens a scanned historical paper.
7. The user views related public submissions.
8. The user saves the search.

### Demonstrated value

* Full-text search
* Semantic search
* Clause-level retrieval
* Historical records
* Related information
* Institutional memory

---

## Happy Path G: Clerk identifies a bottleneck and exports evidence

**Persona:** Clerk

1. The Clerk opens Executive Analytics.
2. The dashboard shows several items delayed in legal review.
3. The Clerk selects the metric.
4. The underlying work queue opens.
5. The Clerk selects the Digital Public Services Bill.
6. The Clerk reviews time in each stage.
7. The Clerk opens the audit trail.
8. The Clerk filters Clause 14-related events.
9. The Clerk exports an audit report.

### Demonstrated value

* Executive oversight
* Drill-down from analytics to actual records
* Accountability
* Audit without ICT intervention

---

# 17. Mock backend behaviour

Create a lightweight front-end simulation layer.

## Suggested structure

```text
src/
  app/
  components/
  features/
    auth/
    dashboard/
    legislative/
    drafting/
    workflow/
    versions/
    search/
    documents/
    participation/
    analytics/
    audit/
  data/
    users.json
    bills.json
    tasks.json
    versions.json
    submissions.json
    audit-events.json
    search-index.json
  mocks/
    mockApi.ts
    mockHandlers.ts
  store/
    demoStore.ts
  routes/
  public/
    exports/
    sample-documents/
```

## State management

Use:

* Zustand, Redux Toolkit or React Context.
* `localStorage` for prototype persistence.
* A single **Reset demonstration** action to restore seeded data.

## Mock API style

Even without a backend, actions should behave asynchronously.

Example:

```ts
await mockApi.submitForReview(billId);
```

The mock API should:

* Wait 600–1,500 milliseconds.
* Update local state.
* Add an audit event.
* Create a notification.
* Return a success result.
* Occasionally expose a predefined validation state.

This creates realistic loading and success behaviour.

---

# 18. Functionality simulation matrix

| Feature              | Prototype implementation                                  |
| -------------------- | --------------------------------------------------------- |
| Authentication       | Persona selector and simulated secure entry               |
| MFA                  | Mock OTP during signature flow                            |
| Legislative creation | Functional form that creates or updates local state       |
| Workflow             | Deterministic local state machine                         |
| Draft editor         | Editable structured HTML or rich-text surface             |
| Redlining            | Seeded tracked changes with accept/reject                 |
| Versioning           | Pre-seeded versions plus generated new version state      |
| AI drafting          | Pre-authored deterministic suggestions                    |
| AI summary           | Pre-authored response based on selected Bill or clause    |
| Validation           | Rule-based seeded warnings and pass state                 |
| OCR                  | Upload preview, animation and pre-authored extracted text |
| Semantic search      | Keyword intent map against a seeded local index           |
| E-signature          | Confirmation animation and stored signed state            |
| Institutional seal   | Mock verified seal application                            |
| PDF export           | Bundled sample file download                              |
| HTML export          | Bundled or generated static HTML                          |
| AKN XML export       | Bundled sample XML                                        |
| Notifications        | Local notification records and toasts                     |
| Public submission    | Local form submission with generated reference            |
| Submission tracking  | Local status lookup                                       |
| Analytics            | Charts from seeded data                                   |
| Audit                | Append-only events created by prototype actions           |
| Role permissions     | Front-end visibility and action restrictions              |

---

# 19. Seeded data requirements

The prototype should not depend on a single empty Bill record.

## Minimum dataset

Include:

* 20–30 legislative records
* All ten workflow types represented
* 8–12 Bills
* 4 Motions
* 3 Petitions
* 2 Order Papers
* 2 Votes and Proceedings records
* Several Questions and Statements
* 2 Statutory Instruments
* At least 1 Supply-related item
* 4–6 versions of the primary Bill
* 15–25 audit events for the primary Bill
* 8–12 citizen submissions
* 12–20 tasks
* 10–15 notifications
* 4 historical scanned documents
* 5 signed or published documents
* Several restricted records

## Status diversity

Include records that are:

* Draft
* In review
* Returned
* Awaiting approval
* Overdue
* Signed
* Published
* Archived
* Restricted

## Content rule

Use realistic labels, dates, references and descriptions.

Do not use:

* Lorem ipsum
* `Test Bill 1`
* `Document ABC`
* `John Doe`
* Empty charts
* Placeholder numbers that do not match underlying records

---

# 20. Visual and brand direction

## Overall tone

The interface should feel:

* Authoritative
* Calm
* Precise
* Trustworthy
* Modern
* Accessible
* Kenyan
* Parliamentary

It should not feel:

* Flashy
* Fintech-like
* Overly corporate
* Visually crowded
* Old-fashioned
* Dominated by red and green

## Colour approach

Use a restrained blend of:

* Deep institutional green
* Parliamentary burgundy or red
* Warm gold accent
* Off-white
* Charcoal
* Soft neutral greys

Exact official brand colours should be confirmed from approved National Assembly and parliamentary brand assets rather than guessed.

Suggested usage:

* Green: primary navigation, trusted actions and institutional identity
* Burgundy: secondary parliamentary accent and selected states
* Gold: restrained highlight and official status
* Neutrals: most application surfaces
* Standard accessible status colours for success, warning and error

Do not make green mean both “National Assembly brand” and “success” without additional icons and labels.

## Typography

Use:

* A clean sans-serif for application UI
* A readable serif for legislative document content

Possible direction:

* UI: Inter, Source Sans 3 or a strong system sans-serif
* Legislative text: Source Serif 4 or equivalent

## Layout

* Internal application: desktop-first
* Optimised for 1366×768 and 1440×900
* Usable down to approximately 1024px wide
* Public portal: fully responsive and mobile-friendly
* Editor may require a desktop-width experience

## Motion

Motion should be subtle and purposeful:

* Workflow transition
* Save state
* OCR scanning
* AI processing
* Output generation
* Signature verification
* Success confirmation

Avoid playful bouncing or excessive confetti.

---

# 21. Accessibility requirements

The proposal requires WCAG 2.1/2.2 AA for staff and public interfaces. 

The prototype should therefore include:

* Keyboard navigation
* Visible focus states
* Semantic headings
* Form labels
* Error summaries
* Adequate contrast
* Text and icons for statuses
* Accessible modal focus handling
* Meaningful button labels
* Responsive text sizing
* No essential information communicated only through hover
* Public text-size controls
* Public high-contrast option, where feasible
* Screen-reader labels on icon-only controls

---

# 22. Error, empty and loading states

Although the main focus is the happy path, the interface should appear complete.

Implement at least:

## Loading states

* Dashboard loading
* Search loading
* AI processing
* OCR processing
* Saving document
* Generating outputs
* Applying signature
* Submitting public input

## Empty states

* No unresolved comments
* No items awaiting review
* No search results
* No citizen submissions
* No notifications

## Error states

* Missing required instruction field
* Invalid upload type
* Unresolved validation issue
* Insufficient permission
* Cannot publish because signature is missing
* Submission requires consent
* Search unavailable/offline fallback message

## Offline state

The proposal describes the core system as offline-first with AI degrading gracefully. 

Include a simulated state:

> Secure external AI is unavailable. Core drafting and workflow functions remain available. Local assistance is active.

---

# 23. Demo controls

A tender prototype should be designed for reliable presentation.

## Required demo controls

Create a discreet presenter menu containing:

* Switch persona
* Jump to demonstration step
* Reset all prototype data
* Mark primary Bill as:

  * Drafting
  * In Review
  * Revision Requested
  * Approved
  * Published
* Generate citizen submission
* Toggle offline mode

This menu should be hidden behind a “Demo tools” button so it does not undermine the product appearance.

## Deep links

Every major demonstration screen should have a stable URL so the presenter can recover quickly.

Example:

```text
/#/demo/1-command-centre
/#/demo/2-bill-workspace
/#/demo/3-drafting
/#/demo/4-search
/#/demo/5-public-participation
```

---

# 24. Non-goals

Do not spend time implementing:

* Real Keycloak authentication
* Real OCR
* Real generative AI
* Real e-signature certificates
* Real SMS or email
* Real PBO integration
* Real Akoma Ntoso validation engine
* Production-grade collaborative editing
* Real malware scanning
* Real document encryption
* Real payment functionality
* Complete workflows for all ten legislative types
* Complete administration settings
* A production-ready backend
* Fully editable complex Bill XML

The prototype must demonstrate the experience and architecture convincingly, not secretly attempt to become the complete production system.

---

# 25. Required acceptance criteria

The prototype is accepted when all of the following are true.

## Build and deployment

* `npm install` completes successfully.
* `npm run build` completes without errors.
* A static `dist` directory is generated.
* The application runs from a CDN/static host.
* Direct navigation does not cause route errors.
* No production API is required.
* No secret keys are committed.
* No broken assets appear.

## Functional demonstration

* User can switch between primary personas.
* New legislative instruction can be created.
* Bill Workspace reflects the created or seeded record.
* Draft text can be modified.
* AI suggestion can be accepted only after confirmation.
* Validation issue can be fixed.
* Draft can be submitted for review.
* Reviewer can add a comment and return the draft.
* Revised version can be created.
* Reviewer can approve.
* Bill can be signed, sealed and published.
* Sample PDF, HTML and XML can be downloaded.
* Published Bill appears in the public portal.
* Citizen can submit input.
* Submission appears in the staff inbox.
* Staff can route the submission.
* Citizen tracking status changes.
* Search returns realistic results.
* Audit events reflect actions taken.
* Reset restores initial state.

## UX and quality

* No dead controls occur in the primary demo.
* No lorem ipsum is visible.
* All five hero screens look presentation-ready.
* Statuses are consistent across screens.
* User names, dates, references and version numbers remain consistent.
* Loading and success feedback are present.
* Empty and error states are intentional.
* Layout works at common laptop presentation resolutions.
* Public portal works on mobile widths.
* No severe accessibility issues are obvious.
* Browser console contains no recurring errors.

---

# 26. Recommended implementation sequence

## Phase 1: Foundation

Build:

* Project setup
* Application shell
* Routing
* Design tokens
* Seeded data
* State store
* Persona switcher
* Demo reset
* Shared components

Estimated effort: 1–1.5 days.

## Phase 2: Core Bill journey

Build:

* Command Centre
* Create Instruction
* Bill Workspace
* Drafting
* Review and redline
* Versions
* Workflow
* Publication

Estimated effort: 3–4 days.

## Phase 3: Knowledge and participation

Build:

* Search
* Document preview
* Public portal
* Public Bill page
* Submission form
* Tracking
* Staff participation inbox

Estimated effort: 2–3 days.

## Phase 4: Oversight and enhancement

Build:

* Clerk dashboard
* Audit explorer
* OCR simulation
* Notifications
* Downloadable outputs

Estimated effort: 1.5–2.5 days.

## Phase 5: Tender polish

Complete:

* Responsive checks
* Content consistency
* Demo controls
* Transitions
* Accessibility pass
* Browser testing
* Deployment
* Demo rehearsal

Estimated effort: 1–2 days.

Some work can run in parallel, especially seeded content, UI components and public-portal implementation.

---

# 27. Recommended tender demonstration sequence

A full demonstration should take approximately 8–12 minutes.

## Opening: 30 seconds

Start on the Command Centre.

Explain:

> Every user begins with an actionable view of parliamentary work—not a generic dashboard. They immediately see what requires their attention, what is late and what could affect legislative business.

## Bill Workspace: 1 minute

Open the Digital Public Services Bill.

Explain:

> Each legislative item has one permanent workspace containing its current stage, official document, tasks, versions, approvals, related records, public participation and full history.

## Drafting and AI: 2 minutes

Open Clause 14.

* Show structure.
* Request AI wording.
* Confirm before inserting.
* Run validation.
* Fix issue.
* Submit for review.

Explain:

> AI assists but does not make legal decisions or alter official content without human confirmation.

## Review and version history: 2 minutes

Switch to reviewer.

* Show redlines.
* Compare versions.
* Add comment.
* Return and approve.
* Show preserved history.

Explain:

> No emailed duplicate files and no uncertainty about which version is official.

## Publication: 1 minute

* Show checklist.
* Apply mock signature and seal.
* Generate outputs.
* Publish.

Explain:

> The structured legislative record can produce official PDF, accessible HTML and standards-based Akoma Ntoso XML.

## Public participation: 2 minutes

Open public page.

* Read summary.
* Submit citizen views.
* Receive reference.
* Switch to staff inbox.
* Route submission.
* Show updated tracking.

Explain:

> The citizen experience is separate and accessible, while public input enters the internal system through a controlled review process.

## Search and oversight: 1.5 minutes

* Ask semantic question.
* Open matching clause.
* Switch to Clerk dashboard.
* Open audit.
* Export report.

Conclude:

> LIMS gives the National Assembly one trusted legislative workspace: every document has an identity, every process has a visible path, every version has a history, every decision has an owner and every approved outcome can safely reach the public.

---

# Final scope recommendation

Build the prototype around **five hero screens and approximately 10–14 supporting screens**, rather than limiting it to exactly five pages.

The five hero screens should win attention. The supporting routes should prove that those designs belong to a coherent, usable system rather than being static mock-ups.

The most important end-to-end path is:

```text
Legislative instruction
→ Bill Workspace
→ Structured drafting
→ Review and redlining
→ Version creation
→ Approval
→ Signature and seal
→ Publication
→ Citizen participation
→ Search and audit
```

That single connected journey demonstrates almost every major value promised in the technical proposal without requiring a real backend.

