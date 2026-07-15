# Command Centre HCI Audit

Baseline date: 15 July 2026  
Baseline build: `879a55a`  
Roles inspected: DLS drafter (Grace Wanjiku), Office of the Clerk  
Viewports inspected: 1440x900, 1280x800, 1024x768, 390x844  
Console: clean at baseline  
Lighthouse snapshot: Accessibility 96; Best Practices 100

## Purpose and user goals

The Command Centre should answer five questions in order:

1. What needs my decision now?
2. What is at risk or due soon?
3. What action should I take next?
4. What is the next sitting/publication constraint?
5. Where can I investigate the underlying work?

The main task is role-dependent: drafters resolve or create legislative work, reviewers open review items, procedural officers progress sitting-critical work, records officers manage digitisation, and the Clerk authorises pending business.

## Visible-element inventory

- Shared shell: brand, grouped primary navigation, pinned/recent navigation, help, system status, duplicate profile, collapse control, breadcrumb, global search, AI status, notifications, help, duplicate profile menu.
- Page introduction: greeting, attention count, directorate/date, two large actions, overflow action.
- View controls: three-mode selector, saved views, filter, refresh.
- Four summary cards.
- Priority Work panel: title, queue search, duplicate filter, density control, explanatory line, View all work, grouped table and row actions.
- Right rail: sitting/publication readiness, attention required, recent activity.
- Recently Worked On card grid below the fold.

## Redundancy baseline

- User identity appears in both the top header and sidebar.
- Help appears in both the top header and sidebar.
- Attention totals appear in the introduction, first summary card, and first queue-group count.
- Readiness appears as a view mode and a persistent right-rail panel.
- Filter appears in the page controls and again in Priority Work.
- My Work is both a dashboard view label and a primary navigation destination.
- Recently opened/worked records appear in both sidebar and page content.
- The dashboard breadcrumb repeats Home and Command Centre while the page lacks a literal Command Centre heading.

## Structured findings

