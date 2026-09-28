import type { Metadata } from "next";
import { Annotation, Circled } from "@/components/ui/Annotation";
import { StatusGlyph } from "@/components/ui/MiniUI";
import { Panel } from "@/components/ui/Panel";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Taped } from "@/components/ui/Taped";
import { Reveal } from "@/components/motion/Reveal";
import { PageHero } from "@/components/marketing/sections/PageHero";
import { FeatureRow } from "@/components/marketing/sections/FeatureRow";
import { Pillars } from "@/components/marketing/sections/Pillars";
import { AskVisual } from "@/components/marketing/sections/FAQ";
import { CTA } from "@/components/marketing/sections/CTA";
import { trust, type Access } from "@/lib/content";

export const metadata: Metadata = {
  title: "Trust & data — PrepSuccess",
  description:
    "Who can see what on PrepSuccess: the AI sticks to your own results, mentors see only what a session needs, and our team sees totals.",
};

function Cell({ value }: { value: Access }) {
  if (value === "yes")
    return (
      <span className="text-heading inline-flex items-center gap-2">
        <StatusGlyph status="mastered" /> Yes
      </span>
    );
  if (value === "no")
    return (
      <span className="text-text-dim">
        —<span className="sr-only">No</span>
      </span>
    );
  return <span className="text-text text-[13px]">{value}</span>;
}

function PermissionsTable() {
  const roles = ["Student", "Mentor", "Our team"] as const;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-[15px]">
        <thead>
          <tr className="border-heading border-y">
            <th className="text-text-dim py-3.5 pr-4 text-[12px] font-normal tabular-nums">
              Capability
            </th>
            {roles.map((role) => (
              <th key={role} className="text-h6 w-[22%] py-3.5 pr-4">
                {role}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trust.permissions.map((row) => (
            <tr
              key={row.capability}
              className="border-border hover:bg-surface border-b transition-colors"
            >
              <th scope="row" className="text-heading py-4 pr-4 font-medium">
                {row.capability}
              </th>
              <td className="py-4 pr-4">
                <Cell value={row.student} />
              </td>
              <td className="py-4 pr-4">
                <Cell value={row.mentor} />
              </td>
              <td className="py-4 pr-4">
                <Cell value={row.admin} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TrustPage() {
  return (
    <>
      <PageHero
        eyebrow="trust & data"
        title={
          <>
            Your data answers to{" "}
            <Circled now delay={0.7}>
              you
            </Circled>
            .
          </>
        }
        description={trust.description}
        note={
          <Annotation
            now
            delay={2}
            arrow="down-left"
            tilt="rotate-[5deg]"
            label={"who sees what,\nin plain words"}
            className="-right-[6%] -bottom-24"
            labelClassName="pl-14"
            arrowClassName="h-[60px] w-[96px]"
          />
        }
      />

      <Pillars
        padding="120x120"
        title="Three rules, built in"
        description="Every role sees what its job needs, and nothing more."
        items={trust.principles}
        sketches={["target", "box", "book"]}
      />

      <Panel>
        <Section>
          <SectionTitle
            title="Who can see what"
            description="Students, mentors and our team, side by side."
          />
          <Reveal offset={10}>
            <PermissionsTable />
          </Reveal>
        </Section>
      </Panel>

      <FeatureRow
        eyebrow="The AI"
        title="It can only talk about what's real."
        body="Ask the AI why a topic was flagged and it points at your own answers — the score, the pass mark, the mistakes. It never gives you a skill you didn't claim, or a score you didn't earn."
        points={[
          "No skills you didn't claim",
          "No scores you didn't earn",
          "Explanations point at your actual answers",
        ]}
        visual={
          <Taped tilt="rotate-[1deg]">
            <AskVisual />
          </Taped>
        }
      />

      <Panel>
        <Pillars
          padding="120x120"
          title="Safe by default"
          description="The basics, done properly."
          items={trust.security}
          sketches={["box", "tick", "target", "question"]}
        />
      </Panel>

      <CTA />
    </>
  );
}
