> **Read this before building or editing ANY dashboard UI.** The dashboard (`dashboard/v2.html`)
> **and the login page (`dashboard/login.html`)** are built in the "Claude visual language": two paired
> themes — **Factory** (dark, default) and **Cursor** (light) — sharing one set of CSS custom
> properties. New features must reuse the variables below and match the two themes; do not introduce
> new colours, fonts, or radii. The login page uses the same variable contract and reads the same
> `localStorage.eco_theme`, so it stays in sync with whatever theme the user picked in the dashboard.

Source specs (Evo, from the Claude design canvas, 2026-07-19): the raw `DESIGN.md` / `theme.css` /
`tokens.json` / `variables.css` for each theme. Their essence is captured below so it survives here
even if the source folders are cleared. Implemented in [Dashboard V2](/notes/dashboard-v2).

---

## 1. The two themes (one system, two skins)

| | **Factory** (dark — default) | **Cursor** (light) |
|---|---|---|
| Mood | Terminal war room at midnight; stark black control surface, one bright card = the work | Warm parchment atelier lit by embers; cream canvas, ink text, literary-journal calm |
| Canvas | `#101010` obsidian | `#f7f7f4` parchment (never pure white) |
| Text | `#eeeeee` bone | `#26251e` ink (never pure black) |
| Accent | `#ee6018` signal orange (data/status only) | `#f54e00` ember (text links/emphasis only) |
| Positive | `#a0ca92` metric green | `#1f8a65` verdant / `#34785c` forest |
| Fonts | Geist + Geist Mono | CursorGothic ( system-ui) + EB Garamond + Berkeley Mono |
| Radius | 3px controls / 10px cards | 4px everywhere / 8px modals |
| Elevation | **No shadows** — depth = figure/ground contrast | Soft **warm** shadows only (never cool/blue) |
| Base unit | 8px (comfortable) | 4px (compact) |

The two are toggled at runtime (`body[data-theme="dark"|"light"]`); the toggle persists in
`localStorage.eco_theme`. Both are always shipped — never build a feature that only works in one.

---

## 2. THE CONTRACT — the CSS variables every feature must use

`dashboard/v2.html` defines short-named variables on `:root` (dark) and `body[data-theme="light"]`.
**Always style with these variables — never hardcode a hex value in a feature.** They re-skin
automatically across both themes.

| Variable | Dark (Factory) | Light (Cursor) | Use for |
|---|---|---|---|
| `--s0` | `#101010` | `#f7f7f4` | Page canvas / base |
| `--s1` | `#1d1a18` | `#f2f1ed` | Raised surface, nav-active well, mini-bars |
| `--s2` | `#171514` | `#eceae5` | Card / panel surface |
| `--ln` | `#1d1a18` | `#e6e5e0` | Hairline dividers, borders inside cards |
| `--ln2` | `#3d3a39` | `#cdcdc9` | Stronger borders, ghost-button outline, inputs |
| `--tx` | `#eeeeee` | `#26251e` | Primary text |
| `--tx2` | `#b8b3b0` | `#7a7974` | Secondary text |
| `--tx3` | `#8a8380` | `#a1a19f` | Muted / eyebrow / label text |
| `--tx4` | `#4d4947` | `#a1a19f` | Faintest text, timestamps |
| `--ok` | `#a0ca92` | `#1f8a65` | Success / running / positive |
| `--warn` | `#ee6018` | `#f54e00` | Warning / awaiting-approval / accent |
| `--err` | `#ee6018` | `#cf2d56` | Error / failed |
| `--acc` | `#ee6018` | `#f54e00` | The accent (links, active tab underline, sparklines) |
| `--btnbg` | `#eeeeee` | `#26251e` | Solid-button fill |
| `--btntx` | `#101010` | `#f7f7f4` | Solid-button text |
| `--r` | `3px` | `4px` | Control radius (buttons, inputs, chips) |
| `--rc` | `10px` | `4px` | Card radius |
| `--font` | Geist | system-ui | UI/body font |
| `--mono` | Geist Mono | ui-monospace | Labels, metrics, code, timestamps |
| `--serif` | EB Garamond | EB Garamond | The greeting line only (italic, editorial) |

Plus responsive vars set by JS from the viewport (see §5): `--content-max`, `--view-pad`.

---

## 3. Type & voice

