# Screen 3 Design Brief: My Work Queue

## Recommended direction

The second major screen should be a **full operational workspace**, not simply a larger copy of the Command Centre table.

The Command Centre answers:

> What needs my attention right now?

The My Work screen should answer:

> What legislative work am I responsible for, where is each item, what can I do next, and how can I organise my workload?

It should support three complementary views:

1. **List View — default**
2. **Board View — secondary**
3. **Calendar View — supporting**

This follows the strongest pattern in your first two references while using the rounded, modern visual language from the HR Hub reference.

---

# 1. What to take from the references

## First inspiration: Kanban view

The first image provides a strong model for the Board View.

### Useful elements

* Clear status columns
* Soft pastel column headers
* Rounded white cards
* Compact record metadata
* Due dates at the top of cards
* Priority labels
* Assigned-user avatars
* Counts in column headers
* Multiple view options
* Search and filter controls close to the content
* Visually obvious movement from one stage to another

### Adapt for LIMS

Instead of generic project statuses:

```text
To Do
On Process
On Review
Completed
```

Use work-oriented parliamentary statuses:

```text
Requires My Action
In Progress
Awaiting Review
Waiting on Others
Completed
```

These should be **work queue statuses**, not necessarily the official Bill lifecycle stages.

For example:

* A Bill may officially be at `Legal Review`
* But in Grace’s personal board, it appears under `Waiting on Others`

This distinction is important.

### Avoid

* Too many cards in every column
* Bright SaaS blue as the main accent
* Treating a Bill like a simple task
* Dragging official workflow stages freely without controls
* Showing too many avatars on every card

---

## Second inspiration: Grouped List View

The second image is the strongest basis for the default My Work experience.

### Useful elements

* Grouped collapsible sections
* Clear rows and columns
* Soft pastel group headers
* Dense but readable structure
* Familiar spreadsheet-style scanning
* View switching at the top
* Search and filter controls
* Group counts
* Expand and collapse controls

### Adapt for LIMS

Use groups such as:

```text
Requires My Action
In Progress
Awaiting Review
Waiting on Another Officer
Recently Completed
```

This supports a large legislative workload better than one continuous table.

The List View should remain the default because it:

* Handles more records than a Kanban board
* Makes deadlines easier to compare
* Supports sorting and filtering
* Is easier for experienced government users
* Works better for audit-heavy, metadata-rich records
* Can support bulk actions

---

## Third inspiration: HR Hub document grid

The HR Hub reference is valuable primarily for its styling.

### Useful elements

* Rounded modern cards
* Clean neutral background
* Soft shadows
* Simple filter controls
* Black or very dark primary action button
* Pastel category and warning treatments
* Strong hierarchy
* Modern but not overly decorative layout
* Generous whitespace
* Balanced use of rounded shapes

### Where to apply it

Use this treatment for:

* Kanban cards
* Saved-view cards
* Quick-preview side sheet
* Empty states
* Recently accessed items
* Filter chips
* Summary indicators

### Avoid

The card-grid layout should not become the default representation for all Bills. It is attractive but becomes inefficient when there are dozens or hundreds of records.

---

# 2. Sidebar question: should Bills be listed individually?

## Recommendation

Do **not** list all Bills individually in the sidebar.

That would work when there are five Bills, but become poor UX when there are:

* Dozens of active Bills
* Historical Bills
* Multiple years
* Several versions
* Restricted records
* Bills across different stages

A sidebar should be used for stable navigation, not for becoming a miniature document archive.

## Recommended sidebar structure

```text
Legislative Work
  Bills
  Motions
  Questions
  Statements
  Petitions
  More legislative business
```

Selecting **Bills** opens a dedicated Bills page where the user can:

* Search
* Filter
* Browse by year
* Browse by stage
* Browse by sponsor
* View active and archived Bills
* Switch between list and card presentation

## Useful compromise: Pinned and recent records

