import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/page-header";
import { NodeField } from "@/components/systems/node-field";
import { NotesGraph } from "@/components/notes-graph";
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

  return (
    <>
      <PageHeader kicker={t("kicker")} title={t("title")} intro={t("intro")} />

      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { title: t("guideWhatTitle"), body: t("guideWhat") },
            { title: t("guideUseTitle"), body: t("guideUse") },
            { title: t("guideHowTitle"), body: t("guideHow") },
          ].map((card, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xs text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display text-lg tracking-tight">
                  {card.title}
                </h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {card.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-10 rounded-xl border border-border bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="kicker">
              {l === "fr" ? "Comment les notes se relient" : "How the notes connect"}
            </span>
            <span className="kicker text-faint">{notes.length} notes</span>
          </div>
          <NotesGraph notes={notes} />
          <p className="mt-3 text-center text-xs leading-relaxed text-faint">
            {l === "fr"
              ? "Survolez un point : les notes reliées se figent pour que vous puissiez les lire · cliquez pour en ouvrir une"
              : "Hover a node: the connected notes settle so you can read them · click to open one"}
          </p>
        </div>

        <div className="space-y-10">
          {groups.map((g) => (
            <section key={g}>
              <h2 className="kicker mb-4">{g}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {notes
                  .filter((note) => note.group === g)
                  .map((note) => (
                    <Link
                      key={note.slug}
                      href={`/notes/${note.slug}`}
                      className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-foreground/30"
                    >
                      <h3 className="font-display text-lg tracking-tight">
                        {note.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {note.summary}
                      </p>
                      {note.backlinks.length > 0 ? (
                        <p className="kicker mt-3">
                          {note.backlinks.length}{" "}
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
