# Best first screen to design

Start with the **Legislative Command Centre** for the DLS drafter persona.

This is the right first screen because it establishes nearly every reusable visual foundation:

* Internal application shell
* National Assembly branding
* Sidebar and top navigation
* Typography and spacing
* Status colours
* Cards and tables
* Role-based information
* Notifications
* Filters and quick actions
* Legislative record presentation
* Links into the Bill Workspace, drafting editor, search and new-instruction flow

It will also be the first screen seen during the tender demonstration, so it must immediately communicate:

> This is a specialised parliamentary work system, not a generic document dashboard.

The drafting editor may ultimately be the most impressive specialist screen, but designing it before the application shell and record language are settled would create inconsistencies.

---

# 1. What to take from the collected inspiration

The references contain several strong ideas, but no single design should be copied wholesale. The best result will combine their strongest patterns.

## Image 27: grouped work queue

### Use

* Work grouped by operational state
* Soft pastel section headers
* Collapsible groups
* Dense but readable tables
* Multiple views such as list, calendar and board
* Clear row-level metadata

This is highly relevant to LIMS because legislative work naturally divides into:

* Awaiting my action
* In progress
* Under review
* Returned for revision
* Completed

### Adapt

Replace project-management language such as “To Do” and “On Process” with parliamentary language.

Example:

```text
Requires My Action
In Drafting
Awaiting Review
Returned for Revision
Recently Completed
```

### Avoid

* Too many avatars on every row
* Consumer-SaaS blue as the primary accent
* Treating legislative records like ordinary tasks

---

## Image 28: polished modular document dashboard

### Use

* Crisp white panels
* Strong spacing
* Clearly separated dashboard regions
* Compact recent-activity rail
* Tables with enough white space
* Minimal shadows and fine borders

### Adapt

The main area should focus on work rather than document-storage statistics.

Do not lead with:

* Total folders
* Storage usage
* Number of files

Lead with:

* Items needing action
* Legislative deadlines
* Review requests
* Publication readiness
* Blocked work

---

## Image 29: strongest overall structural reference

This is the closest structural starting point for LIMS.

### Use

* Deep green sidebar
* White main workspace
* Restrained green accent
* Summary cards at the top
* A large operational section in the centre
* A narrower action-oriented right column
* Clean institutional appearance

### Adapt

Its charts are too dominant for the drafter’s dashboard. LIMS should use that space for actionable legislative information.

The overall visual balance is useful:

```text
Dark institutional navigation
+
Light operational workspace
+
Small restrained status accents
```

---

## Images 30 and 31: light, airy enterprise styling

### Use

* Clean data tables
* Compact filters
* Rounded cards
* Soft green selected states
* Clear form layouts
* Readable profile and assignment indicators
* Consistent card spacing

### Adapt

Reduce the playful HR-product feeling by:

* Using fewer saturated mint elements
* Reducing oversized rounded corners
* Using more charcoal typography
* Introducing warm white and institutional gold
* Using straighter, more formal content structures

---

## Images 32, 33 and 34: document-centred workspaces

These are particularly valuable for later phases.

### Use later for the drafting, OCR and review screens

* Document preview in the centre
* Page navigation on the left
* Verification, checks or metadata on the right
* Clear document-level actions at the top
* Split-screen review
* Status attached to individual checks
* Upload and processing animations

### Do not use directly on the Command Centre

The Command Centre should orient the user before they enter a document-specific workspace.

These references should influence:

* OCR Import and Verification
* Drafting Workspace
* Review and Redline Mode
* Signature and Publication Preview

---

## Image 35: approval workflow screen

### Use later

* Clear stage progression
* Current stage strongly highlighted
* Request summary panel
* Approval history
* Action decision section
* Approve, reject and request-changes options

This is an excellent structural reference for the **Workflow and Approvals** tab in the Bill Workspace.

### Improve

The workflow should be more visually integrated with the legislative record and less like a procurement approval request.

---

## Image 36: record detail with lifecycle ribbon

### Use later

* Strong record header
* Lifecycle ribbon
* Metadata near the top
* Tabs for different record aspects
* Detailed tables below
* Current status visible without opening another page

This should heavily influence the future **Bill Workspace**.

Possible LIMS lifecycle ribbon:

```text
Instruction
Drafting
Legal Review
Procedural Review
Signature
Publication
```

---

## Image 38: document archive cards

### Use later

* Metadata-rich document cards
* Version badges
* Warning counts
* Search and filter controls
* Grid/list switch
* Clear archive state

