**Date:** 2026-05-24
**Scope:** `dashboard/index.html` (~9 000 lines, 29 views)
**Method:** Static CSS/HTML analysis — design tokens, component patterns, layout structures, responsive breakpoints

**Overall score: 6.2 / 10**

The visual execution is polished for a single-developer internal tool. The dark purple glassmorphism theme is coherent and the icon work is consistent. The primary deficits are structural: 27+ undifferentiated nav items, two competing card-header patterns, a phantom CSS token (`--border`) referenced ~35 times but never defined, and a heavy inline-style tax that fragments maintainability and produces visual drift between newer and older views.

---

## 1. Visual Hierarchy — 5/10

[-] The Command Center view stacks 7–8 content blocks with identical visual weight: KPI grid, Orchestrator status, Briefing, Approval Gates, Token Caps, Top Agents + Live Events, System Health, Task Timeline. Nothing says "look here first." There is no primary focal point.

[-] KPI values (`.kpi-val`: 28px bold) and card titles (`.card-title`: 13px 600) have size separation but the weight contrast is insufficient to create a clear reading tier. Section headers (`#page-title`: 15px 600) sit between the two, further flattening the scale.

[-] The Approval Gates card (`#gates-card`) is the most action-critical content on the dashboard. It is hidden by `display:none` and only appears when items are pending. When it appears, it is not visually elevated above the Orchestrator status card above it. Action-critical zones should have consistent spatial position, not appear inline wherever they fit.

[+] The `.ni.active::before` left-bar indicator (line 116) — a 3px glowing bar — is a clean, unambiguous position signal.

[+] Semantic color use on badges and dots is consistent throughout: green=ok, amber=pending/warn, red=error.

---

## 2. Information Density — 5/10

[-] The Command Center is over-loaded. At 1440px, a user sees a 4-column KPI grid, a timeline, a 2-column agent/event row, a health card, and a token caps grid before scrolling. That is 50+ data points with no hierarchy or progressive disclosure.

[-] No concept of "above the fold = summary, below = detail." Every data category is rendered at equal depth on first paint.

[-] Views for Memory, Corrections, and Code stack multiple cards below the primary interaction with no visual separation — just repeated `margin-top:14px`. No section dividers, no breathing room, no resting points for the eye.

[+] `max-height` constraints on scrollable bodies (event feed: 220px, API response: 300px) correctly prevent runaway overflow.

[+] The `.empty` pattern (line 711) is consistent across all 29 views and correctly prevents blank confusion zones.

---

## 3. Navigation & Information Architecture — 4/10

[!!] 27 distinct navigable views in the sidebar. At `7px vertical padding + 12.5px font-size` each, 27 items span ~580px of scroll height — scrolling required on any display shorter than 1200px.

[-] Group distribution is wrong. Sections: Home (1 item), Monitor (4), Intelligence (16), System (8). "Intelligence" contains 16 items including Analytics, NL Query, Vault Chat, Code Runner, Activity Log, Corrections, Trust Monitor, Eval Quality, Benchmarks, Errors, Prompts, Capabilities, Converter, Plugins, Memory, and TikToks. The label does not map to what a user expects when looking for "Errors" or "Plugins."

[-] TikToks lives under Intelligence between Memory and the System section. It is a domain-specific ingest tool with no conceptual relationship to the items around it.

[-] The "All logs" button in the Command Center event feed card (`onclick="switchView('logs')"`) implies a destination called "Logs" but navigates to `view-activity`. The nav item for that view is labeled "Activity Log." The mismatch creates a broken mental model.

[-] Settings (`data-view="config"`) has no nav item. It is unreachable via the sidebar. The only access path is programmatic or a direct button not visible in the nav.

[+] All 27 icons are purpose-drawn 16×16 SVGs with consistent 1.3–1.5px strokes and accurate metaphors. No raster images, no icon fonts, no copy-paste inconsistency.

