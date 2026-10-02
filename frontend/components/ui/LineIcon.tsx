/** 16px line icons for UI chrome. Monochrome; inherit currentColor. */
const paths = {
  checklist: "M3 4.5h1.5M3 8h1.5M3 11.5h1.5M7 4.5h6M7 8h6M7 11.5h4",
  gauge: "M2.5 11.5a5.5 5.5 0 0 1 11 0M8 11.5l2.6-3.2",
  receipt: "M4 2.5h8v11l-1.6-1-1.2 1-1.2-1-1.2 1-1.2-1-1.6 1zM6 6h4M6 8.5h4",
  resume: "M4.5 2.5h5l2.5 2.5v8.5h-7.5zM9.5 2.5V5H12M6.5 8h4M6.5 10.5h3",
  aptitude:
    "M3.5 12.5l9-9M4.75 6.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5zM11.25 12.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5z",
  code: "M6 4.5 2.5 8 6 11.5M10 4.5 13.5 8 10 11.5",
  chat: "M2.5 3.5h11v7.5H7l-3 2.5V11H2.5z",
  person: "M8 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 13.5c.9-2.4 2.8-3.6 5-3.6s4.1 1.2 5 3.6",
  track: "M2.5 8h11M4 5.5v5M8 5.5v5M12 5.5v5",
  send: "M3 8h9M8.5 4.5 12 8l-3.5 3.5",
  check: "M3.5 8.5 6.5 11.5 12.5 4.5",
  shield: "M8 2.5 12.5 4v3.5c0 3-2 5-4.5 6-2.5-1-4.5-3-4.5-6V4zM6 8l1.5 1.5L10.5 6.5",
  chevron: "M4.5 6.5 8 10l3.5-3.5",
  plus: "M8 3v10M3 8h10",
  close: "M3.5 3.5l9 9M12.5 3.5l-9 9",
  logout: "M6.5 2.5h-3v11h3M10 5l3 3-3 3M13 8H6",
  grid: "M2.5 2.5h4.5v4.5H2.5zM9 2.5h4.5v4.5H9zM2.5 9h4.5v4.5H2.5zM9 9h4.5v4.5H9z",
  menu: "M2.5 4.5h11M2.5 8h11M2.5 11.5h11",
  alert: "M8 2.5 14 13H2zM8 6.5v3M8 11.25v.01",
} as const;

export type LineIconName = keyof typeof paths;

export function LineIcon({
  name,
  className = "h-4 w-4",
}: {
  name: LineIconName;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d={paths[name]}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