This is suitable for:

* Document Archive
* Templates
* Saved collections
* Possibly search results in card mode

### Avoid on the main dashboard

A card grid is less efficient than a table for urgent legislative work.

---

## Images 39–45: useful mechanics, weaker stylistic references

These contain usable interaction ideas:

* Guided upload
* Form layouts
* Recipient or reviewer assignment
* Approval hierarchy
* Basic analytics
* Recent document lists
* Drag-and-drop upload areas

However, most look more generic or template-based than the level required for the tender.

Use their mechanics, not their overall styling.

In particular, avoid:

* Large amounts of empty space without hierarchy
* Oversized dashboard counters
* Generic file-management labels
* Too many unrelated chart colours
* Purple or blue SaaS branding
* Deeply nested folder trees
* Every element enclosed inside a heavy border

---

# 2. Synthesised design direction

The design should combine:

* **Image 29’s institutional sidebar and page structure**
* **Image 27’s grouped operational queues**
* **Image 28’s card spacing and right-side activity rail**
* **Images 30–31’s polished filters, tables and pastel states**
* **Images 35–36’s workflow language**, introduced lightly on the dashboard and used fully in the Bill Workspace

The resulting interface should be:

> A precise, modern parliamentary workspace with a dark green institutional frame, a light document-oriented working surface, pastel status treatments, structured legislative metadata and very little decorative clutter.

---

# 3. First screen definition

## Screen name

**Legislative Command Centre**

## Default persona

**Grace Wanjiku**
Senior Legal Counsel
Directorate of Legal Services

## Screen purpose

Help Grace understand, within approximately five seconds:

1. What needs her attention
2. What is most urgent
3. What has been returned
4. What is awaiting her review
5. Which parliamentary deadlines are approaching
6. What she worked on recently
7. Where to start a new legislative instruction

This is an operational dashboard, not an analytics dashboard.

---

# 4. Desktop canvas

## Primary design size

```text
1440 × 900 px
```

The implementation should also remain usable at:

```text
1366 × 768 px
```

## Main structure

```text
┌──────────────────────────────────────────────────────────────┐
│ Sidebar │ Top application header                             │
│         ├─────────────────────────────────────────────────────┤
│         │ Page introduction and primary actions              │
│         ├─────────────────────────────────────────────────────┤
│         │ Summary cards                                      │
│         ├───────────────────────────────────┬─────────────────┤
│         │ Main legislative work queue       │ Readiness rail  │
│         │                                   │                 │
│         ├───────────────────────────────────┼─────────────────┤
│         │ Recently worked on / workflow     │ Recent activity │
└──────────────────────────────────────────────────────────────┘
```

---

# 5. Application shell

## 5.1 Sidebar

### Width

Approximately:

```text
244–256 px expanded
76 px collapsed
```

### Background

Deep National Assembly green.

Suggested starting range:

```text
#073D25
#08482B
```

The exact colour should be adjusted against the official logo during mock-up creation.

### Sidebar header

Include:

* National Assembly logo
* `LIMS`
* `Legislative Information Management System`
* Optional small `National Assembly of Kenya` label

Do not attempt to display the full system name at a large size. Use a clear product abbreviation with a smaller subtitle.

### Main navigation

```text
Home
  Command Centre
  My Work
  Notifications

Legislative Work
  Bills
  Motions
  Questions
  Statements
  Petitions
  More legislative business

Drafting
  My Drafts
  Review Queue
  Templates

Documents & Knowledge
  Search
  Document Archive
  OCR Import

Public Participation
  Submission Inbox
  Active Consultations

Oversight
  Analytics
  Audit & Compliance
```

For the first screen, not every submenu needs to be expanded. The sidebar should show approximately seven primary entries and use collapsible groups.

### Active state

Use:

* Light warm-green background
* Gold vertical indicator or small line
* White or very pale text
* Clear icon

Avoid using a completely bright green block.

### Bottom area

Include:

* Help and training
* System status
* User profile
* Collapse sidebar action

---

## 5.2 Top application header

### Height

Approximately:

```text
64 px
```

### Left side

* Breadcrumb: `Home / Command Centre`
* On narrower layouts, show only current page

### Centre

Global search.

Placeholder:

> Search Bills, clauses, petitions, references or legislative records

This should appear more important than a standard small table search.

### Right side

* Local/offline AI status
* Notifications
* Help
* User avatar
* Name and role
* Dropdown

