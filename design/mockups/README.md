# Home-page visual-identity mockups

Static HTML explorations for the portfolio's visual identity. Each is self-contained
(open in a browser) with its own **light/dark** and **EN/FR** toggles. These are design
studies — not part of the Next.js build (the `design/` folder is ignored by Next).

The typography across all of them is a **system stand-in** for a geometric grotesque
(final would use a real face); GitHub figures are **samples**.

| # | File | Direction | Live artifact | Verdict |
|---|------|-----------|---------------|---------|
| 01 | `01-identity-warm-editorial.html` | Warm paper + serif + node graph (the "10 moves" v1) | https://claude.ai/code/artifact/deced464-4462-4a4a-94c0-619c0265b89f | ❌ Rejected — "too much AI" |
| 02 | `02-werkstatt-bauhaus.html` | Werkstatt: Bauhaus + Dan + Blueprint (primaries + shapes) | https://claude.ai/code/artifact/9d5607bf-4f3e-433d-b874-2cc157a89232 | ⚠️ Kept only the **typography**; colors/shapes/grid rejected |
| 03 | `03-nocturne-plum.html` | Mockup A — dark, muted-plum Nocturne (user brief) | https://claude.ai/code/artifact/ac57b33c-3979-45bc-802d-585097c1b588 | 👍 Liked, but B preferred |
| 04 | `04-longgame.html` | Mockup B — near-black "controlled intensity", iris accent | https://claude.ai/code/artifact/03515a76-6d65-4190-9149-0e049062d788 | ✅ **Chosen direction** |
| 05 | `05-longgame-merged.html` | B + the 10 trait-based propositions merged | https://claude.ai/code/artifact/f1e2acf5-eb93-431c-81f2-02642817094f | ✅ Current working direction |

## Locked direction (as of 2026-08-02)
- **Base:** Mockup B "The Long Game" — dark-first, near-black `#0c0c10`, one controlled **iris** accent `#7c6be0`, geometric-grotesque display + technical mono, heavy restraint, square edges.
- **Typography** is the one element carried from Werkstatt (the only thing liked there).
- **Dropped for good:** warm paper, serif display, node graphs, Bauhaus primaries, geometric shapes ("too Picasso"), full-bleed grids.

## The 10 propositions merged into #05
1. One color + one mark (iris + tick + "RK.") repeated everywhere — the recall lever.
2. Positioning line — kept the current tagline ("I build systems and learn by deploying them.").
3. The Long Game phase strip (Now → 2028 alternance → build my own) = merged Journey.
4. "What I can defend" honesty block on the flagship.
5. Digital garden shown as a mono **log**, graph optional (not default).
6. Live "always shipping" pulse (last build) in the hero.
7. Capability matrix — competency → the project that proves it.
8. Discipline signature (1st-dan black belt) — **subtle, footer only**.
9. Bilingual FR/EN first-class (Russian kept out).
10. Four principles as maxims ("Learn by building." etc.).
- Plus a **"How I think" field library** (Greene, Housel, Newport, Niel, biographies, Carnegie) framed by theme.

## Decisions captured
- Personal/discipline signal → **kept subtle** (footer/About only).
- Reading / influences → **visible** as "how I think", framed by theme.
- Positioning line → **kept the current tagline**.

## Open questions before building in Next.js
- Page density of #05 (may push capability matrix → Skills page, field library → About/Now).
- Where the field library lives (home vs About/Now).
- Source a real geometric-grotesque display face (licensing).
