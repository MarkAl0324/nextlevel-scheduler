# Revamp Status

## Meta

| Field | Value |
| --- | --- |
| Last updated | 2026-04-25 |
| Revamp phase | Weekly operations board and operations-language alignment implemented; ready for product/UX review |
| Source of truth relationship | Supplements `PROJECT_WEB_DEV_STATE.md`; does not replace it |
| Product direction | Internal scheduling platform for staff and workers |

## Current Product State

The app currently functions as an internal scheduling prototype with week, month, roster, matrix, requests, my requests, staffing balance, and provider-to-worker rule surfaces. The core workflow is recognizable, and the default `/schedule` surface now starts to behave like an operations board. Some underlying code and fallback data still use prototype-era names, but product-facing navigation and copy are being shifted toward real operational language.

Current strengths:

- Core scheduling concepts are represented in the UI.
- Prisma models exist for users, employees, providers, assignments, swap posts, swap proposals, and provider rules.
- The project already has a living state file in `PROJECT_WEB_DEV_STATE.md`.
- The app has enough surface area to support a serious UX and product revamp without starting over.

Current weaknesses:

- The default experience does not immediately show the real staffing picture.
- Some deeper flows still use temporary client-side behavior behind operational labels.
- Staff and worker modes are not clearly separated.
- Swap flows still rely heavily on demo behavior and client-side state.
- Admin screens feel like feature pages instead of an exception-resolution workspace.

## Completed Revamp Work

- [x] Identified the core delivery issue: the app is functionally correct but does not yet feel like an internal operations tool.
- [x] Defined the main product narrative: replace manual Google Sheets and unclear schedule presentation with a streamlined internal scheduling platform.
- [x] Established the two primary user groups: staff/managers and workers.
- [x] Created this focused revamp status file for ongoing development reference.
- [x] Finalized revamp architecture, feel, and direction in `Development/architecture-feel-direction.md`.
- [x] Reviewed the confidential current spreadsheet system and recorded non-sensitive takeaways in `References/current-system-2026-templates-review.md`.
- [x] Added weekly operations board UI/UX spec in `Development/weekly-operations-board-ux-spec.md`.
- [x] Replaced the default schedule summary-card surface with a weekly operations board.
- [x] Added board-shaped schedule data with days, workers, assignment cells, and action queue items.
- [x] Reframed visible navigation around `Week`, `Requests`, `My Requests`, and `Admin`.
- [x] Added `/requests` as the user-facing request path while keeping the previous route available for compatibility.
- [x] Removed product-facing prototype/demo/MVP wording from the core schedule, request, my-request, admin, balance, and pairing-rule screens.

## Active Work

- [ ] **CURRENT:** Product-review the weekly operations board and request surfaces for scanability, operational clarity, and staff/worker separation before adding real mutations.

## Next Actions

- [x] Replace the schedule summary-card view with worker rows, day columns, assignment cells, and operational day headers.
- [x] Add an action queue for pending requests, blocked swaps, and coverage issues.
- [x] Define staff and worker navigation modes from the finalized product architecture.
- [x] Remove prototype language from product-facing UI.
- [ ] Redesign swap and leave flows around request status, coverage impact, and approval safety.
- [ ] Move real swap actions to server-side mutations backed by the database.
- [ ] Add auth and role gating for staff/manager versus worker experiences.
- [ ] Add audit history for schedule and swap changes.
- [ ] Add verification scenarios for staff operations and worker self-service paths.

## Blockers And Risks

- Auth is not yet active, so the app cannot reliably distinguish staff from workers.
- Temporary fallback behavior can hide database failures and confuse implementation status.
- The current UI may encourage more feature pages instead of a unified operational workflow.
- Test coverage is not yet established for critical scheduling and swap rules.
- Manual spreadsheet assumptions need to be translated into explicit product rules before real deployment.

## Decisions

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-04-25 | Revamp direction is an internal scheduling platform, not a generic SaaS dashboard. | The product must solve staffing clarity and coverage coordination, not simply display scheduling data. |
| 2026-04-25 | Primary users are staff/managers and workers. | These two modes reflect the operational split between schedule coordination and self-service schedule management. |
| 2026-04-25 | Keep `PROJECT_WEB_DEV_STATE.md` as the broad project source of truth. | The repo already uses that file; this status file should focus the revamp without fragmenting overall project state. |
| 2026-04-25 | The default signed-in experience should be a weekly operations board. | This best replaces manual spreadsheet scanning with immediate coverage, assignment, and exception visibility. |
| 2026-04-25 | Mutations and rule checks should move server-side before real use. | Schedule and request actions need persistent state, role checks, transactions, and clear blocking reasons. |
| 2026-04-25 | The current spreadsheet confirms four product domains: Schedule, Coverage, Requests, and Operations. | The workbook mixes these concerns manually; the app should make them explicit and structured. |
| 2026-04-25 | UI/UX architecture must happen before major feature expansion. | The initial problem was correct function with wrong delivery, so each slice needs product-feel acceptance criteria. |

## Verification Status

The first board-shaped UI slice is implemented and needs visual/product review in browser.

Required review checks:

- [x] Documentation review: case study, product direction, strategic plan, status file, and architecture direction agree.
- [ ] Product review: `/schedule` answers the weekly staffing questions without requiring day-by-day drilldown.
- [ ] UX review: board density, status hierarchy, action queue, request labels, and mobile scroll behavior are acceptable.
- [ ] Implementation readiness review: next request/auth slices can build on the board data model without new product decisions.
