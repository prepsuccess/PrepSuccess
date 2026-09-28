export type NavLink = { label: string; href: string; description?: string };

export type Point = { title: string; description: string };

export const site = {
  email: "preparationssuccess@gmail.com",
};

/** Pages behind the navbar's Product dropdown. */
export const productLinks: NavLink[] = [
  { label: "How it works", href: "/how-it-works", description: "Each step, explained" },
  {
    label: "Skill tracks",
    href: "/skill-tracks",
    description: "Technical, aptitude and soft skills",
  },
  { label: "For mentors", href: "/mentors", description: "1:1 sessions · coming soon" },
  { label: "Trust & data", href: "/trust", description: "Who sees what, and why" },
];

export const overviewLink: NavLink = { label: "Overview", href: "/" };

/** Top-level links that sit after the Product dropdown. */
export const navLinks: NavLink[] = [
  { label: "Roadmap", href: "/roadmap" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: "Product",
    links: [overviewLink, productLinks[0], productLinks[1], { label: "Pricing", href: "/pricing" }],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Our story", href: "/story" },
      { label: "Roadmap", href: "/roadmap" },
      productLinks[2],
      productLinks[3],
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];
