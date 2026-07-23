"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

type GraphNote = { slug: string; title: string; links: string[] };

// Interactive notes map: hover a node to highlight its connections, click to open.
export function NotesGraph({ notes }: { notes: GraphNote[] }) {
  const router = useRouter();
  const [hover, setHover] = useState<string | null>(null);

  const n = notes.length;
  const cx = 300;
  const cy = 185;
  const r = 140;
  const idx = new Map(notes.map((note, i) => [note.slug, i]));
  // Round to a fixed precision: Math.cos/sin can differ in the last ULP between
  // the server (Node) and the client (browser), which would trip a React
  // hydration mismatch on these SVG coordinates.
  const round = (v: number) => Math.round(v * 100) / 100;
  const pos = notes.map((_, i) => {
    const a = (2 * Math.PI * i) / n - Math.PI / 2;
    return { x: round(cx + r * Math.cos(a)), y: round(cy + r * Math.sin(a)) };
  });

  const edges: [number, number][] = [];
  notes.forEach((note, i) =>
    note.links.forEach((s) => {
      const j = idx.get(s);
      if (j !== undefined) edges.push([i, j]);
    }),
  );

  const connected = (slug: string) => {
    const set = new Set<string>([slug]);
    const self = notes.find((x) => x.slug === slug);
    self?.links.forEach((s) => set.add(s));
    notes.forEach((x) => x.links.includes(slug) && set.add(x.slug));
    return set;
  };
  const active = hover ? connected(hover) : null;

  return (
    <svg viewBox="0 0 600 370" className="w-full" role="img" aria-label="Notes map">
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
              opacity={active && !on ? 0.25 : 1}
            />
          );
        })}
      </g>
      {notes.map((note, i) => {
        const dim = active ? !active.has(note.slug) : false;
        const isHover = hover === note.slug;
        const lit = isHover || (active ? active.has(note.slug) : false);
        return (
          <g
            key={note.slug}
            className="cursor-pointer"
            opacity={dim ? 0.3 : 1}
            onMouseEnter={() => setHover(note.slug)}
            onMouseLeave={() => setHover(null)}
            onClick={() => router.push(`/notes/${note.slug}`)}
          >
            <circle
              cx={pos[i].x}
              cy={pos[i].y}
              r={isHover ? 7 : 4.5}
              fill={lit ? "var(--accent)" : "var(--faint)"}
            />
            {isHover ? (
              <text
                x={pos[i].x}
                y={pos[i].y - 12}
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
