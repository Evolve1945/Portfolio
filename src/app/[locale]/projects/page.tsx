import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageHeader } from "@/components/page-header";
import { ProjectCard } from "@/components/project-card";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { projects } from "@/data/projects";
import { themeLabel, type Theme } from "@/data/taxonomy";

const themeOrder: Theme[] = ["ai", "web", "academic", "creative"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.projects" });
  return { title: t("title"), description: t("intro") };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations("pages.projects");

  return (
    <>
      <PageHeader kicker={t("kicker")} title={t("title")} intro={t("intro")} />

      <div className="mx-auto max-w-6xl space-y-12 px-5 py-12">
        {themeOrder.map((theme) => {
          const items = projects.filter((p) => p.theme === theme);
          if (items.length === 0) return null;
          return (
            <section key={theme}>
              <h2 className="kicker mb-4">{themeLabel[theme][l]}</h2>
              <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <StaggerItem key={p.slug} className="h-full">
                    <ProjectCard project={p} locale={l} />
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          );
        })}
      </div>
    </>
  );
}
