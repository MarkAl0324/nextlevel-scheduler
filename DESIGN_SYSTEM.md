# Design System — MA Scheduler
# Source: https://www.nextlevelurgentcare.com/
# Created: 2026-04-05
# Note: Values adapted from reference site to fit an internal scheduling tool.
# Values marked * were estimated or adapted, not extracted exactly.

---

## Tone
Clinical but approachable — clean and trustworthy like a medical environment, without being cold or intimidating. Prioritizes clarity and quick scanning over decoration.

---

## Color Palette

| Role | Name | Hex | Notes |
|------|------|-----|-------|
| Primary | Teal | `#066880` | Main brand color — buttons, links, active states |
| Primary Dark | Deep Teal | `#005A9A` | Hover states, focus rings |
| Secondary | Slate Gray | `#4E545B` | Secondary text, inactive nav items |
| Background | Warm White | `#FFFEF9` | Page background — warmer than pure white, less clinical |
| Surface | White | `#FFFFFF` | Cards, panels, modals, inputs |
| Border | Light Gray | `#CCCACB` | Card borders, input borders, dividers |
| Text Primary | Near Black | `#1A1618` | Headings, body copy |
| Text Muted | Medium Gray | `#7A7A7A` | Labels, captions, placeholders |
| Success | Green | `#61CE70` | Staffing balanced / good status |
| Warning | Amber | `#F59E0B` | Overstaffed or minor imbalance |
| Danger | Red | `#EF4444` | Too few MAs / critical understaffing |
| Info | Blue | `#3B82F6` | Informational states, swap requests |

### Staffing Status Color Map
These directly replace the color coding in the existing Google Sheet:
| Status | Color | Hex |
|--------|-------|-----|
| Good (balanced) | Green | `#61CE70` |
| Too few MAs | Red | `#EF4444` |
| Overstaffed MAs | Blue | `#3B82F6` |
| Too many providers | Amber | `#F59E0B` |
| Too few providers | Orange | `#F97316` |

---

## Typography

**Font:** Inter (default Next.js built-in — clean, readable, professional)
Secondary display font not needed for an internal tool at this scale.

| Level | Size (Tailwind) | Weight | Usage |
|-------|----------------|--------|-------|
| H1 | `text-3xl` (30px) | `font-bold` | Page titles |
| H2 | `text-2xl` (24px) | `font-semibold` | Section headings |
| H3 | `text-lg` (18px) | `font-semibold` | Card titles, table section labels |
| Body | `text-base` (16px) | `font-normal` | Descriptions, paragraphs |
| Small | `text-sm` (14px) | `font-normal` | Labels, metadata, table cell content |
| Micro | `text-xs` (12px) | `font-medium` | Badges, status tags, timestamps |

---

## Spacing & Shape

- **Base unit:** 4px (Tailwind default — use multiples: 4, 8, 12, 16, 24, 32, 48)
- **Border radius:**
  - Cards / panels: `rounded-2xl` (24px) — matches reference site
  - Buttons: `rounded-2xl` (16px)
  - Inputs: `rounded-lg` (8px)
  - Badges / status pills: `rounded-full`
- **Shadows:** `shadow-sm` on cards — subtle depth without heaviness
- **Section spacing:** `gap-10` (40px) between major sections
- **Card padding:** `p-8` (32px)

---

## Component Map

| UI Pattern | shadcn Component | Notes |
|------------|-----------------|-------|
| Monthly schedule grid | `Table` | Custom cells with status color coding |
| MA/Provider assignment cell | Custom cell in Table | Shows MA name + provider badge |
| Staffing status indicator | `Badge` | Color-coded per status map above |
| Swap request list | `Card` + `Badge` | One card per request, status badge |
| Passcode login form | `Card` + `Input` + `Button` | Centered on page, no sidebar |
| Admin schedule builder | `Table` (editable) + `Select` | Dropdown to assign provider per cell |
| MA list / Provider list | `Table` | Simple name management |
| Navigation | `Sidebar` (shadcn) | Left sidebar, icon + label per item |
| Empty states | Custom div + icon | "No schedule yet" / "No swap requests" |
| Toast notifications | `Sonner` | Swap accepted, schedule saved, etc. |
| Confirmation dialogs | `AlertDialog` | Before deleting entries |
| Dropdowns | `Select` | Provider assignment, month picker |

---

## Notes for Implementation
- The schedule grid is the most complex component — it's a large Table where each cell = one MA on one day, with a provider assigned
- Status colors should appear as a left border or background tint on each day's row header — not per cell (too noisy)
- Mobile: The schedule grid will not fit on small screens — show a simplified list view on mobile (MA's own schedule only)
- Keep the passcode page dead simple: centered card, one input, one button
