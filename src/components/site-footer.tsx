import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { site } from "@/data/site";
import { GithubMark, LinkedinMark } from "./brand-icons";
import { CopyEmail } from "./copy-email";

export function SiteFooter() {
  const t = useTranslations("footer");
  const home = useTranslations("home");
  const ui = useTranslations("ui");
  const year = 2026; // build-time constant; date APIs are unavailable in this sandbox

  return (
    <footer className="border-t border-border">
      {/* Contact CTA — shown on every page */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md font-display text-xl leading-snug tracking-tight">
            {home("status")}
          </p>
          <CopyEmail
            email={site.email}
            subject={ui("emailSubject")}
            label={ui("emailMe")}
            copiedLabel={ui("emailCopied")}
            icon={<Mail className="h-4 w-4" aria-hidden />}
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
          />
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-9 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm leading-relaxed">{t("built")}</p>

        <div className="flex items-center gap-3">
          <span className="kicker mr-1 hidden sm:inline">
            © {year} {t("rights")}
          </span>
          <a
            href={site.githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <GithubMark className="h-4 w-4" />
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <LinkedinMark className="h-4 w-4" />
          </a>
          <a
            href={`mailto:${site.email}`}
            aria-label={t("rights")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <Mail className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
