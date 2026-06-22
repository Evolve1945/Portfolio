import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getNotes, getNote, noteTitle } from "@/lib/notes";
import { Markdown } from "@/components/markdown";

export function generateStaticParams() {
  return getNotes().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = getNote(slug);
  return { title: data ? `${data.meta.title} — Notes` : "Notes" };
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const data = getNote(slug);
  if (!data) notFound();
  const { meta, content } = data;

  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/notes"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {l === "fr" ? "Toutes les notes" : "All notes"}
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="kicker">{meta.group}</span>
        {meta.tags.map((tag) => (
          <span key={tag} className="font-mono text-[0.7rem] text-faint">
            #{tag}
          </span>
        ))}
      </div>

      <h1 className="mt-3 font-display text-4xl tracking-tight">{meta.title}</h1>

      <div className="mt-8">
        <Markdown>{content}</Markdown>
      </div>

      {meta.backlinks.length > 0 ? (
        <div className="mt-12 border-t border-border pt-6">
          <span className="kicker">{l === "fr" ? "Lié depuis" : "Linked from"}</span>
          <ul className="mt-3 space-y-1.5">
            {meta.backlinks.map((s) => (
              <li key={s}>
                <Link
                  href={`/notes/${s}`}
                  className="text-sm text-accent hover:underline"
                >
                  {noteTitle(s)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