Example:

```text
Grace Wanjiku
Senior Legal Counsel · DLS
```

### AI/network status

Use a subtle indicator such as:

```text
Secure AI available
```

or:

```text
Local services connected
```

Do not make it a large badge.

---

# 6. Page introduction

## Left side

### Greeting

```text
Good morning, Grace
```

### Supporting message

```text
You have 7 legislative items requiring attention today.
```

### Small contextual line

```text
Directorate of Legal Services · Wednesday, 15 July 2026
```

## Right side

Primary button:

```text
+ New Legislative Instruction
```

Secondary action:

```text
Import Historical Document
```

Optional tertiary menu:

```text
More actions
```

The primary button should be green. Gold should not be used for normal primary actions.

---

# 7. View selector

Directly beneath the introduction, include a segmented control:

```text
My Work
Directorate Work
Sitting & Publication Readiness
```

Default:

```text
My Work
```

This allows the same screen structure to serve several perspectives without becoming overcrowded.

Beside it:

* Date range
* Saved view
* Filter
* Refresh

---

# 8. Summary cards

Use four compact cards across the page.

These are indicators, but each must lead to actual records.

## Card 1

```text
Requires My Action
7
2 added today
```

## Card 2

```text
Due Within 48 Hours
3
1 marked high priority
```

## Card 3

```text
Returned for Revision
1
Blocking comment unresolved
```

## Card 4

```text
Awaiting My Review
4
Oldest waiting 2 days
```

## Visual treatment

Each card should have:

* Small icon
* Label
* Large number
* Short explanatory line
* Very subtle status colour
* Chevron or clickable state

Suggested pastel backgrounds:

* Action required: pale gold
* Due soon: pale amber
* Returned: pale red
* Awaiting review: pale green or neutral

Do not make each card a strongly different colour.

---

# 9. Main section: legislative work queue

This is the most important area of the screen.

## Section title

```text
Priority Work
```

Supporting text:

```text
Legislative items ordered by urgency, deadline and required action.
```

## Header controls

* Search within work
* Workflow type filter
* Stage filter
* Priority filter
* Sort by urgency
* List settings
* `View all work`

## Grouping

Borrow the grouped structure from Image 27.

### Group 1: Requires My Action

Soft pale-gold header.

Count:

```text
3
```

### Group 2: In Progress

Soft pale-green header.

Count:

```text
4
```

### Group 3: Awaiting Another Officer

Soft neutral-grey header.

Count:

```text
5
```

### Group 4: Recently Completed

Collapsed by default.

Soft green-tinted header.

Count:

```text
8
```

Groups should be collapsible.

---

# 10. Work queue columns

Use a readable operational table.

Recommended columns:

```text
Legislative Item
Type
Current Stage
Required Action
Owner / Collaborators
Due
Priority
Activity
```

Do not include too many narrow columns such as separate start date, attachments and chat unless they support a real decision.

## Row anatomy

### Primary text

```text
Digital Public Services Bill, 2026
```

### Secondary line

```text
NA/BILL/2026/015 · Version 4.0
```

### Type

```text
Bill
```

### Stage

```text
Revision Requested
```

### Required action

```text
Resolve blocking comment on Clause 14
```

### Owner

```text
Grace Wanjiku
```

Use a small avatar only where helpful.

### Due

```text
Today, 4:00 PM
```

### Priority

```text
High
```

### Activity

```text
Returned 36 min ago by David Otieno
```

### Row action

```text
Continue Revision
```

The row’s action should be explicit, rather than a generic ellipsis being the only way forward.

---

# 11. Seeded queue content

## Requires My Action

### Record 1

**Digital Public Services Bill, 2026**

```text
Reference: NA/BILL/2026/015
Version: 4.0
Stage: Revision Requested
Priority: High
Due: Today, 4:00 PM
Action: Resolve blocking comment on Clause 14
Last activity: Returned by David Otieno 36 minutes ago
Primary action: Continue Revision
```

This is the primary demonstration record.

### Record 2

**Public Procurement and Asset Disposal Amendment Bill, 2026**

```text
Reference: NA/BILL/2026/011
Stage: Legal Review
Priority: High
Due: Tomorrow
Action: Review changes to Clauses 8–11
Primary action: Review Draft
```

### Record 3

**Petition on Assisted Access to Digital Government Services**

```text
Reference: NA/PET/2026/084
Stage: Intake Verification
Priority: Medium
Due: Today
Action: Confirm legal classification
Primary action: Review Petition
```

