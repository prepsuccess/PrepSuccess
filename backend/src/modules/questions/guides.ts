/**
 * Prep guides shipped with the app (Phase 2). The PDFs are built from
 * frontend/guides/*.html into frontend/public/guides/ (`npm run guides:build`
 * in frontend/) and served by the frontend; prisma/seed.ts links them using
 * FRONTEND_URL. Admins can hide them or add more from the admin panel.
 */
export interface CatalogueGuide {
  title: string;
  description: string;
  /** File name in frontend/public/guides/. */
  file: string;
  skill?: string;
  role?: string;
  sizeLabel: string;
}

export const GUIDE_CATALOGUE: CatalogueGuide[] = [
  {
    title: "SDE interview guide",
    description:
      "How campus hiring works, a 4-week plan, the DSA and CS topics to revise, and how to talk through a coding problem.",
    file: "sde-interview-guide.pdf",
    role: "SDE",
    sizeLabel: "11 pages",
  },
  {
    title: "SQL interview guide",
    description:
      "Joins, window functions, normalisation and transactions, plus classic interview problems with solutions.",
    file: "sql-interview-guide.pdf",
    skill: "sql",
    sizeLabel: "17 pages",
  },
  {
    title: "DSA patterns cheat sheet",
    description:
      "The patterns behind most coding questions: when to use each, a JavaScript template, and problems to practise.",
    file: "dsa-patterns-cheat-sheet.pdf",
    skill: "dsa",
    sizeLabel: "12 pages",
  },
  {
    title: "Aptitude formulas and shortcuts",
    description:
      "Formulas and worked examples for quant, logical reasoning tips and a time plan for online tests.",
    file: "aptitude-formulas.pdf",
    skill: "quantitative-aptitude",
    sizeLabel: "11 pages",
  },
  {
    title: "HR and behavioural interview guide",
    description:
      'STAR answers, "Tell me about yourself", the most common HR questions with sample answers, and GD tips.',
    file: "hr-interview-guide.pdf",
    skill: "communication",
    sizeLabel: "12 pages",
  },
];
