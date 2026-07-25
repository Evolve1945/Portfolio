"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useRouter } from "@/i18n/navigation";

type GraphNote = { slug: string; title: string; group: string; links: string[] };

const W = 760;
const H = 400;
const CX = 380;
const CY = 200;
const RX = 342; // horizontal spread radius
const RY = 168; // vertical spread radius
const AMP = 7; // drift radius in SVG units
const GOLDEN = 2.399963229728653; // golden angle (radians)

// Group -> colour token. Exported so the page legend stays in sync.
export const groupColor: Record<string, string> = {
  Components: "var(--node-components)",
  Integrations: "var(--node-integrations)",
  Guides: "var(--node-guides)",
  Review: "var(--node-review)",
};
const colorFor = (group: string) => groupColor[group] ?? "var(--faint)";

// Interactive notes map. Nodes are spread across the panel with a phyllotaxis
// (sunflower) layout and coloured by their group; they gently drift like the
// home-page graph. Hovering a node eases it and everything connected to it to a
// stop and reveals their labels, while unrelated nodes dim AND stop receiving
// pointer events — so a drifting node can never steal the hover you're reading.
export function NotesGraph({ notes }: { notes: GraphNote[] }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const n = notes.length;

  // Deterministic, SSR-safe structures (no Math.random; rounded coordinates so
  // the first paint matches the server render — avoids a hydration mismatch).
  const { anchors, edges, adjacency, motion } = useMemo(() => {
    const round = (v: number) => Math.round(v * 100) / 100;
    const anchors = notes.map((_, i) => {
      const f = Math.sqrt((i + 0.5) / n); // uniform areal density
      const a = i * GOLDEN;
      return { x: round(CX + RX * f * Math.cos(a)), y: round(CY + RY * f * Math.sin(a)) };
    });
    const idx = new Map(notes.map((note, i) => [note.slug, i]));
    const edges: [number, number][] = [];
    notes.forEach((note, i) =>
      note.links.forEach((s) => {
        const j = idx.get(s);
        if (j !== undefined) edges.push([i, j]);
      }),
    );
    const adjacency = new Map<string, Set<string>>();
    notes.forEach((note) => adjacency.set(note.slug, new Set([note.slug])));
    notes.forEach((note) =>
      note.links.forEach((s) => {
        if (adjacency.has(s)) {
          adjacency.get(note.slug)!.add(s);
          adjacency.get(s)!.add(note.slug);
        }
      }),
    );
    const motion = notes.map((_, i) => ({
      px: (i * 1.7) % (Math.PI * 2),
      py: (i * 2.3) % (Math.PI * 2),
      fx: 0.5 + (i % 5) * 0.06,
      fy: 0.5 + (i % 7) * 0.05,
    }));
    return { anchors, edges, adjacency, motion };
  }, [notes, n]);

  // Live positions + per-node "settle" (1 = drifting freely, 0 = frozen at anchor).
  const posRef = useRef(anchors.map((a) => ({ x: a.x, y: a.y })));
  const settleRef = useRef(anchors.map(() => 1));
  const hoverRef = useRef<string | null>(null);
  hoverRef.current = hover;

  useEffect(() => {
    posRef.current = anchors.map((a) => ({ x: a.x, y: a.y }));
    settleRef.current = anchors.map(() => 1);
  }, [anchors]);

  useEffect(() => {
    if (reduce) return; // static frame at the anchors
    let raf = 0;
    let t = 0;
    const step = () => {
      t += 0.016;
      const active = hoverRef.current ? adjacency.get(hoverRef.current) : null;
      for (let i = 0; i < n; i++) {
        const target = active && active.has(notes[i].slug) ? 0 : 1;
        settleRef.current[i] += (target - settleRef.current[i]) * 0.12;
        const s = settleRef.current[i];
        const m = motion[i];
        posRef.current[i].x = anchors[i].x + AMP * Math.sin(t * m.fx + m.px) * s;
        posRef.current[i].y = anchors[i].y + AMP * Math.cos(t * m.fy + m.py) * s;
      }
      setTick((v) => (v + 1) % 1_000_000);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reduce, n, notes, anchors, motion, adjacency]);

  const active = hover ? adjacency.get(hover) : null;
  const pos = posRef.current;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Notes map"
    >
      <g>
        {edges.map(([a, b], i) => {
          const on = active
            ? active.has(notes[a].slug) && active.has(notes[b].slug)
            : false;
          return (
            <line
              key={i}
              x1={pos[a].x}
              y1={pos[a].y}
              x2={pos[b].x}
              y2={pos[b].y}
              stroke={on ? "var(--accent)" : "var(--border)"}
              strokeWidth={on ? 1.5 : 1}
              opacity={active && !on ? 0.15 : 1}
            />
          );
        })}
      </g>
      {notes.map((note, i) => {
        const inActive = active ? active.has(note.slug) : false;
        const dim = active ? !inActive : false;
        const isHover = hover === note.slug;
        const showLabel = active ? inActive : isHover;
        const fill = colorFor(note.group);
        return (
          <g
            key={note.slug}
            className="cursor-pointer"
            opacity={dim ? 0.2 : 1}
            // Dimmed (still-drifting) nodes stop receiving pointer events so they
            // can't intercept the hover while you're reading the active cluster.
            style={{ pointerEvents: dim ? "none" : "auto" }}
            onMouseEnter={() => setHover(note.slug)}
            onMouseLeave={() => setHover(null)}
            onClick={() => router.push(`/notes/${note.slug}`)}
          >
            {/* Invisible larger hit area so a moving node is easy to catch. */}
            <circle cx={pos[i].x} cy={pos[i].y} r={11} fill="transparent" />
            <circle
              cx={pos[i].x}
              cy={pos[i].y}
              r={isHover ? 7 : inActive ? 5.5 : 4.5}
              fill={fill}
            />
            {showLabel ? (
              <text
                x={pos[i].x}
                y={pos[i].y - 11}
                textAnchor="middle"
                fill="var(--foreground)"
                style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}
              >
                {note.title.length > 26 ? note.title.slice(0, 24) + "…" : note.title}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
