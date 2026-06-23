import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { site } from "@/data/site";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitch } from "./locale-switch";

const NAV = [
  { href: "/about", key: "about" },
  { href: "/projects", key: "projects" },
  { href: "/skills", key: "skills" },
  { href: "/journey", key: "journey" },
  { href: "/notes", key: "notes" },
  { href: "/now", key: "now" },
  { href: "/cv", key: "cv" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5">
        <Link
          href="/"
          className="font-mono text-sm font-semibold tracking-tight"
          aria-label={site.name}
        >
          {site.initials}
          <span className="text-accent">.</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-5 text-sm text-muted md:flex">
          {NAV.map((item) =>
            item.key === "cv" ? (
              <Link
                key={item.key}
                href={item.href}
                className="rounded-md border border-border px-2.5 py-1 text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                {t(item.key)}
              </Link>
            ) : (
              <Link
                key={item.key}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {t(item.key)}
              </Link>
            ),
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LocaleSwitch />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
