# Strategic Revamp Plan

## Strategic Direction

Next Level Scheduler should become an internal scheduling platform for staff and workers.

The app should no longer feel like a generic dashboard or a demo of completed features. It should feel like the place where schedule clarity, coverage, swap requests, and provider-to-worker constraints are handled directly.

The finalized architecture, feel, and direction live in `Development/architecture-feel-direction.md`. Use that document as the north star for implementation decisions.

The product should be organized around operational questions:

- Who is scheduled?
- Who needs coverage?
- What is blocked?
- What needs approval?
- Which days are under or overstaffed?
- Which provider pairings are invalid?

## Target User Modes

### Staff / Manager Mode

Staff and managers coordinate the schedule. Their experience should prioritize visibility, exceptions, approvals, and correction.

Core needs:

- See the weekly staffing picture immediately.
- Identify understaffed and overstaffed days.
- See provider-to-worker pairing conflicts.
- Review leave and swap requests in an action queue.
- Approve, decline, or block requests with clear reasons.
- Edit assignments and understand the impact of changes.
- Review audit history for schedule changes.

### Worker Mode

Workers need a simple self-service experience. Their view should prioritize clarity, ownership, and request status.

Core needs:

- View my schedule clearly.
- Understand which provider or shift I am assigned to.
- Request leave or coverage from a specific scheduled day.
- Post or propose swaps without reading a spreadsheet.
- Track whether a request is pending, approved, declined, blocked, or completed.
- Understand blocking reasons in plain language.

## Information Architecture Shift

The current app is organized around feature pages. The revamp should organize it around work.

Recommended structure:

- `Today / Week`: default operations board showing schedule, staffing balance, conflicts, and active requests.
- `Requests`: leave, coverage, and swap request queue with approval status.
- `My Schedule`: worker-focused schedule and personal request history.
- `Rules`: staff-only provider-to-worker rules and scheduling constraints.
- `Admin`: staff-only configuration, audit history, and future management tools.

The default experience should not be a landing page or a set of summary cards. It should be the weekly operations board.

## UX And Visual Direction

The design should become calmer, denser, and less decorative.

Design principles:

- Prefer tables, calendars, rows, and queues over floating feature cards.
- Surface exceptions directly in the schedule.
- Use color sparingly and consistently for operational states.
- Reduce gradients, hover lifts, large pills, and decorative polish.
- Keep text compact but readable.
- Make status labels practical: `Needs coverage`, `Pending approval`, `Blocked`, `Approved`, `Balanced`, `Understaffed`.
- Remove prototype language from product-facing screens.

The app should feel trustworthy and plainspoken. It should look like a tool people can use repeatedly during the workday.

## Revamp Phases

### Phase 1: Documentation Alignment

- Create and maintain the revamp documentation packet.
- Keep `Development/revamp-status.md` updated as work progresses.
- Align `PROJECT_WEB_DEV_STATE.md` when the active implementation direction changes.
- Convert this strategic plan into implementation tickets.

### Phase 2: UX Information Architecture

- Redesign the default schedule page into a weekly operations board.
- Separate staff/manager and worker navigation paths.
- Reframe swap board and my swaps as request management flows.
- Define empty, loading, and blocked states using real operational language.

### Phase 3: Visual System Cleanup

- Reduce card-heavy presentation in schedule and admin views.
- Replace decorative styling with denser operational layouts.
- Standardize status colors and labels.
- Remove all product-facing `demo`, `MVP`, and `next step` language.

### Phase 4: Real Request And Swap Actions

- Move propose, accept, decline, and cancel actions to server-side mutations.
- Persist all request state changes in the database.
- Validate conflicts and provider pairings on the server.
- Show clear blocking reasons in the UI.

### Phase 5: Auth And Role Gating

- Add real authentication.
- Gate staff/manager tools from worker views.
- Replace guessed demo users with session-derived current users.
- Ensure workers can only act on their own schedule and requests.

### Phase 6: Auditability And Trust

- Add audit events for schedule edits, request decisions, and swap outcomes.
- Show recent changes where they help staff understand schedule movement.
- Keep decision history tied to the affected request or schedule item.

### Phase 7: Verification And Readiness

- Add automated checks for scheduling rules and request transitions.
- Browser-test staff operations and worker self-service flows.
- Verify the app can run without demo fallbacks hiding failures.
- Confirm the app answers the core operational questions before release.

## Implementation Priorities

1. Weekly operations board with worker rows, day columns, assignment cells, operational day headers, and visible exceptions.
2. Staff and worker mode separation.
3. Product copy cleanup.
4. Request/action queue redesign.
5. Server-side swap/request actions.
6. Auth and role gating.
7. Audit history.
8. Verification suite.

## Acceptance Criteria

The revamp is successful when:

- Staff can open the app and immediately understand the weekly staffing picture.
- Workers can understand their own schedule and request status without manager explanation.
- Coverage gaps, pairing conflicts, and pending requests are visible without spreadsheet scanning.
- Swap and leave decisions are made through the app, not through disconnected conversations.
- Product-facing UI no longer sounds like a prototype.
- Critical scheduling rules are enforced on the server and covered by tests.
