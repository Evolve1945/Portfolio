**Standard:** WCAG 2.1 AA
**Date:** 2026-05-24
**Scope:** `dashboard/index.html` (single-page application, ~9 000 lines, 29 views)
**Method:** Static code analysis — CSS tokens, HTML structure, ARIA attributes, JS interaction patterns

---

## Summary

**Total issues:** 17
**[CRITICAL]:** 2
**[MAJOR]:** 7
**[MINOR]:** 8

**Already correct (strengths):** Focus rings restored via `:focus-visible`, `.sr-only` class present, `aria-hidden="true"` on all decorative SVGs, modal has `role="dialog" aria-modal="true" aria-labelledby`, focus trap implemented for modal, Escape closes modal, focus returns to trigger on modal close, `<nav>` and `<header>` landmarks used, `type="button"` on all nav items, mobile responsive breakpoints with 40px minimum touch targets.

---

## Findings

### Perceivable

| # | Issue | WCAG Criterion | Severity | Location |
|---|-------|---------------|----------|----------|
| P1 | Toast notifications have no `aria-live` region. `#toast-area` is a static `<div>`. Screen readers never announce success, error, or warning toasts. | 1.3.1 / 4.1.3 Status Messages | [CRITICAL] | line 3454, `toast()` fn ~line 9221 |
| P2 | Activity live feed (`#activity-live-card`) appends real-time rows via `_appendLiveEvent()` but the container has no `aria-live` attribute. Dynamic updates are invisible to AT. | 1.3.1 / 4.1.3 | [CRITICAL] | line 2383, `_appendLiveEvent()` fn |
| P3 | Status indicator dots (`ws-dot`, `health-dot`, `event-dot`) convey state using color only (green / amber / red). No text alternative or visually hidden label alongside the dot. | 1.4.1 Use of Color | [MINOR] | lines 138–148, 180–183, 337–343 |
| P4 | `<canvas>` sparkline charts (Chart.js) have no `role="img"`, `aria-label`, or `<title>` element. Screen readers announce them as unlabelled interactive regions. | 1.1.1 Non-text Content | [MINOR] | `#spark canvas`, analytics chart canvases |

### Operable

| # | Issue | WCAG Criterion | Severity | Location |
|---|-------|---------------|----------|----------|
| O1 | Task detail drawer has no Escape key handler. Pipeline drawer (line 8933) and vault-file drawer (line 9213) both have Escape listeners; the task drawer does not. Keyboard users cannot dismiss it. | 2.1.1 Keyboard | [MAJOR] | `openTaskDrawer()` / `closeTaskDrawer()` ~line 3549 |
| O2 | All three drawers (task, pipeline, vault-file) have no focus trap. When a drawer opens, Tab traverses the underlying page content. The modal's `_trapFocus` pattern is not reused for drawers. | 2.1.2 No Keyboard Trap | [MAJOR] | lines 3458, 3465, 3474 |
| O3 | `openTaskDrawer()` does not move focus into the drawer on open. Users relying on keyboard or AT must manually navigate to find drawer content. The modal correctly calls `first.focus()` inside `requestAnimationFrame`; drawers do not. | 2.4.3 Focus Order | [MAJOR] | `openTaskDrawer()` ~line 3564 |
| O4 | KPI widget grid supports drag-and-drop reordering (`cursor:grab`, drag events) with no keyboard equivalent. Reordering is pointer-only. | 2.5.1 Pointer Gestures | [MINOR] | `.kpi-card` drag logic ~line 3680 |
| O5 | `#active-project-select` (header project switcher) uses `title="Active project"` with no `<label>` element. `title` attribute labelling is unreliable across AT. | 2.4.6 Headings and Labels | [MINOR] | line 1386 |

### Understandable

| # | Issue | WCAG Criterion | Severity | Location |
|---|-------|---------------|----------|----------|
| U1 | Multiple major input areas use `placeholder` as their only label. Placeholder text disappears when typing and is not consistently announced by AT as a label: NL Query textarea (`#nl-input`), Vault Chat textarea (`#vc-input`), Code Runner textarea (`#code-input`), Similar-note search (`#similar-note-input`), Memory search (unlabelled), TikTok URLs textarea (`#tt-urls`). | 3.3.2 Labels or Instructions | [MAJOR] | lines 2140, 2227, 2295, 2026, 1994, 2595 |
| U2 | Several `<select>` elements have no associated `<label>`: log level filter (line 1865), refresh interval (line 1908), activity level filter (line 2350), activity agent filter (line 2357), correction filter (line 2409). Nearby visible text exists but is not programmatically connected. | 3.3.2 Labels or Instructions | [MAJOR] | lines 1865, 1908, 2350, 2357, 2409 |
| U3 | Modal form labels (e.g. "Title", "Project", "Agent") are `<label>` elements but lack `for` attributes matching their inputs. Proximity alone does not create a programmatic association; AT does not announce the label when the input receives focus. | 3.3.2 Labels or Instructions | [MAJOR] | lines 6029–6170 (all modal form templates) |
| U4 | Form validation errors surface only via toast. The field in error is not marked (`aria-invalid="true"`) and no inline error message is placed near the field. AT users receive no indication of which field to fix. | 3.3.1 Error Identification | [MAJOR] | `submitNewTask()`, `submitNewCorrection()` etc. |
| U5 | `#modal-title` is a `<div>`, not a heading element. While `aria-labelledby` correctly references it, using `<h2>` would provide heading navigation within the dialog (NVDA, VoiceOver heading browse mode). | 3.1.1 / best practice | [MINOR] | line 3442 |

