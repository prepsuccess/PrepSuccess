/**
 * Common stacks and roles students name instead of single skills ("MERN
 * stack", "full stack", "data analytics"). Each expands to the catalogue
 * skills it's made of, so claiming "MERN" puts MongoDB, Express, React,
 * Node.js and JavaScript on the student's skill list. Offered as one-tap
 * choices in the onboarding chat, and matched in skills.logic.ts.
 * `skills` are catalogue slugs (a test checks every one exists).
 */
export interface Stack {
  name: string;
  /** Other ways students write it; matched after normalising (see normalizeSkillName). */
  aliases: string[];
  skills: string[];
}

export const STACKS: Stack[] = [
  {
    name: "MERN stack",
    aliases: ["mern"],
    skills: ["mongodb", "expressjs", "react", "nodejs", "javascript"],
  },
  {
    name: "MEAN stack",
    aliases: ["mean"],
    skills: ["mongodb", "expressjs", "nodejs", "javascript", "typescript"],
  },
  {
    name: "MEVN stack",
    aliases: ["mevn"],
    skills: ["mongodb", "expressjs", "nodejs", "javascript"],
  },
  {
    name: "PERN stack",
    aliases: ["pern"],
    skills: ["sql", "expressjs", "react", "nodejs", "javascript"],
  },
  {
    name: "Frontend development",
    aliases: [
      "frontend",
      "front end",
      "frontend developer",
      "front end developer",
      "ui development",
    ],
    skills: ["html", "css", "javascript", "react"],
  },
  {
    name: "Backend development",
    aliases: ["backend", "back end", "backend developer", "back end developer"],
    skills: ["nodejs", "expressjs", "rest-apis", "sql"],
  },
  {
    name: "Full stack web development",
    aliases: [
      "full stack",
      "fullstack",
      "full stack developer",
      "full stack development",
      "web development",
      "web developer",
      "web dev",
    ],
    skills: ["html", "css", "javascript", "react", "nodejs", "expressjs", "sql"],
  },
  {
    name: "Java full stack",
    aliases: ["java full stack", "java fullstack", "java full stack developer"],
    skills: ["java", "oop", "sql", "html", "css", "javascript"],
  },
  {
    name: "Python full stack",
    aliases: ["python full stack", "python fullstack"],
    skills: ["python", "sql", "html", "css", "javascript"],
  },
  {
    name: "Data analytics",
    aliases: ["data analytics", "data analyst"],
    skills: ["excel", "sql", "python", "data-analysis-python"],
  },
  {
    name: "Data science",
    aliases: ["data science", "data scientist", "ai ml", "ai and ml"],
    skills: ["python", "data-analysis-python", "machine-learning", "sql"],
  },
];
