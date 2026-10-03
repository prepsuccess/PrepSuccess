import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/marketing/sections/PageHero";
import type { LegalDocument } from "@/lib/content/legal";

/** Terms and Privacy: the page hero, then numbered sections in a readable column. */
export function LegalPage({ doc }: { doc: LegalDocument }) {
  return (
    <>
      <PageHero
        eyebrow={doc.eyebrow}
        title={doc.title}
        description={doc.description}
        meta={`Last updated ${doc.updated}`}
      />
      <Section padding="100x100">
        <article className="mx-auto max-w-[720px] space-y-12">
          {doc.sections.map((section) => (
            <section key={section.title} aria-labelledby={slug(section.title)}>
              <h2 id={slug(section.title)} className="text-h5 mb-4">
                {section.title}
              </h2>
              <div className="space-y-4 text-[16px] leading-relaxed">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.points ? (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </article>
      </Section>
    </>
  );
}

const slug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
