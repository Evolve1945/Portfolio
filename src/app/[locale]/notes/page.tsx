import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/page-header";
import { NodeField } from "@/components/systems/node-field";
import { getNotes } from "@/lib/notes";

export default async function NotesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations("pages.notes");
  const ui = await getTranslations("ui");
  const notes = getNotes();

  if (notes.length === 0) {
    return (
      <>
        <PageHeader kicker={t("kicker")} title={t("title")} intro={t("intro")} />
        <div className="mx-auto max-w-3xl px-5 py-16">
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <NodeField className="mx-auto h-40 w-56" />
            <p className="mx-auto mt-6 max-w-md leading-relaxed text-muted">
              {ui("gardenEmpty")}
            </p>
          </div>
        </div>
      </>
    );
  }

  const groups = [...new Set(notes.map((n) => n.group))];

  // Link graph — nodes on a circle, edges between published notes.
  const idx = new Map(notes.map((n, i) => [n.slug, i]));
  const N = notes.length;
  const cx = 300;
  const cy = 180;
  const r = 132;
  const pos = notes.map((_, i) => {
    const a = (2 * Math.PI * i) / N - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  const edges: [number, number][] = [];
  notes.forEach((n, i) =>
    n.links.forEach((s) => {
      const j = idx.get(s);
      if (j !== undefined) edges.push([i, j]);
    }),
  );

  const notesLabel = l === "fr" ? "notes" : "notes";

  return (
    <>
      <PageHeader kicker={t("kicker")} title={t("title")} intro={t("intro")} />

      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-10 rounded-xl border border-border bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="kicker">Map</span>
            <span className="kicker text-faint">
              {notes.length} {notesLabel}
            </span>
          </div>
          <svg viewBox="0 0 600 360" className="w-full" role="img" aria-label="Notes map">
            <g stroke="var(--border)" strokeWidth="1">
              {edges.map(([a, b], i) => (
                <line
                  key={i}
                  x1={pos[a].x}
                  y1={pos[a].y}
                  x2={pos[b].x}
                  y2={pos[b].y}
                />
              ))}
            </g>
            {notes.map((n, i) => (
              <g key={n.slug}>
                <circle cx={pos[i].x} cy={pos[i].y} r="5" fill="var(--accent)" />
                <text
                  x={pos[i].x}
                  y={pos[i].y - 11}
                  textAnchor="middle"
                  fill="var(--faint)"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "10px" }}
                >
                  {n.title.length > 22 ? n.title.slice(0, 20) + "…" : n.title}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="space-y-10">
          {groups.map((g) => (
            <section key={g}>
              <h2 className="kicker mb-4">{g}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {notes
                  .filter((n) => n.group === g)
                  .map((n) => (
                    <Link
                      key={n.slug}
                      href={`/notes/${n.slug}`}
                      className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-foreground/30"
                    >
                      <h3 className="font-display text-lg tracking-tight">
                        {n.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {n.summary}
                      </p>
                      {n.backlinks.length > 0 ? (
                        <p className="kicker mt-3">
                          {n.backlinks.length}{" "}
                          {l === "fr" ? "rétroliens" : "backlinks"}
                        </p>
                      ) : null}
                    </Link>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