### Robust

| # | Issue | WCAG Criterion | Severity | Location |
|---|-------|---------------|----------|----------|
| R1 | Task drawer uses a static `aria-label="Task detail"` string. Once dynamic task data is rendered, the label stays "Task detail" and never updates to the actual task name. `aria-labelledby` pointing to the rendered `#task-drawer-head` title element would announce the task name. | 4.1.2 Name, Role, Value | [MINOR] | line 3458 |
| R2 | `<div class="nav-section">` elements (SYSTEM, TOOLS, etc.) group navigation items visually but carry no ARIA semantics. There is no `role="group"` with `aria-label` on the enclosing nav region, nor `aria-labelledby` on the section header. | 4.1.2 Name, Role, Value | [MINOR] | lines 1060, 1127, etc. |
| R3 | `#task-backdrop` and `#pipe-backdrop` are bare `<div>` elements used as click targets for closing drawers. They have no `role`, `aria-label`, or `aria-hidden="true"`. Screen readers may announce them as unlabelled focusable areas. | 4.1.2 Name, Role, Value | [MINOR] | lines 3457, 3464 |

---

## Color Contrast Check

Tokens measured against the effective rendered background (glass layers composited over `#04000c`).

| Element | Foreground | Background (effective) | Approx ratio | Required | Pass? |
|---------|-----------|----------------------|-------------|----------|-------|
| Body text (`--tx`) | #f5f0ff | ~#11042f (glass) | >15:1 | 4.5:1 | [OK] |
| Secondary text (`--tx2`) | #c4b5d4 | ~#11042f | ~11:1 | 4.5:1 | [OK] |
| Muted text (`--tx3`, 10–11px) | #8b7aa0 | ~#11042f | ~5.1:1 | 4.5:1 | [OK] — marginal |
| Accent (`--acc`) | #bf7fff | ~#11042f | ~10.5:1 | 4.5:1 | [OK] |
| Green badge text | #34d399 | rgba(52,211,153,.15) on glass | ~9.8:1 | 4.5:1 | [OK] |
| Amber badge text | #fbbf24 | rgba(251,191,36,.15) on glass | ~11.5:1 | 4.5:1 | [OK] |
| Red badge text | #f87171 | rgba(248,113,113,.15) on glass | ~7.0:1 | 4.5:1 | [OK] |
| Gray badge text (`--tx3`) | #8b7aa0 | rgba(139,122,160,.15) on glass | ~5.0:1 | 4.5:1 | [OK] — marginal |
| Nav-section label (10px, not bold) | #8b7aa0 | sidebar ~#11031f | ~5.2:1 | 4.5:1 | [OK] — marginal |
| ni-badge (small pill) | #ffffff | #6d28d9 | ~10.6:1 | 4.5:1 | [OK] |

Note: contrast values are approximations from CSS token analysis. Precise values require browser rendering. Marginal entries should be verified with a browser contrast checker (e.g. DevTools accessibility panel).

---

## Keyboard Navigation

| Element | Tab reachable | Enter / Space | Escape | Focus visible |
|---------|--------------|--------------|--------|---------------|
| Sidebar nav items (`<button>`) | [OK] | [OK] activates view | -- | [OK] `:focus-visible` ring |
| Modal (overlay + close btn) | [OK] | [OK] | [OK] closes | [OK] |
| Modal form fields | [OK] | n/a | [OK] closes modal | [OK] |
| Task detail drawer | [OK] | n/a | [!!] NO Escape handler | [OK] ring if tabbed to |
| Pipeline drawer | [OK] | n/a | [OK] | [OK] |
| Vault-file drawer | [OK] | n/a | [OK] | [OK] |
| Approval gate buttons | [OK] | [OK] | -- | [OK] |
| KPI widget drag-to-reorder | [x] keyboard only sees `cursor:grab` | [x] | -- | n/a |
| Toast notifications | [x] not focusable | -- | -- | [x] not announced |

---

## Screen Reader Announced As