Under the main navigation, a small collapsible area may show:

```text
Pinned Work
  Digital Public Services Bill, 2026
  Public Finance Amendment Bill, 2026
  Order Paper — Sitting No. 42
```

Rules:

* Maximum 3–5 visible items
* User-controlled
* Ellipsised titles
* Not grouped under “Bills”
* Collapsible
* Removed automatically only by user action, not by workflow changes

A separate `Recently Opened` menu could also appear inside global search rather than permanently in the sidebar.

## Final position

Use the sidebar for:

* Product sections
* Work types
* Stable tools
* A small number of pinned records

Use the Bills page, search and My Work screen for large volumes of legislative records.

---

# 3. Screen definition

## Screen name

**My Work**

## Primary persona

**Grace Wanjiku**
Senior Legal Counsel
Directorate of Legal Services

## Purpose

Provide Grace with a complete, configurable and actionable view of all legislative work assigned to her, involving her, or awaiting her response.

## Five-second understanding

When the screen opens, Grace should immediately understand:

1. How much work she currently has
2. Which items require action
3. Which items are overdue or approaching deadlines
4. Which work is waiting on someone else
5. Whether she is viewing a list, board or calendar
6. Which filters are active
7. How to open or organise a record

---

# 4. Main relationship to the Command Centre

The Command Centre should show perhaps 7–12 high-priority items.

My Work should contain the complete workload, potentially:

* 40 active items
* 12 waiting on others
* 8 recently completed
* 3 overdue
* 5 returned for revision

The Command Centre links into filtered My Work views.

Examples:

```text
/dashboard
```

Clicking `Requires My Action` opens:

```text
/work?view=list&status=requires-action
```

Clicking `Awaiting My Review` opens:

```text
/work?view=list&status=awaiting-review
```

Clicking `View all work` opens:

```text
/work
```

---

# 5. Desktop canvas and layout

## Primary frame

```text
1440 × 900 px
```

Also optimise for:

```text
1366 × 768 px
```

## Layout structure

```text
┌───────────────────────────────────────────────────────────────┐
│ Sidebar │ Global header                                       │
│         ├──────────────────────────────────────────────────────┤
│         │ My Work title, summary and primary actions           │
│         ├──────────────────────────────────────────────────────┤
│         │ Saved views and workload indicators                  │
│         ├──────────────────────────────────────────────────────┤
│         │ View switcher, search, filters and sorting           │
│         ├──────────────────────────────────────────────────────┤
│         │                                                      │
│         │ List / Board / Calendar workspace                    │
│         │                                                      │
└───────────────────────────────────────────────────────────────┘
```

Unlike the Command Centre, My Work does not need a permanent right-side rail.

The work area should use most of the width.

Side sheets appear from the right when detailed controls or previews are needed.

---

# 6. Shared application shell

Reuse the exact application shell established in the Command Centre:

* Deep green sidebar
* National Assembly branding
* Global search
* Notification icon
* Secure AI indicator
* User profile
* Demonstration environment notice
* Consistent breadcrumbs

## Breadcrumb

```text
Home / My Work
```

## Active navigation

`My Work` should become active in the sidebar.

Use:

* Soft green active background
* Gold vertical indicator
* White text
* Clear icon

---

# 7. Page header

## Title

```text
My Work
```

## Supporting line

```text
Manage legislative items assigned to you, awaiting your review or involving your directorate.
```

## Context line

```text
Grace Wanjiku · Senior Legal Counsel · Directorate of Legal Services
```

## Right-side actions

Primary:

```text
+ New Legislative Instruction
```

Secondary:

```text
Export Worklist
```

Overflow menu:

```text
More
  Import historical document
  Manage saved views
  Configure reminders
  Reset filters
```

The primary action remains green.

Export should be an outlined button.

---

# 8. Workload indicators

Use four compact indicators beneath the page header.

These should be less visually dominant than the Command Centre cards.

