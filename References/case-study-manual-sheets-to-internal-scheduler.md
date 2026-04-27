# Case Study: From Manual Sheets to an Internal Scheduler

## Context

Next Level Scheduler began as a functional scheduling prototype for staff coverage, provider-to-worker pairings, and swap requests. The underlying need is not simply "show a calendar." The real problem is operational: scheduling currently depends on manual Google Sheets, scattered interpretation, and staff back-and-forth when the schedule is unclear or someone needs coverage.

The prototype proves that the core data can be modeled, but its delivery still feels too generic and too demo-like for the work it needs to support. The revamp should turn the app into an internal scheduling platform that helps staff coordinate the schedule and helps workers understand and manage their own coverage needs.

Current-system reference: confidential local workbook, summarized in `References/current-system-2026-templates-review.md`.

## The Manual Workflow Problem

The current manual process creates friction in several ways:

- Schedules are visible, but not always clear. A spreadsheet can show names and dates, but it does not naturally explain coverage status, staffing balance, provider pairings, or pending swap activity.
- Employees can complain that the data is hard to understand because the sheet is optimized for storage, not decision-making.
- Managers have to interpret the sheet, answer repeated questions, and coordinate coverage through conversations outside the schedule itself.
- Swap requests do not live beside the schedule, which makes it harder to see who needs coverage, who offered help, and whether a swap would create a conflict.
- Provider-to-worker constraints are easy to miss because the spreadsheet does not actively surface pairing violations or block unsafe changes.
- Schedule ownership is unclear. Workers may not know what is theirs to act on, while staff may not know which issues need immediate intervention.

The result is not just inefficient administration. It erodes confidence. If workers cannot easily understand the schedule, they ask more questions, managers do more translation, and the schedule becomes a source of confusion instead of coordination.

## Product Opportunity

The app should replace spreadsheet interpretation with operational clarity.

The strongest opportunity is to make the schedule answer practical daily questions:

- Who is scheduled this week?
- Which days are short or overstaffed?
- Which provider pairings are broken?
- Who needs coverage?
- Which swap requests are pending?
- Which requests are safe to approve?
- What changed recently?

The product should not only display scheduling data. It should make staffing issues visible, actionable, and auditable.

## Current Prototype Critique

The current app has the right functional ingredients:

- Week, month, roster, and matrix schedule views
- Staffing balance indicators
- Swap board and swap proposal flow
- My Swaps inbox
- Admin balance and provider-to-worker rule screens
- Prisma-backed scheduling models with demo fallback

But its delivery misses the operational center of gravity:

- The default schedule view is too summarized. Counts are useful, but the actual staffing reality sits behind clicks.
- The UI reads like a polished SaaS prototype instead of an internal operations tool. Cards, pills, gradients, and demo labels make it feel softer and less decisive than the workflow requires.
- The app is organized around implemented features rather than user questions. "Schedule," "Swap Board," and "Admin" are valid modules, but they do not immediately surface what needs attention.
- Prototype language breaks trust. Terms like "demo," "MVP," and "next step" should not appear in the product experience once the app is being shaped for real use.
- Staff and worker modes are not distinct enough. Managers need an exception-resolution workspace; workers need a simple self-service path.
- Swap actions still feel informational rather than operational. The experience should clearly show the target shift, coverage risk, safe options, and approval state.

This is why the app can be functionally correct while still feeling off. It models the workflow, but it does not yet feel like the workplace tool that resolves the workflow.

## Target Outcome

The revamped app should feel like a clear internal scheduling platform.

For staff and managers, it should become an operations board:

- See schedule coverage by week at a glance.
- Identify understaffed days, overstaffed days, and provider pairing conflicts.
- Review leave and swap activity as an action queue.
- Approve or block requests based on visible rules.
- Track changes with enough audit history to trust the system.

For workers, it should become a self-service schedule tool:

- View my schedule without reading a spreadsheet.
- Request leave or coverage from the relevant shift.
- Offer or accept swaps with clear status.
- Understand why a request is blocked or pending.

The strategic shift is simple: move from "a dashboard of scheduling features" to "a tool that makes schedule coordination obvious."

## Success Signals

The revamp is working when:

- Employees can understand their schedule without asking someone to interpret it.
- Staff can identify schedule issues without manually scanning a sheet.
- Coverage and swap requests are visible beside the schedule they affect.
- Provider-to-worker pairing rules are surfaced as operational constraints, not hidden business logic.
- The UI language sounds like the business process, not the development process.
- Managers spend less time explaining the schedule and more time resolving only the exceptions that need judgment.