- **Two voices, one family.** Sans (`--font`) carries all body/heading text at **weight 400** — authority
 comes from size + tight tracking, never bold. Reach for 600 only on a solid button or an active nav item.
- **Mono (`--font``--mono`) is the instrument voice**: uppercase ~11px labels, metric values, status tags,
 timestamps, column headers, `:port` numbers. When a user sees mono, they know it's a system surface.
- **Serif (EB Garamond, italic)** appears in exactly one place: the Home greeting line. Do not spread it.
- Headings tighten as they grow (negative letter-spacing). Never use line-height above ~1.5.

---

## 4. Component patterns already in the system (reuse, don't reinvent)

Every reusable class lives in `dashboard/v2.html`'s `<style>`. Build new UI by composing these:

| Class | What it is |
|---|---|
| `.view` | A full section page (centered, max-width `--content-max`). One per nav destination. |
| `.hdr` (`.t`,`.m`) | Section header — title + mono sub-label. Add a `flex:1` spacer then a `.btn.solid` for a page action. |
| `.gcard` | The standard panel/card (surface `--s2`, border `--ln2`, radius `--rc`). |
| `.stat-strip` / `.stat-big` / `.stat-lbl` / `.stat-sub` | The 4-up metric strip (Home) and single stat tiles. |
| `.bottom-grid` | 2- or 3-column card row (inline `grid-template-columns`); collapses responsively. |
| `.btn.solid` / `.btn.ghost` | The two button weights. Never stack two solids; solid + ghost is the pair. |
| `.tk-table` + `.tk-hd`/`.tk-row` | Data tables (grid rows; scroll horizontally inside their card on narrow). Use fixed grid columns + `align-items:center` so rows line up. |
| `.kanban` / `.kan-col` / `.kan-card` | Legacy kanban CSS (still defined). Fleet moved to `.tabs` + `.tk-table` on 2026-07-20 — prefer that pattern for column-imbalanced boards. |
| `.ag-grid` / `.ag-card` | Auto-filling card grid (agents, capabilities, projects, mesh). |
| `.chip-row button` | Filter chips (Tasks). |
| `.mini-row` (`.v`) | Compact labelvalue row inside a card. |
| `.tabs button` | In-card tab strip (Trust, Activity Log, **Fleet**, **Projects** allone). The preferred selector for switching between peer views/columns. |
| `.act-row` (`.t`,`.act-chip`,`.st`,`.msg`,`.amt`) | Readable activity row — **fixed-width** time/chip(112px)/status(60px)/cost(52px) columns so every row aligns down the list. Home activity, Time timeline, Memory recent. |
| `.loglist` / `.logline` (`.lt`,`.ll`,`.lm`,`.lc`) | **Dense** log grid (~22px rows, 2.5px pad) for high-volume lists — Activity Log, Trust write-log. Use this, not `.act-row`, when there are hundreds of terse events. |
| `.dd` / `.dd-input` / `.dd-caret` / `.dd-panel` / `.dd-opt` | **Themed custom dropdown / combobox** (`initCombo(inputId, options, {free})`). Use instead of native `<select>`/`<datalist>`, whose option popups are OS-rendered and can't be styled. `free:true` = type-ahead combobox (accepts custom text), `free:false` = fixed choice. Value lives on the `<input>`. |
| `.needs-row` | A row with body + Approve/Reject action buttons (approvals, DLQ, inbox). |
| `.text-input` / `.textarea` / `.form-row` / `.form-grid` | Form controls. |
| `.omni` | The pill search/ask input. |
| `.modal-wrap` + `.modal` / `.drawer` + `.overlay` | Center modal (create forms, stop-confirm) and right-side detail drawer. |
| `.chart-wrap` + `<canvas>` | A chart cell (fixed 200px tall). Charts use vendored Chart.js (`/chart.umd.min.js`). |
| `.dot` (`.pulse`) | Status dot; colour by `--ok`/`--warn`/`--err`. |

**Statuscolour mapping** (used everywhere): running`--ok`, awaiting/paused`--warn`,
failed/error`--err`, queued/done`--tx3`. Keep this consistent.

---

## 5. Responsive rules (added 2026-07-19)