## Indicators

```text
Active Work
24
```

```text
Requires My Action
7
```

```text
Due This Week
6
```

```text
Waiting on Others
9
```

Optional fifth indicator if space permits:

```text
Overdue
2
```

## Treatment

* White cards
* Thin neutral border
* Small pastel icon background
* Moderate rounding
* Minimal or no shadow
* Clickable
* Active selection visible where filtered

The selected indicator may become a pale green filter chip rather than a strong card.

---

# 9. Saved views

Place a horizontal saved-view strip beneath the workload indicators.

## Default saved views

```text
All My Work
Requires My Action
Due Within 48 Hours
Awaiting Review
Returned to Me
Waiting on Others
Recently Completed
```

## User-created examples

```text
High Priority Bills
This Week’s Publications
Clause Reviews
```

## Visual pattern

Use rounded chips or compact tabs.

Recommended treatment:

* Active view: deep green fill, white text
* Inactive views: white background, thin border
* User-created view: small bookmark icon
* Horizontal scrolling if needed
* `+ Save current view` at the end

Do not display dozens of tabs at once.

Show approximately six and place the remainder under:

```text
More views
```

---

# 10. View switcher

Use a prominent but compact segmented control:

```text
List View
Board View
Calendar View
```

Default:

```text
List View
```

Each view should retain:

* Current filters
* Current search
* Current saved view
* Sorting where applicable

## Icons

* List icon
* Kanban columns icon
* Calendar icon

Do not use a separate page route for every view unless required by development.

Recommended URL state:

```text
/work?view=list
/work?view=board
/work?view=calendar
```

---

# 11. Search and control bar

Place the view selector on the left and operational controls on the right.

## Search field

Placeholder:

```text
Search my legislative work
```

Search should recognise:

* Title
* Reference
* Clause
* Document type
* Assigned officer
* Sponsor
* Stage

## Controls

```text
Filter
Group by
Sort
Columns
```

### Filter

Opens the Filter Side Sheet.

### Group by

Options:

* Work state
* Legislative stage
* Workflow type
* Priority
* Due date
* Directorate
* No grouping

Default:

```text
Work state
```

### Sort

Default:

```text
Urgency and due date
```

Other options:

* Recently updated
* Oldest waiting
* Title
* Priority
* Date assigned
* Legislative stage

### Columns

Available in List View only.

Opens the Column Settings Side Sheet.

---

# 12. List View — default

## Purpose

Support dense operational scanning, filtering and bulk management.

## Work-state groups

### Requires My Action

Pastel red or pale pink header.

Includes:

* Returned for revision
* Blocking comments
* Required approval or response
* Unresolved validation
* Tasks explicitly assigned to Grace

### In Progress

Pastel gold or cream header.

Includes work currently being drafted or actively handled.

### Awaiting Review

Pale blue header.

Includes work submitted for review or assigned to Grace as reviewer.

### Waiting on Another Officer

Soft neutral or pale blue-grey header.

Includes records blocked by:

* DLPS
* PBO
* Clerk’s Office
* Another reviewer
* External supporting information

### Recently Completed

Pale green header.

Collapsed by default.

Includes work completed within the last 14 or 30 days.

---

# 13. List View columns

Recommended columns:

```text
Selection
Legislative Item
Type
Current Stage
Required Action
My Role
Due
Priority
Last Activity
Actions
```

## Legislative Item cell

Show:

* Title
* Official reference
* Current version
* Classification icon where relevant

Example:

```text
Digital Public Services Bill, 2026
NA/BILL/2026/015 · Version 4.0
```

## Current Stage

Use a pastel status pill.

Examples:

* Drafting
* Legal Review
* Revision Requested
* Procedural Review
* Awaiting Signature
* Published

## Required Action

Use direct language:

```text
Resolve blocking comment on Clause 14
```

Not generic language such as:

```text
Continue
```

## My Role

