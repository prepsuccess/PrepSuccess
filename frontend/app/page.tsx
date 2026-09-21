import Link from "next/link";

const links = [
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Sign up" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/assessment", label: "Assessment" },
  { href: "/profile", label: "Profile" },
];

export default function Home() {
  return (
    <main className="bg-background flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-4xl font-semibold tracking-tight">PrepSuccess</h1>
        <p className="text-muted-foreground max-w-md">
          Where do you stand, and where can you go? Placement readiness for college students.
        </p>
      </div>
      <nav className="flex flex-wrap items-center justify-center gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-full px-5 py-2 text-sm font-medium transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
