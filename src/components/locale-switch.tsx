"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className="flex items-center overflow-hidden rounded-md border border-border font-mono text-xs"
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          aria-current={l === locale ? "true" : undefined}
          onClick={() => router.replace(pathname, { locale: l })}
          className={`px-2 py-1.5 uppercase tracking-wider transition-colors ${
            l === locale
              ? "text-accent"
              : "text-faint hover:text-foreground"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
