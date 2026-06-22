// Decorative "system map" — a deterministic node graph that echoes the
// Ecosystem architecture and the Obsidian vault. Static (no randomness) to keep
// SSR/CSR identical, and quiet enough not to fight the editorial layout.

type Node = { x: number; y: number; r: number; kind: "core" | "live" | "node" };

const nodes: Node[] = [
  { x: 160, y: 130, r: 7, kind: "core" },
  { x: 70, y: 60, r: 4, kind: "node" },
  { x: 250, y: 58, r: 4, kind: "live" },
  { x: 280, y: 150, r: 4, kind: "node" },
  { x: 232, y: 214, r: 4, kind: "node" },
  { x: 120, y: 220, r: 4, kind: "live" },
  { x: 48, y: 158, r: 4, kind: "node" },
  { x: 95, y: 128, r: 3, kind: "node" },
  { x: 210, y: 110, r: 3, kind: "node" },
  { x: 178, y: 186, r: 3, kind: "node" },
];

const edges: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
  [0, 7], [0, 8], [0, 9], [1, 7], [2, 8], [3, 8], [5, 9], [6, 7],
];

const fill: Record<Node["kind"], string> = {
  core: "var(--accent)",
  live: "var(--signal)",
  node: "var(--faint)",
};

export function NodeField({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 260"
      className={className}
      role="img"
      aria-label="System map"
      fill="none"
    >
      <g stroke="var(--border)" strokeWidth="1">
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
          />
        ))}
      </g>
      <g>
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={fill[n.kind]} />
        ))}
      </g>
    </svg>
  );
}