| Screen or component | Problem | User impact | HCI principle | Severity | Recommended correction | Scope |
|---|---|---|---|---|---|---|
| Command Centre summary/saved links | Links use `?view=<status>` while My Work accepts only `list`, `board`, or `calendar` as `view` | Promised drill-down produces a blank workspace | Match with real world; error prevention | High | Use a distinct `status` query parameter and make My Work read it | Shared |
| Clerk summary cards | At-risk, bottleneck, and compliance cards route to deferred Analytics/Audit previews | Normal affordances misrepresent unavailable functionality | Visibility; consistency | High | Route to a meaningful My Work filter where possible; otherwise present non-interactive evidence without hover/link styling | Command Centre |
| Readiness rail | “View readiness” routes to deferred Analytics | Appears to offer a working drill-down but opens a roadmap preview | Visibility; error prevention | High | Keep the useful readiness summary and remove the deferred drill-down | Command Centre |
| Attention rail | Seeded public-participation alert routes to a deferred inbox | A prominent urgent item leads away from Priority 0 functionality | Match; error prevention | High | Remove from operational attention until the inbox is implemented | Command Centre |
| Responsive shell | Fixed expanded sidebar remains at 1024/mobile; top header and content maintain desktop widths | Core content clips and mobile is unusable | Flexibility; accessibility/reflow | Critical | Auto-collapse at tablet widths; use an overlay drawer and menu trigger on narrow screens | Shared |
| Priority Work table | Action column clips at 1280 and horizontal overflow is not visually apparent | Users cannot reliably reach the required action | Visibility; task completion | High | Use a compact, responsive operational row layout and preserve action visibility | Command Centre |
| Page identity | H1 is a greeting rather than the screen name; breadcrumb carries the actual identity | Purpose is slower to recognise and heading semantics are weak | Recognition; hierarchy | Medium | Make “Command Centre” the H1 and move role/date to supporting context | Command Centre |
| Role actions | New instruction and historical import are shown to every role | Actions are irrelevant or imply permissions users do not have | Match; error prevention | High | Provide one role-appropriate primary action and move valid secondary actions to overflow | Command Centre |
| Summary hierarchy | Four equally weighted pastel cards compete with the actual queue and repeat its totals | Users scan decoration before work requiring action | Minimalist design; hierarchy | Medium | Remove the repeated queue-total metric and present three compact supporting indicators | Command Centre |
| Dashboard controls | Filter appears twice; refresh and density controls use unnecessary words or ambiguous icons | Extra choice and duplicated state increase cognitive load | Minimalist design; consistency | Medium | Keep filtering beside the queue; use named icon buttons for refresh/density | Command Centre |
| View selector | “Sitting & Publication Readiness” duplicates the rail and can produce a filtered queue unrelated to the rail summary | Two controls use the same concept for different outcomes | Consistency; match | Medium | Retain My Work/Directorate scope only; keep readiness as a contextual summary | Command Centre |
| Shared sidebar | Too many top-level and secondary destinations; deferred pages look fully available | Navigation is dense and trust drops when links open previews | Minimalist design; visibility | High | Keep Priority 0 destinations in primary navigation; remove deferred and redundant secondary links | Shared |
| Shared sidebar | Identity, help, system status, pinned, and recently opened compete with navigation | Important destinations fall below the fold at 900px | Minimalist design | Medium | Keep identity/profile in the top header; remove duplicate utility/status blocks and move recent access to contextual pages | Shared |
| Shared sidebar labels | Group-label contrast is 3.6:1 | Small navigation labels fail WCAG AA | Accessibility | High | Increase label contrast and verify with Lighthouse | Shared |
| Brand link | Visible “LIMS / National Assembly of Kenya” text is excluded by `aria-label="LIMS home"` | Accessible name does not match visible label | Accessibility; consistency | Medium | Use a visible-label-matching accessible name | Shared |
| Top header | Search, AI status, notifications, help, and full profile cannot reflow at 1024 | Controls clip without a fallback | Flexibility; accessibility | High | Prioritise search and utilities by breakpoint; use icon-only named controls where appropriate | Shared |
| Loading state | Queue skeleton is `aria-hidden`, including its nested screen-reader loading text | Loading is not announced | Visibility of system status | Medium | Put a live status outside the hidden skeleton | Command Centre |
| Empty state | Filtered empty state is explanatory but has no direct reset action | Recovery requires finding separate controls | Error recovery | Medium | Add a clear-filters action in the empty state | Command Centre |
| Recently Worked On | Duplicates records already visible in the queue and sidebar | Adds a third representation of the same records | Minimalist design | Medium | Remove from the Command Centre; recent access remains available contextually | Command Centre |
| Status presentation | Several pills/dots repeat textual stage/priority while owner avatars obscure names at narrower widths | Dense rows become harder to parse | Recognition; accessibility | Medium | Reduce decorative status treatment and preserve readable labels/actions at all supported widths | Command Centre |

## Baseline state checks

- Empty state exists only for local queue filters.
- Loading state exists only for manual refresh and is not announced correctly.
- No request-failure state exists because the data source is static.
- Permission differences are not reflected in Command Centre actions.
- Deferred destinations are not visually distinguished from implemented destinations.
- Browser console was clean.
- No layout shift was observed, but substantial horizontal clipping/overflow occurred below 1440px.
- At 390px the expanded sidebar consumed most of the viewport and the page could not be used.

## Information architecture decision

The revised default order will be:

1. Command Centre identity, concise role/date context, and one role-appropriate primary action.
2. A compact operational summary that excludes the queue total already shown below.
3. Priority Work as the dominant surface, with scope, search, filter, refresh, and density controls colocated.
4. Sitting/publication readiness and attention as supporting context, not competing dashboards.
5. Activity history only where it helps investigate the current operational state.

Deferred analytics, audit, participation, document-archive, and template destinations will not remain in primary navigation during this pass.
