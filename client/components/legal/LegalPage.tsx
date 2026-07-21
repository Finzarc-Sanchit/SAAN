import { Container } from '@/components/ui/Container';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { SizeGuideCharts } from '@/components/product/SizeGuideCharts';
import type {
  PolicyList,
  PolicyPageContent,
  PolicyParagraph,
  PolicySection,
  PolicySubsection,
} from '@/lib/site-policies';
import type { SizeChart } from '@/lib/size-guide';

function ParagraphBlock({ block }: { block: PolicyParagraph }) {
  return <p className="text-body text-neutral-700">{block.text}</p>;
}

function ListBlock({ block }: { block: PolicyList }) {
  return (
    <ul className="space-y-3">
      {block.items.map((item) => (
        <li key={item} className="text-body text-neutral-700">
          {item}
        </li>
      ))}
    </ul>
  );
}

function SubsectionBlock({ block }: { block: PolicySubsection }) {
  return (
    <div className="space-y-4">
      <h3 className="text-h3 text-ink">{block.title}</h3>
      <div className="space-y-4">
        {block.blocks.map((child, index) =>
          child.type === 'paragraph' ? (
            <ParagraphBlock key={`sub-p-${index}`} block={child} />
          ) : (
            <ListBlock key={`sub-l-${index}`} block={child} />
          ),
        )}
      </div>
    </div>
  );
}

function SectionBlock({ section, index }: { section: PolicySection; index: number }) {
  return (
    <ScrollReveal delay={index * 0.04}>
      <section className="space-y-5">
        {section.title ? <h2 className="text-h3 text-ink">{section.title}</h2> : null}
        <div className="space-y-5">
          {section.blocks.map((block, blockIndex) => {
            if (block.type === 'paragraph') {
              return <ParagraphBlock key={`p-${blockIndex}`} block={block} />;
            }
            if (block.type === 'list') {
              return <ListBlock key={`l-${blockIndex}`} block={block} />;
            }
            return <SubsectionBlock key={`s-${blockIndex}`} block={block} />;
          })}
        </div>
      </section>
    </ScrollReveal>
  );
}

export function LegalPage({ content }: { content: PolicyPageContent }) {
  return (
    <main>
      <section className="bg-paper pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-24">
        <Container>
          <ScrollReveal className="mx-auto max-w-3xl">
            <h1 className="text-display-l text-ink">{content.title}</h1>
            <p className="text-body-l mt-5 text-neutral-700">{content.description}</p>
          </ScrollReveal>

          <div className="mx-auto mt-12 max-w-3xl space-y-12 border-t border-neutral-300 pt-10 lg:mt-16 lg:space-y-14 lg:pt-12">
            {content.sections.map((section, index) => (
              <SectionBlock key={section.title ?? `section-${index}`} section={section} index={index} />
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}

export function SizeGuidePageContent({
  title,
  description,
  charts,
  note,
}: {
  title: string;
  description: string;
  charts: readonly SizeChart[];
  note: string;
}) {
  return (
    <main>
      <section className="bg-paper pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-24">
        <Container>
          <ScrollReveal className="mx-auto max-w-4xl">
            <h1 className="text-display-l text-ink">{title}</h1>
            <p className="text-body-l mt-5 text-neutral-700">{description}</p>
          </ScrollReveal>

          <div className="mx-auto mt-12 max-w-4xl border-t border-neutral-300 pt-10 lg:mt-16 lg:pt-12">
            <ScrollReveal>
              <SizeGuideCharts charts={charts} />
            </ScrollReveal>

            <ScrollReveal>
              <p className="text-body mt-10 text-neutral-700">{note}</p>
            </ScrollReveal>
          </div>
        </Container>
      </section>
    </main>
  );
}
