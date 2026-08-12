import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { PageHeader } from "@/components/page-header";
import { GithubMark, LinkedinMark } from "@/components/brand-icons";
import { CopyEmailCard } from "@/components/copy-email";
import { site } from "@/data/site";

// Recruiter-facing summary — the specifics a hiring contact needs before reaching out.
const looking: Record<
  Locale,
  { title: string; items: { k: string; v: string }[] }
> = {
  en: {
    title: "What I'm looking for",
    items: [
      { k: "Role", v: "Developer apprenticeship (alternance) — from 2028" },
      { k: "Sooner", v: "Open to an internship (stage) before then" },
      {
        k: "Focus",
        v: "Python & web development — also React/Next.js and applied AI (RAG)",
      },
      { k: "Location", v: "Paris — open to hybrid or remote" },
      { k: "Team", v: "An ambitious team where I can learn fast and contribute" },
    ],
  },
  fr: {
    title: "Ce que je recherche",
    items: [
      { k: "Poste", v: "Alternance de développeur — à partir de 2028" },
      { k: "Plus tôt", v: "Ouvert à un stage d'ici là" },
      {
        k: "Domaine",
        v: "Python & développement web — aussi React/Next.js et IA appliquée (RAG)",
      },
      { k: "Lieu", v: "Paris — ouvert à l'hybride ou au télétravail" },
      { k: "Équipe", v: "Une équipe ambitieuse où apprendre vite et contribuer" },
    ],
  },
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations("pages.contact");
  const ui = await getTranslations("ui");

  const methods = [
    {
      label: "LinkedIn",
      value: "in/rudolf-krylov",
      href: site.linkedin,
      icon: <LinkedinMark className="h-4 w-4" />,
      external: true,
    },
    {
      label: "GitHub",
      value: site.github,
      href: site.githubUrl,
      icon: <GithubMark className="h-4 w-4" />,
      external: true,
    },
  ];

  return (
    <>
      <PageHeader kicker={t("kicker")} title={t("title")} intro={t("intro")} />

      <div className="mx-auto max-w-3xl px-5 pt-12">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="flex items-center gap-2 font-display text-xl tracking-tight">
            <span className="h-4 w-1 rounded-full bg-accent" aria-hidden />
            {looking[l].title}
          </h2>
          <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {looking[l].items.map((it) => (
              <div key={it.k}>
                <dt className="font-mono text-[0.7rem] uppercase tracking-wider text-faint">
                  {it.k}
                </dt>
                <dd className="mt-0.5 text-sm leading-relaxed">{it.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mx-auto grid max-w-3xl gap-4 px-5 pb-12 pt-6 sm:grid-cols-3">
        <CopyEmailCard
          email={site.email}
          subject={ui("emailSubject")}
          label="Email"
          copiedLabel={ui("emailCopied")}
          icon={<Mail className="h-4 w-4" aria-hidden />}
        />
        {methods.map((m) => (
          <a
            key={m.label}
            href={m.href}
            target={m.external ? "_blank" : undefined}
            rel={m.external ? "noreferrer" : undefined}
            className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-foreground/30"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-colors group-hover:text-foreground">
              {m.icon}
            </span>
            <p className="mt-3 font-medium">{m.label}</p>
            <p className="mt-0.5 break-all font-mono text-xs text-muted">
              {m.value}
            </p>
          </a>
        ))}
      </div>
    </>
  );
}
