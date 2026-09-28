// A placement season, told in second person. Every beat comes from the problem
// statement in docs/PROJECT_CONTEXT.md.
export type StoryCard = "prep" | "application" | "shortlist" | "result" | "ready";

export const story = {
  hero: {
    body: "Every year, thousands of students from BCA, B.Tech and similar courses walk into placement season working hard — and still guessing. This is that season, one screen at a time, and why we built PrepSuccess.",
  },
  chapters: [
    {
      label: "The prep",
      when: "third year\njanuary",
      title: "Three plans, and no picture.",
      body: "A DSA sheet from a senior. An aptitude playlist on YouTube. A resume template someone forwarded. Technical, aptitude and soft skills, prepared as three separate efforts — with nothing tying them into one readiness picture.",
      card: "prep",
    },
    {
      label: "The application",
      when: "final year\naugust",
      title: "You apply to the campus drive.",
      body: "The form asks for your roll number, your branch and your CGPA. It never asks what you can actually do — and nothing tells you whether you're ready for the role you just applied to.",
      card: "application",
    },
    {
      label: "The shortlist",
      when: "final year\nseptember",
      title: "The shortlist lands in the group chat.",
      body: "You open the PDF and search for your roll number. No match. No score, no reason, no hint of which filter you fell through — just a list you're not on.",
      card: "shortlist",
    },
    {
      label: "The interview",
      when: "final year\noctober",
      title: "Next drive, you reach the technical round.",
      body: "You walk in having prepared everything, and nothing in particular. Two days later the portal updates: not selected. The feedback field is empty. It usually is.",
      card: "result",
    },
    {
      label: "This time",
      when: "next drive\nnovember",
      title: "This time, you know where you stand.",
      body: "Before the next drive, you know which topics are ready and which aren't — so you spend your evenings on the ones that count, not on guessing.",
      card: "ready",
    },
  ] satisfies { label: string; when: string; title: string; body: string; card: StoryCard }[],
  pivot: {
    body: "Without a placement cell, experienced mentors or peer benchmarks, most students genuinely can't tell whether they're behind or on track — until an interview tells them the hard way. So we asked a simpler question: what if you found out first?",
  },
};
