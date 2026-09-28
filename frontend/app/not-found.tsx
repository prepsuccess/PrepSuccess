import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { Annotation, Circled, SketchIcon } from "@/components/ui/Annotation";
import MarketingLayout from "@/app/(marketing)/layout";

export const metadata: Metadata = { title: "Page not found — PrepSuccess" };

export default function NotFound() {
  return (
    <MarketingLayout>
      <Panel flushTop className="pt-[150px] pb-24 sm:pt-[180px] sm:pb-32">
        <Container>
          <div className="relative mx-auto flex max-w-[720px] flex-col items-center text-center">
            <SketchIcon
              now
              name="question"
              delay={0.2}
              className="text-accent h-20 w-20 -rotate-6"
            />

            <p className="text-text-dim mt-6 font-mono text-[11px] tracking-[0.14em] uppercase">
              Error 404
            </p>

            <h1 className="text-h2 mt-4">
              This page isn&apos;t on the{" "}
              <Circled now delay={0.8}>
                syllabus
              </Circled>
              .
            </h1>

            <p className="mt-5 max-w-[46ch] text-[17px]">
              The link may be broken, or the page hasn&apos;t been built yet — the legal pages are
              still on the way.
            </p>

            <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button href="/" label="Back to home" />
              <Button href="/#how-it-works" label="See how it works" variant="secondary" />
              <Annotation
                now
                delay={1.6}
                arrow="right"
                layout="label-left"
                tilt="-rotate-[4deg]"
                label={"back to\nsafety"}
                className="top-1/2 right-[calc(100%+12px)] -translate-y-1/2"
                arrowClassName="h-[48px] w-[84px]"
              />
            </div>
          </div>
        </Container>
      </Panel>
    </MarketingLayout>
  );
}