---

## In Progress

### Record 4

**Statutory Instruments Tracking Regulations, 2026**

```text
Reference: NA/SI/2026/027
Stage: Drafting
Due: 18 July 2026
Action: Continue drafting Part III
```

### Record 5

**Public Finance Amendment Bill, 2026**

```text
Reference: NA/BILL/2026/009
Stage: Awaiting Supporting Information
Due: 20 July 2026
Action: Review received PBO documentation
```

### Record 6

**Motion on Digital Accessibility in Public Institutions**

```text
Reference: NA/MOT/2026/046
Stage: Legal Review
Due: 21 July 2026
Action: Complete admissibility review
```

---

# 12. Right-side readiness rail

The main work queue should occupy approximately 68–72% of the available content width.

The right side should contain two or three narrow operational cards.

## 12.1 Legislative readiness

Title:

```text
Sitting & Publication Readiness
```

Show the next relevant date:

```text
Next sitting
Tuesday, 21 July · 2:30 PM
```

Then show:

```text
Ready for procedural review      4
Awaiting signature               2
Publication checks incomplete    1
At risk                          2
```

Include a restrained progress visual, but not a large doughnut chart.

A compact horizontal stage distribution works better:

```text
Drafting      ███████  7
Review        █████    5
Approval      ███      3
Publication   ██       2
```

Primary action:

```text
View Readiness
```

---

## 12.2 Urgent attention

Title:

```text
Attention Required
```

Show two or three concise alerts:

```text
Clause 14 has a blocking review comment
Digital Public Services Bill, 2026
```

```text
Publication deadline is tomorrow
Order Paper — Sitting No. 42
```

```text
Citizen submission awaiting classification
PPS-2026-00841
```

Each item opens the relevant record.

---

## 12.3 Recent activity

A compact activity timeline:

```text
10:42  Version 4.0 submitted for review
10:18  Validation completed successfully
09:54  Two public submissions linked
Yesterday  Drafting task reassigned
```

Include actor, record and timestamp.

---

# 13. Bottom supporting section

Only include this if it fits comfortably at 1440×900 without making the screen feel crowded.

## Recently worked on

Display three compact cards or rows:

* Digital Public Services Bill
* Statutory Instruments Tracking Regulations
* Motion on Digital Accessibility

Each shows:

* Record reference
* Last opened
* Current version
* Continue action

This is more useful to the drafter than another chart.

At 1366×768, this section may move below the fold.

---

# 14. Colour system for this screen

## Primary

### Sidebar green

```text
#073F27
```

### Main action green

```text
#0B6B3A
```

### Green hover

```text
#095B32
```

## Institutional accent

### Gold

```text
#D6B84C
```

Use for:

* Active navigation indicator
* Official or parliamentary markers
* Small highlights
* Signed/sealed status later

Do not use gold as the main button colour.

## Surfaces

```text
Main page background: #F4F6F3
Card background:      #FFFFFF
Warm document white:  #FCFDFB
Border:               #DCE3DD
Strong text:          #17211B
Muted text:           #657168
```

## Status pastels

```text
Soft green:  #E8F4EC
Soft gold:   #FFF5D8
Soft red:    #FBEAEC
Soft amber:  #FFF0DE
Soft grey:   #EEF1EE
Soft blue:   #EAF1F6
```

Red should be reserved for:

* Blocking issue
* Overdue
* Rejection
* Destructive action

---

# 15. Typography

## Application font

Use a clean, restrained sans-serif such as:

* Inter
* Source Sans 3
* IBM Plex Sans

Source Sans 3 may feel slightly more institutional while remaining modern.

## Suggested hierarchy

```text
Page title:             26–28 px / semibold
Section title:          17–18 px / semibold
Card number:            26–30 px / semibold
Body:                   14 px
Table text:             13–14 px
Metadata:               12–13 px
Sidebar:                14 px
```

Avoid extremely small table text. The system is intended for information-dense work, but accessibility remains important.

---

# 16. Shape and elevation

## Border radius

```text
Cards: 10–12 px
Buttons: 8–10 px
Inputs: 8 px
Badges: pill or 6–8 px
Large containers: 12 px
```

Avoid very rounded, consumer-app cards.

## Shadows

Use minimal shadows.

Preferred:

```text
1 px border
+
very soft shadow only on raised menus or important overlays
```

The main dashboard should look structured rather than floating.

---

# 17. Interaction behaviour

## Clicking the primary Bill row

