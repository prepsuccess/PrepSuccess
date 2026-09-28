import { type ReactNode } from "react";
import { Container } from "@/components/ui/Container";

const paddings = {
  "120x120": "py-[60px] md:py-20 lg:py-[120px]",
  "100x120": "pt-10 pb-[60px] md:pt-20 md:pb-20 lg:pt-[100px] lg:pb-[120px]",
  "100x100": "py-10 md:py-20 lg:py-[100px]",
  "120x0": "pt-[60px] md:pt-20 lg:pt-[120px]",
} as const;

export function Section({
  id,
  children,
  padding = "120x120",
  className = "",
}: {
  id?: string;
  children: ReactNode;
  padding?: keyof typeof paddings;
  className?: string;
}) {
  return (
    <section id={id} className={`relative scroll-mt-28 ${paddings[padding]} ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}
