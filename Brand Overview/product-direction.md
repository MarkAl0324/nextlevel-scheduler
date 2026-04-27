# Product Direction

Canonical implementation direction: `Development/architecture-feel-direction.md`.

## Product Identity

Next Level Scheduler is an internal scheduling platform.

It exists to replace unclear manual scheduling workflows with a shared operational view for staff and workers. The app should help the team understand the schedule, coordinate coverage, and resolve staffing issues without relying on manual Google Sheet interpretation.

This is not a public SaaS product, a generic dashboard, or a decorative calendar. It is a work tool for repeated daily use.

## Primary Users

### Staff / Managers

Staff and managers coordinate scheduling operations.

They need:

- A clear weekly view of staffing coverage.
- Fast visibility into undercoverage, overcoverage, and provider pairing conflicts.
- A queue of leave, coverage, and swap requests that need action.
- Tools to approve, decline, block, or resolve requests.
- Confidence that schedule changes are auditable.

### Workers

Workers need simple self-service.

They need:

- A clear view of their own schedule.
- A simple way to request leave or coverage.
- A safe way to offer or propose swaps.
- Clear request statuses.
- Plain explanations when a request cannot be approved.

## Product Personality

The product should feel:

- Clear
- Operational
- Trustworthy
- Staff-friendly
- Calm
- Direct
- Practical

The product should not feel:

- Demo-like
- Generic
- Decorative
- Marketing-oriented
- Overly soft
- Overly technical
- Like a spreadsheet with a nicer skin

## Design Principles

### Dense But Readable

Schedules contain many people, days, statuses, and exceptions. The interface should support scanning and repeated use. Use compact rows, tables, and calendars where they help people compare information quickly.

### Exception First

The app should make problems visible:

- Needs coverage
- Understaffed
- Overstaffed
- Pairing conflict
- Pending approval
- Blocked request

Normal states should be calm. Exceptions should stand out.

### Low Friction

Workers should not need to understand the full scheduling model to request coverage or propose a swap. Staff should not need to hunt across pages to resolve schedule issues.

### Plain Language

Use workplace language instead of product-development language. The interface should explain what is happening and what action is needed.

### Trust Before Polish

Visual polish should support confidence, not distract from the work. Prefer clear hierarchy, stable layouts, consistent status labels, and restrained styling.

## Language Rules

Avoid product-facing words like:

- Demo
- MVP
- Next step
- Later
- Placeholder
- Skeleton
- Prototype

Use operational words like:

- Needs coverage
- Pending approval
- Approved
- Declined
- Blocked
- Completed
- Understaffed
- Overstaffed
- Balanced
- Pairing conflict
- Requires review

Examples:

| Instead of | Use |
| --- | --- |
| Demo mode | Internal scheduling |
| Proposal created (demo) | Request submitted |
| Next: apply swap | Pending schedule update |
| Hard-block behavior | Blocking rule |
| Provider pairing later | Provider pairing conflict |
| View roster | Open day |

## Visual Direction

The revamped interface should use:

- Strong table and calendar structure
- Compact operational rows
- Clear status labels
- Muted backgrounds
- Minimal shadows
- Limited gradients
- Consistent spacing
- Practical action buttons

Use cards only when they frame a distinct repeated item, such as a request in a queue. Avoid turning every section into a floating card.

## Core Product Promise

The app should make it obvious who is scheduled, who needs coverage, what is blocked, and what needs approval.

If a screen does not answer one of those questions, it should be reconsidered.
