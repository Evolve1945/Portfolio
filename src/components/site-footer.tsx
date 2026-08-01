import { useTranslations } from "next-intl";
import { Mail, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { site } from "@/data/site";
import { GithubMark, LinkedinMark } from "./brand-icons";
import { CopyEmail } from "./copy-email";

const FOOTER_LINKS = [
  "about",
  "projects",
  "skills",
  "journey",
  "notes",
  "now",
  "cv",
  "contact",
] as const;

export function SiteFooter() {
  const t = useTranslations("footer");
  const home = useTranslations("home");
  const ui = useTranslations("ui");
  const nav = useTranslations("nav");
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

      {/* Footer nav — makes every page (incl. Contact) reachable + crawlable. */}
      <nav className="mx-auto flex max-w-6xl flex-wrap gap-x-5 gap-y-2 px-5 pt-8 text-sm text-muted">
        {FOOTER_LINKS.map((key) => (
          <Link
            key={key}
            href={`/${key}`}
            className="transition-colors hover:text-foreground"
          >
            {nav(key)}
          </Link>
        ))}
        <Link
          href="/privacy"
          className="transition-colors hover:text-foreground"
        >
          {t("privacy")}
        </Link>
      </nav>

      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 pb-9 pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
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
          <CopyEmail
            email={site.email}
            subject={ui("emailSubject")}
            copiedLabel={ui("emailCopied")}
            ariaLabel={ui("emailMe")}
            icon={<Mail className="h-4 w-4" aria-hidden />}
            copiedIcon={<Check className="h-4 w-4 text-signal" aria-hidden />}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border transition-colors hover:border-foreground/30 hover:text-foreground"
          />
        </div>
      </div>
    </footer>
  );
}