---

## 4. Consistency — 4/10

[!!] Two competing card header patterns coexist:

- **Pattern A:** `.card-hdr` (CSS-defined, line 207) — used in ~60% of cards. Provides `card-icon` (28px rounded square), `card-title`, `card-action` slot. Correct padding: 14px top.
- **Pattern B:** `.card-header` (not defined in `:root` CSS) — used in ~40% of cards across evalquality, benchmarks, errors, prompts, trust, memory, capabilities, and credential views. These carry inline `style="padding:10px 14px;border-bottom:1px solid var(--border);..."`. No icon slot. Flat appearance.

These produce subtly different header rows. Pattern B uses `--border` (an undefined token) and omits the icon slot.

[!!] `--border` is referenced ~35 times in CSS classes and ~40 times in JS-generated HTML strings but is **never defined in `:root`**. `--bd` is the defined border token. This means `.gate-item`, `.gate-footer`, `.gate-snooze-btn`, the mobile nav bar, and all dynamically generated list rows render with a transparent/fallback border. Visually: gate items lose their left border, the mobile nav has no background, all JS-generated separator rows are invisible.

[-] `#4ade80` (lime-green) appears 15+ locations as a hardcoded override alongside `--green: #34d399` (teal-green). At large sizes (22px stat values) the two greens are visibly different in hue temperature. These come from newer views (Trust Monitor, Eval Quality, Benchmarks, Errors, Credentials) that were built without checking the token system.

[-] Button fragmentation: three legitimate classes (`.btn-primary`, `.btn-ghost`, `.btn-danger`) plus a fourth unofficial inline variant — `rgba(109,40,217,.7)` gradient buttons in NL Query, Vault Chat, Vault Refactor, TikTok ingest, and all "Save to Vault" buttons. The inline variant is visually similar to `.btn-primary` but has different border-radius in some contexts.

[-] The `.card-action` button (line 223) is a ghost text button at 11px. `.btn-ghost btn-sm` serves the same role but is styled differently. The choice between them appears arbitrary.

---

## 5. Feedback & State — 6/10

[+] Loading states handled uniformly via `.empty` with "Loading…" text across all 29 views.

[+] WebSocket status communicated via `#ws-dot` with `.connected` / `.connecting` classes and pulse animation.

[+] Active nav item: background change + glowing left-bar indicator.

[+] Hover states on all interactive elements: `.ni:hover`, `.kpi-card:hover`, `.agent-card:hover`, `.task-item:hover`.

[-] `.gate-approve-btn` and `.gate-reject-btn` have `:disabled` states (opacity .45) but no loading/pending state. A submitted approval shows no in-flight feedback.

[-] Header refresh button (`#hdr-refresh`, line 1401) has no loading state class. After click there is no feedback until data populates.

[-] Toast notifications auto-dismiss after 3 seconds with no countdown indicator. Users do not know if a toast was permanent or transient.

[-] The `.toggle` component in Settings has no `aria-checked` and no label text describing current state — only visual position.

---

## 6. Typography — 6/10

[+] Six-level type scale: 28px (KPI values), 15px (section titles), 13px (body), 12px (table), 11px (metadata), 10px (uppercase labels). Appropriate for a data-dense power-user dashboard.

[-] Several metadata elements use `font-size:9px`: `.time-cell` (line 500), `.tl-axis-tick span` (line 562), `.mesh-metric-key` (line 600). At 9px on HiDPI displays this is technically rendered but below any accessibility threshold and contributes to visual noise.

[-] `.kpi-label` (11px 500 uppercase 0.5px letter-spacing) and `.nav-section` (10px 600 uppercase 0.8px letter-spacing) are used for different hierarchy levels but are nearly indistinguishable in weight and size. They blur into a single visual tier.

[-] `font-variant-numeric:tabular-nums` is applied on `.kpi-val`, `.agent-stat-val`, `.mesh-metric-val` — this is correct and prevents jitter on live-updating numbers.

