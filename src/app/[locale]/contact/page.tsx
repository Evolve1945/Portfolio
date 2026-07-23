import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { GithubMark, LinkedinMark } from "@/components/brand-icons";
import { CopyEmailCard } from "@/components/copy-email";
import { site } from "@/data/site";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
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

      <div className="mx-auto grid max-w-3xl gap-4 px-5 py-12 sm:grid-cols-3">
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
