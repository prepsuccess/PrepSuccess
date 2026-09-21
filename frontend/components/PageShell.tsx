interface PageShellProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <main className="bg-background flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-foreground text-3xl font-semibold tracking-tight">{title}</h1>
      {description ? <p className="text-muted-foreground max-w-md">{description}</p> : null}
      {children}
    </main>
  );
}