Examples:

* Drafter
* Reviewer
* Collaborator
* Observer
* Stage owner

## Due

Show:

```text
Today, 4:00 PM
```

Use red only where overdue or critically urgent.

## Row action

Always include a direct primary row action:

* Continue Revision
* Review Draft
* Complete Validation
* View Status
* Open Workspace

The overflow menu may contain secondary actions.

---

# 14. Seeded List View records

## Requires My Action

### 1. Digital Public Services Bill, 2026

```text
Reference: NA/BILL/2026/015
Version: 4.0
Type: Bill
Stage: Revision Requested
Required action: Resolve blocking comment on Clause 14
My role: Drafter
Due: Today, 4:00 PM
Priority: High
Last activity: Returned 36 minutes ago by David Otieno
Action: Continue Revision
```

### 2. Public Procurement and Asset Disposal Amendment Bill, 2026

```text
Reference: NA/BILL/2026/011
Type: Bill
Stage: Legal Review
Required action: Review changes to Clauses 8–11
My role: Reviewer
Due: Tomorrow
Priority: High
Last activity: Version 3.1 submitted this morning
Action: Review Draft
```

### 3. Petition on Assisted Access to Digital Government Services

```text
Reference: NA/PET/2026/084
Type: Petition
Stage: Intake Verification
Required action: Confirm legal classification
My role: Legal reviewer
Due: Today
Priority: Medium
Last activity: Submitted this morning
Action: Review Petition
```

---

## In Progress

### 4. Statutory Instruments Tracking Regulations, 2026

```text
Reference: NA/SI/2026/027
Type: Statutory Instrument
Stage: Drafting
Required action: Continue drafting Part III
My role: Drafter
Due: 18 July 2026
Priority: Medium
Last activity: Edited yesterday
Action: Continue Drafting
```

### 5. National Cybersecurity Coordination Bill, 2026

```text
Reference: NA/BILL/2026/018
Type: Bill
Stage: Drafting
Required action: Complete definitions schedule
My role: Drafter
Due: 19 July 2026
Priority: Medium
Last activity: Draft updated today
Action: Continue
```

### 6. Motion on Digital Accessibility in Public Institutions

```text
Reference: NA/MOT/2026/046
Type: Motion
Stage: Legal Review
Required action: Complete admissibility assessment
My role: Reviewer
Due: 21 July 2026
Priority: Medium
Last activity: Two comments unresolved
Action: Review
```

---

## Awaiting Review

### 7. Public Service Delivery Amendment Bill, 2026

```text
Reference: NA/BILL/2026/017
Type: Bill
Stage: Legal Review
Required action: Await reviewer decision
My role: Drafter
Due: 22 July 2026
Priority: Medium
Last activity: Submitted yesterday
Action: View Review Status
```

### 8. Statutory Instruments Compliance Report

```text
Reference: NA/SI/REPORT/2026/008
Type: Report
Stage: Directorate Review
Required action: Await directorate review
My role: Author
Due: 24 July 2026
Priority: Low
Last activity: Assigned to David Otieno
Action: View
```

---

## Waiting on Another Officer

### 9. Public Finance Amendment Bill, 2026

```text
Reference: NA/BILL/2026/009
Type: Bill
Stage: Awaiting Supporting Information
Required action: PBO documentation pending
My role: Drafter
Due: 20 July 2026
Priority: Medium
Last activity: Request sent to PBO
Action: View Request
```

### 10. Order Paper — Sitting No. 42

```text
Reference: NA/OP/2026/042
Type: Order Paper
Stage: Procedural Review
Required action: Awaiting DLPS confirmation
My role: Collaborator
Due: Tomorrow
Priority: High
Last activity: Assigned to Ruth Naliaka
Action: View Status
```

### 11. Votes and Proceedings — 14 July 2026

