import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageHeader } from "@/components/page-header";
import { site } from "@/data/site";

// Update this date whenever the policy changes.
const updated = "2026-08-01";

const content: Record<
  Locale,
  {
    kicker: string;
    title: string;
    intro: string;
    updatedLabel: string;
    contactTitle: string;
    contactBefore: string;
    contactAfter: string;
    sections: { h: string; p: string }[];
  }
> = {
  en: {
    kicker: "Privacy",
    title: "Privacy",
    intro:
      "What this site collects, and what it doesn't. Short version: no cookies, no personal data, no tracking — just anonymous, aggregated statistics.",
    updatedLabel: "Last updated",
    contactTitle: "Contact",
    contactBefore: "Any question about privacy? Email me at ",
    contactAfter: " and I'll take care of it.",
    sections: [
      {
        h: "Analytics",
        p: "This site uses Vercel Web Analytics and Vercel Speed Insights to understand its traffic and performance. Both are cookieless and privacy-friendly: they set no cookies, store nothing on your device, and never track you across other sites. The data is aggregated and anonymous — the page visited, the referring link, an approximate country (derived from your IP address, which is not stored), and a general device and browser type. It cannot be used to identify you.",
      },
      {
        h: "Cookies",
        p: "This site sets no cookies and uses no advertising or cross-site tracking. Because of that, there is no cookie-consent banner to click through — there is simply nothing to consent to.",
      },
      {
        h: "If you contact me",
        p: "If you email me, I use your message and address for the sole purpose of replying. I don't add you to any mailing list and I don't share your details with anyone.",
      },
      {
        h: "Hosting",
        p: "The site is hosted on Vercel. Like any web host, Vercel briefly processes basic request data (such as your IP address) to deliver the pages and keep the service secure. See Vercel's own privacy policy for the details of their processing.",
      },
      {
        h: "GitHub data",
        p: "The live statistics shown on the site come from my own public GitHub account and are fetched automatically. They describe my repositories — not you or your activity.",
      },
      {
        h: "Your rights",
        p: "Under the GDPR you can ask to access, correct, or delete any personal data I hold about you — in practice, only an email you may have sent me. Just get in touch and I'll handle it.",
      },
    ],
  },
  fr: {
    kicker: "Confidentialité",
    title: "Confidentialité",
    intro:
      "Ce que ce site collecte, et ce qu'il ne collecte pas. En résumé : aucun cookie, aucune donnée personnelle, aucun suivi — seulement des statistiques anonymes et agrégées.",
    updatedLabel: "Dernière mise à jour",
    contactTitle: "Contact",
    contactBefore: "Une question sur la confidentialité ? Écrivez-moi à ",
    contactAfter: " et je m'en occupe.",
    sections: [
      {
        h: "Statistiques",
        p: "Ce site utilise Vercel Web Analytics et Vercel Speed Insights pour comprendre sa fréquentation et ses performances. Les deux sont sans cookies et respectueux de la vie privée : ils ne déposent aucun cookie, ne stockent rien sur votre appareil et ne vous suivent jamais sur d'autres sites. Les données sont agrégées et anonymes — la page consultée, le lien d'origine, un pays approximatif (déduit de votre adresse IP, qui n'est pas conservée) et un type général d'appareil et de navigateur. Elles ne permettent pas de vous identifier.",
      },
      {
        h: "Cookies",
        p: "Ce site ne dépose aucun cookie et n'utilise ni publicité ni suivi intersites. C'est pourquoi il n'y a pas de bandeau de consentement à cliquer — il n'y a tout simplement rien à accepter.",
      },
      {
        h: "Si vous me contactez",
        p: "Si vous m'écrivez, j'utilise votre message et votre adresse uniquement pour vous répondre. Je ne vous inscris à aucune liste de diffusion et je ne partage vos coordonnées avec personne.",
      },
      {
        h: "Hébergement",
        p: "Le site est hébergé chez Vercel. Comme tout hébergeur, Vercel traite brièvement des données de requête basiques (comme votre adresse IP) pour livrer les pages et sécuriser le service. Consultez la politique de confidentialité de Vercel pour le détail de ces traitements.",
      },
      {
        h: "Données GitHub",
        p: "Les statistiques affichées en direct proviennent de mon propre compte GitHub public et sont récupérées automatiquement. Elles décrivent mes dépôts — pas vous ni votre activité.",
      },
      {
        h: "Vos droits",
        p: "Conformément au RGPD, vous pouvez demander à accéder, rectifier ou supprimer toute donnée personnelle que je détiens sur vous — en pratique, uniquement un e-mail que vous m'auriez envoyé. Écrivez-moi et je m'en charge.",
      },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const c = content[locale as Locale];
  return { title: c.title, description: c.intro };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const c = content[l];

  return (
    <>
      <PageHeader kicker={c.kicker} title={c.title} intro={c.intro} />

      <div className="mx-auto max-w-3xl px-5 py-12">
        <p className="kicker">
          {c.updatedLabel} · {updated}
        </p>

        <div className="mt-8 space-y-8">
          {c.sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-display text-2xl tracking-tight">{s.h}</h2>
              <p className="mt-2 leading-relaxed text-muted">{s.p}</p>
            </section>
          ))}

          <section>
            <h2 className="font-display text-2xl tracking-tight">
              {c.contactTitle}
            </h2>
            <p className="mt-2 leading-relaxed text-muted">
              {c.contactBefore}
              <a
                href={`mailto:${site.email}`}
                className="text-accent hover:underline"
              >
                {site.email}
              </a>
              {c.contactAfter}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
