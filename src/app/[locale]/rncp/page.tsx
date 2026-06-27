import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/page-header";
import { rncpBlocks, rncpMeta, priorityLabel, type RncpPriority } from "@/data/rncp";
import { getProject } from "@/data/projects";

const pill: Record<RncpPriority, string> = {
  prioritize: "border-signal/50 text-signal",
  build: "border-accent/50 text-accent",
  neglect: "border-border text-faint",
};

export default async function RncpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations("pages.rncp");
  const ui = await getTranslations("ui");

  return (
    <>
      <PageHeader kicker={t("kicker")} title={t("title")} intro={t("intro")} />

      <div className="mx-auto max-w-4xl px-5 py-12">
        {/* Meta + legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5">
          <div>
            <p className="font-mono text-sm">{rncpMeta.code}</p>
            <p className="mt-1 text-sm text-muted">
              {rncpMeta.title[l]} · {rncpMeta.level[l]} · {rncpMeta.certifier}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {(["prioritize", "build", "neglect"] as RncpPriority[]).map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5 text-xs text-muted">
                <span
                  className={`h-2 w-2 rounded-full ${p === "prioritize" ? "bg-signal" : p === "build" ? "bg-accent" : "bg-faint"}`}
                  aria-hidden
                />
                {priorityLabel[p][l]}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {rncpBlocks.map((block) => (
            <section key={block.code}>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-accent">{block.code}</span>
                <h2 className="font-display text-2xl tracking-tight">{block.title[l]}</h2>
              </div>

              <ul className="mt-4 space-y-3">
                {block.competencies.map((c, i) => (
                  <li
                    key={i}
                    className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{c.text[l]}</p>
                      {c.evidence?.length ? (
                        <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-faint">
                          {ui("evidence")}:
                          {c.evidence.map((slug) => {
                            const proj = getProject(slug);
                            if (!proj) return null;
                            return (
                              <Link
                                key={slug}
                                href={`/projects/${slug}`}
                                className="text-accent hover:underline"
                              >
                                {proj.name}
                              </Link>
                            );
                          })}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={`shrink-0 self-start rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider ${pill[c.priority]}`}
                    >
                      {priorityLabel[c.priority][l]}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
