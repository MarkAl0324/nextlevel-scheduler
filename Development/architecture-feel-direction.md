# Architecture, Feel, and Direction

## Status

This document is the revamp north star for Next Level Scheduler.

It defines the app we are building toward before more implementation work continues. Future feature work should align with this document unless a later decision explicitly replaces it.

Last updated: 2026-04-25

## Product Direction

Next Level Scheduler is an internal scheduling platform for staff and workers.

It replaces manual Google Sheets and unclear schedule presentation with a shared operational system for:

- Seeing who is scheduled.
- Finding coverage gaps.
- Managing leave and swap requests.
- Enforcing provider-to-worker pairing rules.
- Giving workers a clear self-service schedule experience.

The product should not feel like a generic SaaS dashboard, calendar demo, or polished wrapper around spreadsheet data. It should feel like the source of truth for daily schedule coordination.

The confidential current spreadsheet system confirms that the app must preserve dense operational visibility, staffing thresholds, color-coded exception awareness, and day-by-worker scanning while converting manual notes and color meanings into structured workflow state.

## Primary User Modes

### Staff / Manager Mode

Staff and managers coordinate schedule operations.

Their default experience should answer:

- Are we covered this week?
- Which days are understaffed or overstaffed?
- Which provider pairings are invalid?
- Which requests need approval?
- Which schedule changes happened recently?

Staff mode should prioritize:

- Weekly operations board
- Exception queue
- Request approval
- Schedule editing
- Rule management
- Audit visibility

### Worker Mode

Workers view and manage their own schedule.

Their default experience should answer:

- When am I scheduled?
- Who or what am I assigned to?
- Can I request leave or coverage for this shift?
- What is the status of my request?
- Why was something blocked?

Worker mode should prioritize:

- My schedule
- Request leave or coverage
- Offer or propose swaps
- Request status tracking
- Plain blocking reasons

## Product Architecture

The app should be organized around operational work, not feature inventory.

Recommended navigation model:

| Area | Primary user | Purpose |
| --- | --- | --- |
| Week | Staff, workers | Default schedule view; staff see operations board, workers see schedule-relevant view |
| Requests | Staff, workers | Staff action queue; workers request history and active requests |
| My Schedule | Workers | Personal schedule, leave, coverage, and swap entry points |
| Rules | Staff | Provider-to-worker pairing rules and scheduling constraints |
| Admin | Staff | Configuration, audit history, and future management tools |

The existing `Schedule`, `Swap Board`, `My Swaps`, and `Admin` surfaces should be reframed into this model over time. The underlying features are useful, but the navigation and screen framing should become more operational.

## Default Experience

The default signed-in screen should be the week operations board.

For staff, this board should show:

- Week grid with workers as rows and days as columns.
- Provider assignment or coverage status in each cell.
- Day headers with provider count, worker count, and staffing delta.
- Inline exception markers for understaffing, overstaffing, pairing conflicts, and pending requests.
- A side or top queue for items requiring action.

For workers, the default can use the same schedule data but should emphasize:

- My assignments.
- My pending requests.
- Request actions tied to specific shifts.
- Clear status and next step language.

The month view should be secondary. It is useful for orientation, but the week board is where operational decisions happen.

## Technical Architecture

Keep the existing stack:

- Next.js App Router
- React and TypeScript
- Postgres
- Prisma

Move toward a server-first operational architecture:

- Server components load schedule, request, rule, and balance data.
- Client components handle interaction, filtering, drawers, and optimistic UI only where helpful.
- Mutating operations run on the server through server actions or route handlers.
- Validation rules run on the server and return plain-language blocking reasons.
- Database writes that change swaps, requests, assignments, or approvals happen inside transactions.

Core service boundaries:

| Boundary | Responsibility |
| --- | --- |
| Schedule data | Load week, day, worker, provider, and assignment views |
| Request actions | Create, approve, decline, cancel, and complete leave/swap/coverage requests |
| Rule validation | Check provider pairing, duplicate assignment, staffing impact, and request eligibility |
| Audit logging | Record who changed what, when, and why |
| Auth/session | Resolve current user, role, and permissions |