```text
Reference: NA/VP/2026/0714
Type: Votes and Proceedings
Stage: Approval
Required action: Awaiting Clerk sign-off
My role: Contributor
Due: 16 July 2026
Priority: Medium
Last activity: Signature pending
Action: View
```

---

# 15. List View bulk actions

When one or more rows are selected, display a sticky bulk-action bar.

## Actions

```text
Assign
Add reminder
Change priority
Add to saved view
Export selected
```

Do not allow bulk workflow transitions such as approving multiple legislative items unless explicitly permitted.

Sensitive actions must remain item-specific.

---

# 16. Board View

## Purpose

Provide a visual workload overview and help users understand the distribution and movement of their work.

## Board columns

Use five columns:

```text
Requires My Action
In Progress
Awaiting Review
Waiting on Others
Completed
```

At 1440px, four columns may fit comfortably while the fifth requires horizontal scrolling.

Horizontal scrolling is acceptable for Board View.

## Column headers

Each header should show:

* Icon
* Column name
* Count
* Add or menu control
* Soft pastel background

Example:

```text
Requires My Action  3
```

## Suggested pastel treatment

* Requires My Action: soft pink
* In Progress: soft gold
* Awaiting Review: soft blue
* Waiting on Others: soft grey-blue
* Completed: soft green

Column bodies should remain a very light neutral.

Do not tint the entire screen strongly.

---

# 17. Board card design

Use the rounded, modern feel from the first and third inspirations.

## Card structure

### Top row

* Due date
* Confidentiality icon where relevant
* Overflow menu

### Title

```text
Digital Public Services Bill, 2026
```

### Reference

```text
NA/BILL/2026/015 · Version 4.0
```

### Required action

```text
Resolve blocking comment on Clause 14
```

### Stage

Pastel pill:

```text
Revision Requested
```

### Progress or checklist

Example:

```text
Review comments
3 of 4 resolved
```

Use a restrained segmented progress line.

### Bottom row

* My role
* Priority
* Comment count
* Attachment count
* Related-officer avatar where useful

### Primary action

Cards do not need a full button on every card.

Clicking the card opens the Work Item Quick View Side Sheet.

The side sheet contains the explicit primary action.

---

# 18. Board drag-and-drop behaviour

## Important UX decision

Users should not freely drag a Bill between official legislative lifecycle stages.

Dragging in My Work changes only the **personal work-state representation**, where permitted.

Examples:

* `In Progress` → `Awaiting Review` can trigger a submit-for-review confirmation
* `Requires My Action` → `Completed` may not be allowed where approval is required
* `Waiting on Others` cannot normally be manually changed without a related workflow action

## Prototype behaviour

For the React prototype:

* Dragging may be visually supported
* Valid destinations highlight green
* Invalid destinations remain disabled
* Dropping may open a confirmation Side Sheet
* The official stage changes only after confirmation

Example message:

> Moving this item to Awaiting Review will submit Version 4.1 to David Otieno for legal review.

Buttons:

```text
Cancel
Submit for Review
```

This makes the Kanban view useful without making it procedurally unsafe.

---

# 19. Calendar View

## Purpose

Help users understand upcoming deadlines, review dates, sittings and publication events.

## Modes

```text
Month
Week
Agenda
```

Default:

```text
Week
```

## Event types

* Draft due
* Review deadline
* Publication deadline
* Sitting date
* Public-participation closing date
* Signature due
* Reminder

## Event treatment

Use colour plus an icon and label.

Colour must not be the only differentiator.

## Interaction

Clicking an event opens the Work Item Quick View Side Sheet.

The Calendar View is supporting, not a hero screen.

It should be implemented after the List and Board views.

---

# 20. Side sheets

All detailed overlays on My Work should use **right-side sheets**, as requested.

Avoid centre modals except for destructive confirmation.

## Shared side-sheet behaviour

### Desktop width

Small:

```text
420–460 px
```

Medium:

```text
520–600 px
```

Large preview:

