import { Link } from "@/i18n/navigation";
import { site } from "@/data/site";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitch } from "./locale-switch";
import { NavLinks } from "./nav-links";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
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

        <NavLinks />

        <div className="ml-auto flex items-center gap-2">
          <LocaleSwitch />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
