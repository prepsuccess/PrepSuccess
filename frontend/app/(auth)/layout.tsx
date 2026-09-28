import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Panel } from "@/components/ui/Panel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Panel flushTop className="flex flex-1 flex-col pb-16">
        <Container className="flex items-center justify-between py-6">
          <Logo />
          <span className="group">
            <ArrowLink href="/" label="Back to site" />
          </span>
        </Container>
        <main className="flex flex-1 items-center justify-center px-4 pt-6 sm:pt-10">
          {children}
        </main>
      </Panel>
      <p className="text-text-dim py-6 text-center text-[13px]">
        © {new Date().getFullYear()} PrepSuccess
      </p>
    </div>
  );
}