---

## 7. Spacing & Layout — 6/10

[+] Consistent `gap:12px` between major cards, `padding:14px 16px` inside card bodies.

[-] Four different vertical spacing values coexist without a token: 8px, 10px, 12px, 14px. `margin-bottom:12px` inline, `margin-top:14px` inline, `gap:10px` in grids, `gap:8px` in smaller grids. Solvable with a single `--gap-sm: 8px; --gap: 12px; --gap-lg: 16px` token set.

[-] `view-activity` log body uses `height:calc(100vh - 220px)` (line 2379). The 220px offset is hardcoded — breaks if header height changes or if content above the log card shifts.

[-] `span-2`, `span-3`, `span-4` column span classes are defined for the KPI grid but their application to specific cards is not systematic. On the 2-column 900px breakpoint, these spans may produce unexpected row heights.

---

## 8. Color — 7/10

[+] Core palette is restrained: one accent (`--acc: #bf7fff`), four semantic colors (green/amber/red/blue), three text tiers, two glass surfaces, two border values. Appropriate token count.

[-] Silent second green: `--green: #34d399` (teal) vs `#4ade80` (lime) hardcoded in 15+ locations. The difference is subtle at small sizes but visible at large stat values.

[-] `--glass: rgba(28,8,48,.55)` and `--glass2: rgba(40,12,65,.45)` are very close in opacity and lightness. At low screen brightness the card vs background distinction is minimal. No solid surface fallback for environments where `backdrop-filter` is disabled.

[+] Semantic color assignments are consistent: the green/amber/red/blue convention holds across badges, dots, card icons, and Chart.js series.

---

## 9. Component Patterns — 4/10

[!!] Three card header variants in production: `.card-hdr` (CSS class), `.card-header` (inline-styled, undefined CSS), and JS-generated header divs with inline `border-bottom:1px solid var(--border)`. All three produce visually similar but structurally different outputs.

[-] Form input duplication: `.form-input` (CSS-defined, used in modals and Settings) and a parallel inline `<input>/<textarea>` system with `background:rgba(58,0,64,.4);border:1px solid rgba(168,85,247,.2)` used in Memory, NL Query, Vault Chat, TikToks, and Vault Refactor. Both produce the same visual result but one benefits from `.form-input:focus` glow and the mobile 16px font override; the other does not.

[-] Badge inconsistency: `.badge` (CSS component class) vs inline `<span>` elements with `background:rgba(...)` styles used for `#orch-status-badge`, `#gates-pending-badge`, `#token-caps-capped-badge`. Near-identical visually, structurally separate.

[+] The `.btn` system (`.btn-primary`, `.btn-ghost`, `.btn-danger`, `.btn-sm`, `.btn-full`) is well-designed and internally consistent when used.

[+] The three-column task kanban layout (`.task-cols`, line 462) with column color coding is the right mental model and cleanly implemented.

---

## 10. Mobile / Responsive — 5/10

[+] Mobile bottom nav with 5 tabs replacing the 27-item sidebar is the correct structural decision.

[+] `font-size:16px` on mobile inputs (line 1018) prevents iOS auto-zoom.

[+] `min-height:40px` on `.btn` and `.ni` on mobile (lines 1014–1015) meets 40px touch target.

[-] Mobile nav (`#mobile-nav`, line 9297) references `var(--bg2)` and `var(--border)` — both undefined. The mobile nav bar has no background color and no border on actual browsers.

[-] Mobile nav exposes only 5 of 27 views (Home, Agents, Tasks, Analytics, Code). 22 views — Credentials, Memory, Corrections, Trust, Errors, Prompts, TikToks, Plugins, etc. — are completely unreachable on mobile without typing a hash URL.

[-] `@media(max-width:768px)` hides `#nav` with `display:none !important` without a CSS transition. The sidebar snaps away — jarring.

