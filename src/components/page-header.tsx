import { SiteBackground } from "@/components/systems/site-background";

export function PageHeader({
  kicker,
  title,
  intro,
}: {
  kicker: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <SiteBackground />
      <div className="relative mx-auto max-w-6xl px-5 py-14">
        <span className="kicker">{kicker}</span>
        <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
          {title}
        </h1>
        {intro ? (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            {intro}
          </p>
        ) : null}
      </div>
    </section>
  );
}