Route:

```text
/legislative/NA-BILL-2026-015
```

This opens the Bill Workspace.

## Clicking “Continue Revision”

Route:

```text
/legislative/NA-BILL-2026-015/draft?mode=revision
```

## Clicking “New Legislative Instruction”

Route:

```text
/legislative/new
```

## Clicking a summary card

Example:

```text
Requires My Action
```

Routes to:

```text
/work?view=requires-action
```

## Search

Typing:

```text
digital public services
```

Shows suggested results beneath the search field:

* Digital Public Services Bill, 2026
* Clause 14 — Protection of vulnerable users
* Public submission PPS-2026-00841
* Version 4.0 Legal Review Draft

## Group expansion

Each status group should collapse and expand without navigating away.

## Filtering

Filters update the queue with a short skeleton loading state.

## Notification

Opening a notification should:

* Mark it read
* Navigate to the relevant item
* Highlight the relevant action or clause

---

# 18. Role-based variations

The same Command Centre structure should adapt when the presenter switches persona.

## DLS Drafter

Primary focus:

* Continue drafting
* Returned work
* Due dates
* Validation issues

## DLS Reviewer

Primary focus:

* Awaiting legal review
* Unresolved comments
* Version comparisons
* Approval decisions

Cards become:

```text
Awaiting My Review
Blocking Issues
Due Within 48 Hours
Recently Approved
```

## DLPS Officer

Primary focus:

* Procedural review
* Sitting readiness
* Signature
* Publication

Cards become:

```text
Awaiting Procedural Review
Awaiting Signature
Publication Checks
Ready to Publish
```

## Clerk

Primary focus:

* At-risk legislative business
* Pending approvals
* Cross-directorate bottlenecks
* Compliance

The Clerk version may contain more analytics, but it should retain the same design system.

For Phase 1, the DLS drafter state should be fully implemented. Reviewer and Clerk states can initially use seeded alternate content within the same shell.

---

# 19. Supporting routes required in the first phase

The Command Centre should not be built as an isolated static screen.

For Phase 1, create these supporting destinations:

## Fully presentable

```text
/dashboard
/work
/legislative/new
/legislative/NA-BILL-2026-015
```

## Lightweight placeholders with correct shell

```text
/search
/notifications
/documents/import
/participation
/analytics
/audit
```

A lightweight placeholder should still contain:

* Correct page title
* Correct breadcrumb
* Appropriate empty or preview content
* No broken route
* Clear connection to later development

---

# 20. What this first screen must not become

Do not create:

* A generic statistics dashboard
* A screen dominated by graphs
* A folder-management interface
* A kanban board as the default view
* A colourful collection of unrelated cards
* A copied version of the HR examples
* A dark dashboard with green everywhere
* A screen where every record looks equally urgent
* A product where the National Assembly logo is oversized
* A table where the only action is an ellipsis menu

The key visual hierarchy should be:

```text
What needs action
→ Why it needs action
→ When it is due
→ What the user should do next
```

---

# 21. Phase 1 build acceptance criteria

The first phase is complete when:

* The National Assembly-branded application shell is implemented.
* Sidebar expands and collapses.
* The DLS drafter persona is active.
* The four summary cards are populated and clickable.
* Work items are grouped by state.
* Groups collapse and expand.
* Filters affect visible seeded records.
* Search suggests records.
* The primary Bill opens its workspace route.
* “Continue Revision” opens the drafting route or a prepared drafting placeholder.
* “New Legislative Instruction” opens the creation flow.
* The readiness rail contains meaningful parliamentary data.
* Recent activity is populated.
* Notifications open related records.
* The screen works at 1440×900 and 1366×768.
* The layout contains no lorem ipsum or dead primary controls.
* Colours meet accessible contrast requirements.
* Demo data remains consistent across routes.
* Reset Demo restores the original state.

---

# Final creative direction

The first screen should look as though **Images 27, 28 and 29 were redesigned specifically for Parliament**:

* Image 29 provides the institutional green frame.
* Image 28 provides the clean modular surface treatment.
* Image 27 provides the actionable grouped work queue.
* Images 30 and 31 influence the refined filters, table density and soft status colours.
* Images 35 and 36 shape the legislative workflow language used in the records.

The strongest design principle for the first mock-up is:

> **A calm parliamentary workspace that prioritises the next required action over decorative analytics.**

The next artefact should be the visual mock-up of this Legislative Command Centre, using the exact seeded records and layout defined above.
