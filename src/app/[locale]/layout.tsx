import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/data/site";
import "../globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("title");
  const description = t("description");
  return {
    metadataBase: new URL(site.url),
    title: { default: title, template: `%s — ${site.name}` },
    description,
    keywords: [
      "Rudolf Krylov",
      "développeur",
      "developer",
      "développeur Python",
      "Python developer",
      "React",
      "Next.js",
      "JavaScript",
      "alternance développeur 2028",
      "developer apprenticeship",
      "stage informatique",
      "internship",
      "étudiant ingénieur informatique",
      "computer engineering student",
      "EFREI Paris",
      "Paris",
      "full-stack",
      "web",
      "IA",
      "RAG",
      "portfolio",
    ],
    authors: [{ name: site.name, url: site.url }],
    creator: site.name,
    alternates: {
      canonical: `/${locale}`,
      languages: { fr: "/fr", en: "/en" },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      url: `${site.url}/${locale}`,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: site.url,
    email: site.email,
    jobTitle:
      locale === "fr"
        ? "Étudiant ingénieur en informatique"
        : "Computer-engineering student",
    alumniOf: { "@type": "CollegeOrUniversity", name: "EFREI Paris" },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Paris",
      addressCountry: "FR",
    },
    knowsLanguage: ["fr", "ru", "en", "de"],
    knowsAbout: [
      "Python",
      "JavaScript",
      "React",
      "Web development",
      "SQL",
      "Git",
      "Linux",
      "RAG",
      "LLM orchestration",
    ],
    sameAs: [site.githubUrl, site.linkedin],
  };

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
