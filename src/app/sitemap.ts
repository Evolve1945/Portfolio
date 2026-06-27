import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { site } from "@/data/site";
import { projects } from "@/data/projects";
import { getNotes } from "@/lib/notes";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/about",
    "/projects",
    "/skills",
    "/rncp",
    "/journey",
    "/notes",
    "/now",
    "/cv",
    "/contact",
  ];
  const dynamic = [
    ...projects.map((p) => `/projects/${p.slug}`),
    ...getNotes().map((n) => `/notes/${n.slug}`),
  ];
  const all = [...staticPaths, ...dynamic];

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    for (const path of all) {
      entries.push({
        url: `${site.url}/${locale}${path}`,
        changeFrequency: "weekly",
        priority: path === "" ? 1 : 0.7,
      });
    }
  }
  return entries;
}