```text
640–720 px
```

### Structure

* Sticky header
* Scrollable content
* Sticky footer actions
* Close icon
* Clear title
* Context/reference beneath title
* Soft page overlay
* ESC closes where safe
* Unsaved changes require confirmation

### Mobile

Side sheets become full-screen panels.

---

# 21. Side Sheet A: Filter My Work

## Width

```text
460 px
```

## Header

```text
Filter My Work
24 records
```

## Sections

### Work state

Checkboxes:

* Requires My Action
* In Progress
* Awaiting Review
* Waiting on Others
* Completed

### Workflow type

* Bill
* Motion
* Question
* Statement
* Petition
* Order Paper
* Votes and Proceedings
* Papers Laid
* Statutory Instrument
* Supply

Include search within the options.

### Legislative stage

* Intake
* Drafting
* Legal Review
* Revision Requested
* Procedural Review
* Awaiting Signature
* Published

### My role

* Drafter
* Reviewer
* Collaborator
* Stage owner
* Observer

### Priority

* High
* Medium
* Low

### Due date

* Overdue
* Today
* Within 48 hours
* This week
* Custom range

### Directorate

* DLS
* DLPS
* Joint
* Other configured unit

### Classification

* Public
* Internal
* Restricted
* Confidential

## Footer

```text
Clear all
Show 12 results
```

The results count should update as filters change.

---

# 22. Side Sheet B: Work Item Quick View

## Width

```text
600 px
```

## Purpose

Allow the user to inspect a legislative record without leaving My Work.

## Header

```text
Digital Public Services Bill, 2026
NA/BILL/2026/015 · Version 4.0
```

Show:

* Stage pill
* Priority
* Classification
* Due date

## Content sections

### Required action

```text
Resolve the blocking comment on Clause 14 and submit a corrected version.
```

### Workflow summary

* Current stage
* Previous stage
* Next expected stage
* Time in current stage

### My responsibilities

* Drafter
* Current task
* Due date
* Completion checklist

### Blocking issues

```text
1 blocking comment
1 cross-reference warning
```

### Assigned people

* Grace Wanjiku
* David Otieno
* Ruth Naliaka

### Recent activity

Compact timeline.

### Related material

* Current master document
* Supporting documents
* Public submissions
* Previous versions

## Footer actions

Primary:

```text
Continue Revision
```

Secondary:

```text
Open Full Workspace
```

Overflow:

* Add reminder
* Pin item
* Export summary
* Copy reference

---

# 23. Side Sheet C: Save Current View

## Width

```text
420 px
```

## Fields

```text
View name
Description
Visibility
```

Visibility options:

* Only me
* Directorate
* Selected users

Include:

```text
Set as default My Work view
```

Show a summary:

```text
Filters included:
Requires My Action
Bills
Due this week
High priority
```

## Footer

```text
Cancel
Save View
```

---

# 24. Side Sheet D: Column Settings

## Width

```text
420 px
```

## Options

Allow show/hide and reorder:

* Legislative Item
* Type
* Stage
* Required Action
* My Role
* Owner
* Due Date
* Priority
* Last Activity
* Attachments
* Comments
* Classification

Fixed columns:

* Selection
* Legislative Item
* Actions

## Footer

```text
Reset to default
Apply columns
```

---

# 25. Side Sheet E: Add Reminder

## Width

```text
420 px
```

## Fields

* Reminder date
* Time
* Notification channel
* Note
* Repeat option

Channels:

* In-app
* Email
* SMS, if configured

Example:

```text
Remind me two hours before the Clause 14 revision deadline.
```

## Footer

```text
Cancel
Add Reminder
```

---

# 26. Side Sheet F: Assignment and Collaboration

## Width

```text
480 px
```

## Purpose

Assign, reassign or add collaborators where permissions allow.

## Content

* Current owner
* Current collaborators
* Search staff
* Role on record
* Due date
* Assignment note
* Notification toggle