- **Adaptive centering.** `.view{ max-width:var(--content-max); margin:0 auto }`. JS
 `applyResponsiveWidth()` reads `window.innerWidth` on load + resize and sets the band:
 <15001280 (fill) · 1500–19191400 · 1920–23991680 · 2400–3199 (2K)1960 · ≥3200 (4K)2400.
 On a 2560px screen content is 1960px **centered**, not glued left.
- **Charts** must run `{responsive:true, maintainAspectRatio:false}` (the `drawChart()` helper forces this)
 so a canvas fills its 200px card instead of overflowing at Chart.js's default 2:1 ratio.
- **Grid collapse** breakpoints (media queries use `!important` to beat inline `grid-template-columns`):
 ≤1180px `.bottom-grid`1 col & `.kanban`/`.ag-grid` auto-fit-wrap; ≤920px `.stat-strip`2 cols &
 `.form-grid`1 col; ≤680px the rail becomes a sticky horizontal scroll bar, `.stat-strip`1 col,
 the page scrolls vertically.
- **Wide tables** scroll horizontally *inside their own card* (`.tk-table{overflow-x:auto}`, rows
 `min-width:640px`) — the page body must never scroll sideways.

---

## 6. Do / Don't

**Do**
- Style every element with the §2 variables so it re-skins in both themes automatically.
- Keep colour for data/state only: accent = links + live signal + sparklines; ok/warn/err = status.
- Use mono uppercase for labels, metrics, timestamps, ports, status tags.
- Compose from the §4 classes; add a new class only when nothing fits, and give it both-theme colours.
- Fail open: every panel renders a plain muted sentence when its API is unreachable (`.tx3`).
- Build a real control only where a real endpoint backs it — no dead buttons.

**Don't**
- Don't hardcode hex colours in a feature. Don't add a new accent colour.
- Don't fill a button with the accent/status colour — buttons are `--btnbg` (neutral) only.
- Don't use bold (600+) for headings — weight 400 + tight tracking is the signature.
- Don't add drop shadows in the dark theme (contrast is the depth); in light, warm shadows only.
- Don't mix in extra fonts. Sans + mono, with EB Garamond reserved for the greeting.
- Don't let anything overflow its card or scroll the page body horizontally.

---

## 7. Adding a new dashboard view — checklist

1. Add `['id','Label']` to the right group in `NAV_GROUPS` (Overview / Agents / Tasks / Intelligence /
 Build / System) in `dashboard/v2.html`.
2. Add a `<section class="view" id="v-<id>">` using `.hdr` + `.gcard`/`.bottom-grid` + the §4 classes.
3. Write a `load<Id>()` loader that calls the API via `api('/…')`, renders with the variables, and
 **fails open** on error.
4. Register it in the `LOADERS` map so it loads on navigation.
5. Verify in both themes and at 2560 / 1440 / 600px widths (no page-level horizontal scroll, no
 card overflow, charts contained).

## 8. Verbatim token blocks (source of record)

The exact source palettes, preserved. v2.html maps these onto the short `--s0…--btntx` names in §2.

**Factory (dark):** obsidian `#101010`, carbon-lift `#1d1a18`, ash-stroke `#3d3a39`, graphite `#4d4947`,
warm-granite `#8a8380`, pale-stone `#b8b3b0`, bone `#eeeeee`, chalk `#fafafa`, signal-orange `#ee6018`,
metric-green `#a0ca92`. Fonts Geist / Geist Mono. Radii 3 / 10 / 20. Spacing base 8. No shadows.

**Cursor (light):** parchment `#f7f7f4`, bone `#f2f1ed`, linen `#e6e5e0`, stone `#cdcdc9`, mist `#a1a19f`,
driftwood `#84847e`, ash `#7a7974`, ink `#26251e`, ember `#f54e00`, amber `#c08532`, forest `#34785c`,
verdant `#1f8a65`, crimson `#cf2d56`. Fonts CursorGothic / EB Garamond / Berkeley Mono. Radii 4 / 8.
Spacing base 4. Warm shadows: `rgba(0,0,0,.14) 0 28px 70px, rgba(0,0,0,.1) 0 14px 32px`.

---

## Related
- [Dashboard V2](/notes/dashboard-v2) — the implementation this design governs
- [Dashboard Architecture](/notes/dashboard-architecture) · [Dashboard](/notes/dashboard) · [Dashboard Design Critique](/notes/design-critique-claude-ecosystem-dashboard) · Dashboard Accessibility
