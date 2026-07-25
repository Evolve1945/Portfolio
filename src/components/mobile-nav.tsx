"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV } from "./nav-links";

// Hamburger menu for small screens (the desktop <NavLinks /> is hidden below md).
// Closes on navigation, on Escape, and on backdrop tap; locks body scroll while open.
export function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  // Close whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape to close + lock scroll while the panel is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={t("menu")}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:border-accent hover:text-accent"
      >
        {open ? (
          <X className="h-4 w-4" aria-hidden />
        ) : (
          <Menu className="h-4 w-4" aria-hidden />
        )}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-14 z-40 bg-background/60 backdrop-blur-sm"
          />
          <nav
            id="mobile-nav-panel"
            className="fixed inset-x-0 top-14 z-50 border-b border-border bg-background"
          >
            <ul className="mx-auto max-w-6xl px-5 py-2">
              {NAV.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between border-b border-border/60 py-3.5 text-base transition-colors last:border-0 ${
                        active ? "text-accent" : "text-foreground hover:text-accent"
                      }`}
                    >
                      {t(item.key)}
                      {active ? (
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-accent"
                          aria-hidden
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      ) : null}
    </div>
  );
}