## Permission handling

Where the user cannot reassign:

> You can suggest a collaborator, but reassignment requires a Directorate Lead.

Display:

```text
Request Reassignment
```

instead of:

```text
Reassign
```

---

# 27. Side Sheet G: Board transition confirmation

## Width

```text
460 px
```

Shown after a meaningful Kanban drag.

## Example

Title:

```text
Submit for Legal Review?
```

Content:

```text
Moving Digital Public Services Bill, 2026 to Awaiting Review will submit Version 4.1 to David Otieno.
```

Checklist:

* Validation passed
* No unresolved blocking comments
* Version notes completed
* Reviewer assigned

If an issue exists:

```text
Submission is blocked because one validation issue remains.
```

## Footer

```text
Cancel
Submit for Review
```

---

# 28. Supporting routes

## Primary routes

```text
/work
/work?view=list
/work?view=board
/work?view=calendar
```

## Filtered routes

```text
/work?status=requires-action
/work?status=awaiting-review
/work?due=48-hours
/work?priority=high
```

## Saved views

```text
/work/views/high-priority-bills
/work/views/this-week-publications
```

This may be represented through query parameters in implementation rather than separate route files.

## Record navigation

```text
/legislative/NA-BILL-2026-015
```

## Drafting

```text
/legislative/NA-BILL-2026-015/draft
```

## Review

```text
/legislative/NA-BILL-2026-011/review
```

## Create record

```text
/legislative/new
```

## Side sheet URL behaviour

For shareable state, use query parameters:

```text
/work?view=list&item=NA-BILL-2026-015
/work?view=list&sheet=filters
/work?view=board&item=NA-MOT-2026-046
```

This allows refresh and browser back behaviour to remain predictable.

---

# 29. Main interactions

## Clicking a work item

Default behaviour:

* Opens Quick View Side Sheet
* Does not immediately navigate away

## Double-clicking or clicking “Open Workspace”

Navigates to the full record.

## Clicking a summary indicator

Applies a filter.

## Clicking a saved view

Applies its stored filter, sort and grouping.

## Switching views

Preserves filters.

## Collapsing a group

Persists during the session.

## Selecting rows

Shows bulk-action toolbar.

## Pinning an item

Adds it to `Pinned Work` in the sidebar.

## Dragging a card

Starts a controlled workflow-transition process.

---

# 30. Visual direction

## Overall tone

The screen should feel:

* More operational than the Command Centre
* Modern and rounded
* Dense but calm
* Institutional
* Purpose-built
* Highly usable for daily work
* Similar in polish to the HR Hub reference
* Similar in structure to the first two references

## Recommended synthesis

Use:

* **Second reference** for List View structure
* **First reference** for Board View
* **Third reference** for card styling, rounding and whitespace
* **Existing Command Centre** for National Assembly branding and navigation

---

# 31. Rounded design treatment

The visual design may be somewhat more rounded than the Command Centre, particularly in Board View.

## Recommended radii

```text
Main containers: 14–16 px
Kanban cards: 14 px
Summary cards: 12 px
Inputs: 10 px
Buttons: 9–10 px
Status pills: fully rounded
Side sheets: 16 px left corners
```

Avoid overly rounded 24–32 px consumer-app cards.

The interface must remain professional.

---

# 32. Colour system

Continue the established National Assembly system.

## Primary

```text
Deep sidebar green: #073F27
Primary green:      #0B6B3A
Hover green:        #095B32
Institutional gold: #D6B84C
```

## Neutrals

```text
Page background: #F4F6F3
Card background: #FFFFFF
Border:          #DCE3DD
Strong text:     #17211B
Muted text:      #657168
```

## Pastels

```text
Requires action: #FBEAEC
In progress:     #FFF5D8
Awaiting review: #EAF1F8
Waiting:         #EEF1F3
Completed:       #E8F4EC
```

Use the pastels mainly for:

* Group headers
* Board headers
* Status chips
* Small icon surfaces
* Selected cards

Do not tint every card fully.

---

# 33. Typography

Use the same typography as the Command Centre.

Recommended:

* Source Sans 3 or Inter for application UI
* A serif font only inside legislative-document previews

## Hierarchy

```text
Page title:       28 px / semibold
Section heading:  18 px / semibold
Card title:       14–15 px / semibold
Table text:       13–14 px
Metadata:         12 px
Status pills:     11–12 px / medium
```

---

# 34. Table density

Provide two density settings:

```text
Comfortable
Compact
```

Default:

```text
Comfortable
```

Compact is useful for users managing many records.

Density can be located under the Columns control.

---

# 35. Empty states

## No records in view

```text
No legislative work matches this view
Try removing a filter or opening All My Work.
```

Actions:

```text
Clear filters
View all work
```

## No completed work

```text
Completed items will appear here once your assigned actions are finished.
```

## No search results

```text
No records found for “housing levy”
Search by title, reference, clause or document type.
```

---

# 36. Loading states

Implement:

* Initial queue skeleton
* Switching-view skeleton
* Filter application
* Quick View Side Sheet loading
* Board transition processing
* Export preparation

Do not show a full-page spinner for ordinary work.

---

# 37. Error and permission states

## Restricted item

```text
You can see that this record exists, but its content is restricted.
```

## Unable to reassign

```text
Reassignment requires Directorate Lead permission.
```

## Invalid workflow transition

```text
This item cannot be moved to Completed while legal approval is pending.
```

## Stale version

```text
Version 4.1 was updated by David Otieno while this view was open.
Refresh before continuing.
```

---

# 38. Responsive behaviour

## Desktop

Full sidebar and table.

## Medium desktop

* Sidebar may collapse
* Some secondary columns hidden
* Right-side sheets remain 480–560 px
* Board horizontally scrolls

## Tablet

* List becomes simplified
* Cards replace some table rows
* Filters remain side sheets
* Calendar defaults to agenda mode

## Mobile

The internal My Work screen is lower priority than the public portal but should still:

* Use full-width cards
* Use bottom or full-screen sheets
* Hide bulk operations
* Default to simplified list
* Avoid displaying the full data table

---

# 39. Phase 2 acceptance criteria

The screen is ready for development when:

* My Work has functional List, Board and Calendar selectors
* List View is the default
* Work items are grouped and collapsible
* Search works against seeded records
* Filters open in a right-side sheet
* Filter count updates
* Saved views are visible
* A saved view can be created
* Column settings open in a right-side sheet
* Clicking a row opens Quick View
* Quick View links to the full Bill Workspace
* Board cards use rounded modern styling
* Board columns reflect work states
* A card drag triggers a controlled transition sheet
* Calendar displays seeded deadlines
* Summary indicators apply filters
* Bulk actions appear when rows are selected
* Pinned work supports a maximum of 3–5 sidebar records
* No full list of Bills appears in the sidebar
* Filters and view state persist during the session
* All key actions have loading, success and error feedback
* Layout works at 1440×900 and 1366×768

---

# Recommended visual composition for the upcoming mock-up

For the primary visual image, use the **List View**, because it is the operational default and will show the most information.

The image should display:

```text
Deep green sidebar
+
My Work page header
+
Compact workload indicators
+
Saved views strip
+
List / Board / Calendar switcher
+
Search, Filter, Group and Sort controls
+
Rounded grouped legislative tables
+
A partially open Work Item Quick View Side Sheet
```

Showing the Quick View Side Sheet partially open in the same presentation image would communicate that the screen is not merely a table.

A separate second visual could then show the Board View using the same data and design system.

## Final design principle

> **My Work should combine the scanning power of a structured government worklist with the visual clarity and modernity of a polished Kanban product—without allowing visual simplicity to weaken legislative control.**
