# Current System Review: 2026 Templates Workbook

Source workbook: confidential local workbook, retained outside committed references.

Reviewed: 2026-04-25

## Purpose Of This Reference

This workbook is the clearest artifact of the company's current scheduling and operations system. It should be treated as a confidential source reference for the revamp because it shows what the team already tracks manually, what visual signals they rely on, and where spreadsheet-based coordination starts to break down.

The workbook is not only a schedule. It combines:

- Worker/provider scheduling
- VCC staffing targets
- Swap and leave notes
- Daily assignment tracking
- Operational updates
- Insurance/do-not-take reference information

This means the app should not be designed as a simple calendar replacement. It needs to become a structured operational system that preserves the useful signals from the workbook while removing the ambiguity and manual maintenance burden.

## Workbook Structure

| Sheet | Role In Current Workflow | Observations |
| --- | --- | --- |
| `MA Schedule by Week` | Main medical assistant schedule by date, worker, provider, time, hours, swap fields, update tracking, and comments | Large row-based schedule with filters and frozen panes. Uses manual notes and color highlights for missing MA coverage and provider/MA issues. |
| `MA Table` | Likely a visual/table template or helper sheet | Mostly blank during inspection but has hidden rows/columns and conditional formatting ranges, suggesting a template or generated view. |
| `VCC Schedule by Week` | VCC staffing matrix by date and worker, with goal/min/total formulas and comments | Strongest example of operational logic. Tracks staffing goals, minimum coverage, totals, individual worker coverage, comments, and color-coded approval rules. |
| `Daily Assn` | Daily assignments and workload queues | Tracks date-specific assignments, time blocks, queue counts, SLA notes, and worker/task sections. This is closer to an operations handoff than a schedule. |
| `Do NOT take` | Reference list | Static reference information that staff need during operations. Should remain accessible, but likely outside the core scheduling workflow. |
| `Weekly Updates` | Operational announcements/change log | Captures process changes and reminders. Suggests the future app may need a lightweight internal updates or notes surface. |

## Visual And Workflow Signals

The workbook relies heavily on spreadsheet-native visual language:

- Colored cells indicate status, warnings, approvals, staffing sufficiency, missing coverage, and schedule exceptions.
- Comments columns carry important swap and leave context that is not represented as structured state.
- Formulas in the VCC sheet compute staffing totals against goals and minimums.
- Hidden rows and columns suggest the workbook is being used as both an input tool and a presentation surface.
- Filters and frozen panes help with navigation, but the workbook still requires manual scanning.

The VCC sheet includes explicit workflow rules in the first rows:

- Red total means a shift swap is not approved and requires escalation.
- Blue means overstaffed and a worker can move to a day needing coverage.
- Green means sufficient coverage.
- Some one-to-one shift swaps do not require approval if the spreadsheet is updated.
- Leave days can be self-managed when coverage remains green or blue.

These rules are important product requirements. They show that the future app needs request logic based on coverage state, not just a generic swap board.

## What The Current System Does Well

- It captures a lot of operational reality in one place.
- It gives staff flexible space to annotate exceptions and one-off changes.
- It already distinguishes between normal coverage, overstaffing, insufficient coverage, and blocked states through color.
- It tracks both schedule assignments and operational workload data.
- It lets experienced staff use judgment without being constrained by rigid software.

## Where The Current System Breaks Down

- Important workflow rules are embedded in colors, comments, and informal instructions.
- Workers need to interpret spreadsheet structure instead of seeing a simple self-service path.
- Swap, leave, and coverage states are not modeled as durable request records.
- Manual notes such as swaps, PTO, no-shows, and coverage changes are difficult to audit.
- Staffing logic is split across sheets rather than surfaced in one operational view.
- The workbook mixes schedule data, operations data, updates, and static reference lists.
- Color meaning is powerful but not consistently machine-readable.
- A large sheet can show data, but it cannot guide a user to the next required action.

## Implications For The App Revamp

The app should preserve these current-system strengths:

- Dense operational visibility
- Color-coded exception awareness
- Coverage thresholds and staffing goals
- Worker-by-day matrix scanning
- Notes and context for unusual schedule changes
- Weekly updates or operational announcements

The app should replace these current-system weaknesses:

- Manual interpretation of colors and comments
- Spreadsheet scanning to find issues
- Unstructured swap and leave coordination
- Lack of role-specific views
- Lack of durable audit trail
- Mixing unrelated operational references into the schedule surface

## Product Requirements Extracted From The Workbook

The future app should support:

- A week operations board with rows for workers and columns for days.
- Day-level staffing goals, minimums, totals, and balance states.
- Explicit request states for leave, coverage, swaps, and approvals.
- Blocking rules that explain why a request is not allowed.
- Color states for coverage health, but paired with text labels.
- Staff comments or notes tied to a specific day, worker, provider, or request.
- A worker self-service flow that hides spreadsheet complexity.
- Staff views that can resolve exceptions without scanning multiple sheets.
- A lightweight operational updates/reference area separate from core scheduling.

## Design Takeaways

The workbook confirms that the app should be dense and operational, not decorative.

The right visual direction is closer to:

- Operations board
- Staffing matrix
- Request queue
- Exception dashboard
- Structured handoff log

The wrong direction is:

- Landing page
- Generic card dashboard
- Soft SaaS summary view
- Calendar-only experience
- Spreadsheet clone without workflow state

## Architecture Takeaways

The current workbook implies four core domains:

- `Schedule`: dates, workers, providers, time/hours, assignments.
- `Coverage`: goals, minimums, totals, under/overstaffed states.
- `Requests`: leave, swaps, approvals, blocks, completions.
- `Operations`: daily assignments, updates, notes, and reference information.

The app architecture should keep those domains explicit. The schedule should remain the center, but requests and coverage should become first-class workflow objects rather than comments or color-coded cells.

## Confidentiality Notes

The workbook itself must not be committed, shared publicly, uploaded, or treated as a general project artifact. Only derived, non-sensitive product observations should remain in repo documentation.

During development, use the local confidential copy only when needed to understand workflow shape. Do not reproduce staff names, patient-related details, emails, payer lists, or operationally sensitive cell contents in public docs, tickets, screenshots, or UI examples.

## Review Notes

The workbook contains an invalid pivot cache relationship warning when inspected programmatically. It still opens for read-only workbook analysis, but this is another sign that the spreadsheet is carrying legacy workbook complexity that should not be copied directly into the app architecture.