[-] At 900px breakpoint, `#widget-grid` shifts to 2-column but `span-2`/`span-3`/`span-4` KPI card spans are not adjusted, potentially breaking the grid layout.

---

## Top 5 Highest-Impact Improvements

### 1. Define `--border` and `--bg2`/`--bg3` tokens (or purge all references) — [CRITICAL]
These undefined tokens are referenced ~75 times (35 CSS + 40 JS). Effect: gate items lose borders, mobile nav loses background, all JS-generated list separator rows are invisible. Add to `:root`:
```css
:root {
 --border: rgba(180,100,255,.18); /* same as --bd */
 --bg2: rgba(40,12,65,.45); /* same as --glass2 */
 --bg3: rgba(28,8,48,.55); /* same as --glass */
}
```
Or do a find-replace to the canonical tokens. Zero design risk, immediate visual fix.

### 2. Consolidate to one card header pattern — [HIGH]
`.card-header` (40% of cards) should be renamed to `.card-hdr` and the inline `padding:10px` override replaced with the class's `14px`. 15 affected views gain consistent icon slots, correct border tokens, and uniform padding. Also eliminates the JS-generated header variant by defining a `.card-hdr-sm` modifier for compact use cases.

### 3. Split "Intelligence" navigation group into three focused groups — [HIGH]
Proposed restructure:
- **Overview** (1): Command Center
- **Monitor** (4–5): Agents, Tasks, Mesh, Errors, Activity Log
- **Query** (4): Analytics, NL Query, Vault Chat, Benchmarks
- **Manage** (5–6): Prompts, Corrections, Trust, Eval Quality, Capabilities, Plugins
- **Build** (5): Code, Converter, Memory, TikToks, Projects
- **System** (4–5): Credentials, Credentials, Schedule, API Explorer, Settings

This halves the largest group from 16 to 5–6 items and gives TikToks a logical home.

### 4. Extract parallel inline form inputs into `.form-input` — [MEDIUM]
Six views use identical hardcoded RGBA values that replicate `.form-input`. Replacing them reduces ~400 lines of inline style and ensures `.form-input:focus` glow and mobile font-size override apply uniformly. Search pattern: `background:rgba(58,0,64` and `border:1px solid rgba(168,85,247,.2`.

### 5. Add a Command Center summary bar with consistent Approval Gates position — [MEDIUM]
Replace the first-row KPI grid with a 1-line summary bar (4 numbers: running agents, queued tasks, cost today, last error age). Below it, always render the Approval Gates card — with empty state when no approvals are pending — so the action zone has a fixed spatial position users can learn. Push the KPI grid to a "Details" expandable section below. This reduces cognitive load on first paint while keeping full data accessible.

---

## What Is Working Well

[+] **Icon system is unusually good.** All 27 nav icons are purpose-drawn 16×16 SVGs with consistent 1.3–1.5px strokes. No icon font, no Heroicons copy-paste, no rasters.

[+] **Semantic color conventions are held throughout.** Green/amber/red/blue map consistently to ok/warn/error/info across badges, dots, icons, and chart series.

[+] **Glassmorphism is controlled.** Three opacity levels (sidebar 72%, cards 55%, secondary 45%) create a depth hierarchy without becoming noisy. `backdrop-filter` values are differentiated enough to reinforce layering.

[+] **Accessibility groundwork is present.** `.sr-only` defined and used on search inputs. `aria-hidden="true"` on all decorative SVGs. `:focus-visible` rings defined system-wide. This is further than most internal tools reach.

[+] **Loading/empty/error states are systematic.** Every dynamic container has an `.empty` default. WebSocket status is always visible. Toasts fire on all async outcomes.

[+] **The three-column task kanban** (`.task-cols`, line 462) with color-coded columns (pending=gray, running=blue, done=green) is the right mental model for monitoring agent work and is cleanly implemented.