| Element | Announced As | Issue |
|---------|-------------|-------|
| `#toast-area` notifications | Nothing | No `aria-live`; all toasts silent to AT |
| `#activity-live-card` rows | Nothing | No `aria-live`; live events not announced |
| `#nl-input` (NL Query textarea) | "text area" (no label) | Placeholder not announced as label |
| `#vc-input` (Vault Chat textarea) | "text area" (no label) | Same |
| `#code-input` textarea | "text area" (no label) | Same |
| Log level `<select>` | "combo box" (no label) | No associated label |
| Modal input "Title" | "edit text" (no label) | `<label>` present but no `for` attribute |
| `<canvas>` sparklines | Unlabelled interactive element | No `aria-label` or `role="img"` |
| Task drawer (closed) | "Task detail dialog" (static) | Task name never reflected in label |
| `#task-backdrop` | Unlabelled or announced as blank | Should be `aria-hidden="true"` |
| Nav section divs | Nothing | Not grouped; items not announced as belonging to a group |

---

## Priority Fixes

### P0 — Fix immediately (silent failures for AT users)

1. **Add `aria-live="polite"` to `#toast-area`** and `role="status"` — one attribute, all toast announcements unlocked
 ```html
 <div id="toast-area" role="status" aria-live="polite" aria-atomic="false"></div>
 ```

2. **Add `aria-live="polite"` to `#activity-live-card` body** — one attribute, live feed announces to AT
 ```html
 <div id="activity-live-body" aria-live="polite" aria-atomic="false" ...>
 ```

### P1 — Fix soon (keyboard-only users blocked)

3. **Add Escape handler for task drawer** — copy the existing pattern from pipeline drawer:
 ```javascript
 document.addEventListener('keydown', e => {
 if (e.key === 'Escape' && document.getElementById('task-drawer').classList.contains('open'))
 closeTaskDrawer();
 });
 ```

4. **Move focus into each drawer on open** — add to `openTaskDrawer()`, `openPipelineDrawer()`, `openVaultFileDrawer()`:
 ```javascript
 requestAnimationFrame(() => {
 const first = document.querySelector('#task-drawer ' + _FOCUSABLE);
 if (first) first.focus();
 });
 ```

5. **Add focus trap to all three drawers** — extract `_trapFocus` into a generic helper that accepts a container selector; call it from each drawer's open function.

6. **Add `for` attributes to all modal form labels** — match existing input `id`s:
 ```html
 <label class="form-label" for="m-title">Title</label>
 ```
 Apply to all 12+ label/input pairs in modal templates.

### P2 — Fix this week (label gaps)

7. **Add `<label>` elements to major textareas** — use `.sr-only` if visual label is not desired:
 ```html
 <label class="sr-only" for="nl-input">Natural language query</label>
 <textarea id="nl-input" ...>
 ```
 Apply to: `#nl-input`, `#vc-input`, `#code-input`, `#similar-note-input`, `#tt-urls`.

8. **Label all unlabelled `<select>` elements** — add `.sr-only` labels for the five filter selects (log level, refresh interval, activity level, activity agent, correction filter).

9. **Label `#active-project-select` properly** — replace `title` with a `.sr-only` `<label>`:
 ```html
 <label class="sr-only" for="active-project-select">Active project</label>
 <select id="active-project-select" ...>
 ```

### P3 — Nice to have

10. **Add `aria-invalid` and inline error text on validation failure** in `submitNewTask()` and other submit handlers.

11. **Change `#modal-title` from `<div>` to `<h2>`** — no style impact (styles use `#modal-title` ID), semantic improvement.

12. **Add `aria-hidden="true"` to backdrop `<div>` elements** (`#task-backdrop`, `#pipe-backdrop`, `#vault-file-backdrop`) — prevents AT from announcing blank interactive regions.

13. **Add `aria-label` or `role="img"` + `aria-label` to all `<canvas>` sparklines** — describe what the chart shows.

14. **Add status text alongside color-only dots** (`.ws-dot`, `.event-dot`) — use `.sr-only` span with the status text:
 ```html
 <span class="ws-dot connected"></span>
 <span class="sr-only">WebSocket connected</span>
 ```

15. **Change `aria-label="Task detail"` on `#task-drawer` to `aria-labelledby`** pointing to the rendered title element in `#task-drawer-head`.

---

## Implementation notes

- Focus trap and Escape patterns already exist and work correctly for the modal. The drawer fixes (items 3–5) should reuse those exact patterns — do not invent new ones.
- The `.sr-only` class is already defined in the CSS. Adding hidden labels requires zero CSS changes.
- `aria-live` regions must exist in the DOM before content is injected. `#toast-area` and `#activity-live-card` are already in the static HTML, so adding `aria-live` to their opening tags is a one-line change per element.
- WCAG 2.1 AA compliance is achievable with the P0 and P1 fixes alone. P2 and P3 bring the dashboard to a higher standard but are not blocking.
