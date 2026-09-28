import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { DrawScope, HoverScribble, SketchIcon } from "@/components/ui/Annotation";
import { footerColumns, site } from "@/lib/content";

export function Footer() {
  return (
    <footer className="pt-[60px] lg:pt-[120px]">
      <Container>
        <div className="flex flex-wrap justify-between gap-10 pb-4">
          <Reveal className="flex max-w-[300px] flex-col gap-6">
            <Logo />
            <p>
              An AI placement coach for college students — know where you stand, and what to do
              next.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="group text-heading -mt-2 self-start text-[15px] font-medium break-all"
            >
              <HoverScribble>{site.email}</HoverScribble>
            </a>
            <DrawScope className="flex -rotate-2 items-end gap-1.5">
              <span
                className="ink font-marker text-accent text-[17px] leading-tight whitespace-pre"
                style={{ "--d": "0.3s" } as React.CSSProperties}
              >
                {"good luck with your\nplacements!"}
              </span>
              <SketchIcon
                name="heart"
                delay={0.9}
                className="text-accent mb-0.5 h-7 w-7 -rotate-6"
              />
            </DrawScope>
          </Reveal>

          <div className="flex flex-wrap gap-x-20 gap-y-10">
            {footerColumns.map((column, i) => (
              <Reveal
                key={column.title}
                delay={0.1 * (i + 1)}
                className="flex min-w-[140px] flex-col gap-4"
              >
                <h2 className="text-h6">{column.title}</h2>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group hover:text-heading transition-colors duration-300"
                      >
                        <HoverScribble>{link.label}</HoverScribble>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="border-border mt-12 flex flex-wrap items-center justify-between gap-6 border-t pt-4 pb-6 text-sm">
          <span>© {new Date().getFullYear()} PrepSuccess. All rights reserved.</span>
          <span className="text-text-dim">First month free</span>
        </div>
      </Container>
    </footer>
  );
}
