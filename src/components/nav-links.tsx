"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const NAV = [
  { href: "/about", key: "about" },
  { href: "/projects", key: "projects" },
  { href: "/skills", key: "skills" },
  { href: "/journey", key: "journey" },
  { href: "/notes", key: "notes" },
  { href: "/now", key: "now" },
  { href: "/cv", key: "cv" },
] as const;

export function NavLinks() {
  const t = useTranslations("nav");
  const pathname = usePathname(); // locale-stripped, e.g. "/projects" or "/projects/ecosystem"

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="hidden flex-1 items-center gap-5 text-sm text-muted md:flex">
      {NAV.map((item) => {
        const active = isActive(item.href);

        if (item.key === "cv") {
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-md border px-2.5 py-1 transition-colors ${
                active
                  ? "border-accent text-accent"
                  : "border-border text-foreground hover:border-accent hover:text-accent"
              }`}
            >
              {t(item.key)}
            </Link>
          );
        }

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group relative transition-colors ${
              active ? "text-foreground" : "hover:text-foreground"
            }`}
          >
            {t(item.key)}
            <span
              className={`absolute -bottom-1 left-0 h-px w-full bg-accent transition-transform duration-300 ${
                active
                  ? "scale-x-100"
                  : "origin-left scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
