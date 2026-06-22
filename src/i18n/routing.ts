import { defineRouting } from "next-intl/routing";

// Bilingual: French primary (local recruiters), English co-equal (international / exchange).
// Both locales are always prefixed (/fr, /en) so neither reads as second-class.
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