Demo data should remain useful for local development only. Production-like flows should not silently fall back to demo data when the database fails.

## Data Direction

The existing Prisma model is a good base. The next architecture layer should clarify request and audit behavior.

The current workbook implies four first-class product domains:

- `Schedule`: dates, workers, providers, time/hours, assignments.
- `Coverage`: staffing goals, minimums, totals, under/overstaffed states.
- `Requests`: leave, swaps, approvals, blocks, completions.
- `Operations`: daily assignments, updates, notes, and reference information.

Scheduling source of truth:

- `ProviderSchedule` defines which providers are scheduled on each date.
- `Assignment` defines which worker is assigned on each date and optionally to which provider.
- Staffing balance is derived from provider schedules and assignments.

Request source of truth:

- Existing `SwapPost` and `SwapProposal` can support swap flows.
- Leave and coverage requests should be modeled explicitly when the product moves beyond pure swaps.
- Request statuses should be operational: `pending`, `approved`, `declined`, `blocked`, `completed`, `cancelled`.

Audit source of truth:

- Add audit events before real operational use.
- Audit records should cover schedule edits, request decisions, swap completions, and rule changes.
- Audit records should preserve actor, action, target, timestamp, and readable summary.

## Validation Direction

Validation must be server-side and explainable.

Hard-block these cases:

- Worker already has an assignment on the target date.
- Swap would leave either side with a duplicate assignment.
- Provider-to-worker pairing rule would be violated.
- Request references a missing, past, cancelled, or already completed assignment.
- User attempts an action outside their role or ownership.

Warnings can exist later, but the first reliable version should favor simple hard blocks with clear language.

Examples:

- `Blocked: Ava already works on Tue, Apr 28.`
- `Blocked: Dr. Chen requires Noah Kim on Tuesdays.`
- `Blocked: this request has already been completed.`

## Feel And Visual Direction

The app should feel:

- Calm
- Dense
- Operational
- Trustworthy
- Plainspoken
- Fast to scan

It should not feel:

- Decorative
- Demo-like
- Marketing-oriented
- Overly rounded and soft
- Like a collection of feature cards
- Like a generic SaaS dashboard

Visual decisions:

- Use tables, grids, rows, and queues as primary structures.
- Keep cards for repeated request items or focused detail panels only.
- Prefer flat surfaces and subtle borders over heavy shadows and gradients.
- Use color mainly for status and exceptions.
- Keep controls compact and predictable.
- Make important operational states visible without requiring hover.
- Avoid product-facing references to `demo`, `MVP`, `prototype`, `next step`, or implementation status.

## Language Direction

Use workplace language.

Preferred labels:

- `Week`
- `Requests`
- `My Schedule`
- `Rules`
- `Needs coverage`
- `Pending approval`
- `Blocked`
- `Approved`
- `Declined`
- `Completed`
- `Understaffed`
- `Overstaffed`
- `Balanced`
- `Pairing conflict`

Avoid labels:

- `Demo mode`
- `MVP`
- `Next step`
- `Skeleton`
- `Prototype`
- `Hard-block behavior`
- `Propose swap (demo)`

## Implementation Guardrails

Before adding new screens, ask whether the work belongs in one of the operational areas above.

Before adding new UI polish, ask whether it improves scanability, trust, or action clarity.

Before adding new request behavior, ensure:

- The current user is known.
- The server validates the action.
- The resulting status is persisted.
- The action is auditable.
- The UI has a clear success, blocked, and loading state.

Before shipping a surface, remove prototype copy and verify that the screen answers a real scheduling question.

## Near-Term Direction

The next implementation slice should be:

1. Replace the default schedule summary-card view with a weekly operations board.
2. Add operational day headers with counts, balance, and exception markers.
3. Show worker rows and day cells with provider assignment or unassigned status.
4. Create a request/action queue area for pending swaps and blocked items.
5. Remove demo/prototype language from the affected surface.

This slice should make the app immediately feel closer to an internal scheduling platform, even before every backend workflow is fully mature.
