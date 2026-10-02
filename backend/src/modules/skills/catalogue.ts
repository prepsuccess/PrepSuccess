import type { SkillCategory } from "../../generated/prisma/client.js";

/**
 * The Phase 1 skill catalogue, seeded into `skills` by prisma/seed.ts (upsert
 * by slug, so re-seeding is safe). `aliases` are the ways students name the
 * skill in the onboarding chat; skills.logic.ts matches claims against them.
 * Admins will own this taxonomy later (PRD-04); until then, edit it here.
 */
export interface CatalogueSkill {
  slug: string;
  name: string;
  category: SkillCategory;
  topic: string;
  description: string;
  aliases: string[];
}

export const SKILL_CATALOGUE: CatalogueSkill[] = [
  // Web development
  {
    slug: "html",
    name: "HTML",
    category: "TECHNICAL",
    topic: "Web development",
    description: "Page structure, semantic elements, forms, tables and accessibility basics.",
    aliases: ["html5", "html 5"],
  },
  {
    slug: "css",
    name: "CSS",
    category: "TECHNICAL",
    topic: "Web development",
    description: "Selectors, the box model, flexbox, grid, positioning and responsive design.",
    aliases: ["css3", "css 3", "flexbox", "responsive design"],
  },
  {
    slug: "javascript",
    name: "JavaScript",
    category: "TECHNICAL",
    topic: "Web development",
    description: "Types, functions, closures, the DOM, events, promises and async/await.",
    aliases: ["js", "es6", "vanilla js", "vanilla javascript", "ecmascript"],
  },
  {
    slug: "typescript",
    name: "TypeScript",
    category: "TECHNICAL",
    topic: "Web development",
    description: "Static types, interfaces, generics, unions and type narrowing.",
    aliases: ["ts"],
  },
  {
    slug: "react",
    name: "React",
    category: "TECHNICAL",
    topic: "Web development",
    description: "Components, props, state, hooks, effects and rendering lists.",
    aliases: ["reactjs", "react js", "react.js"],
  },
  {
    slug: "nodejs",
    name: "Node.js",
    category: "TECHNICAL",
    topic: "Backend development",
    description: "The event loop, modules, npm, file system and building HTTP servers.",
    aliases: ["node", "node js", "node.js"],
  },
  {
    slug: "expressjs",
    name: "Express.js",
    category: "TECHNICAL",
    topic: "Backend development",
    description: "Routing, middleware, request handling and error handling in Express.",
    aliases: ["express", "express js"],
  },
  {
    slug: "rest-apis",
    name: "REST APIs",
    category: "TECHNICAL",
    topic: "Backend development",
    description: "HTTP methods, status codes, resource design, JSON and authentication basics.",
    aliases: ["rest", "rest api", "api", "apis", "restful apis", "http"],
  },

  // Programming languages
  {
    slug: "python",
    name: "Python",
    category: "TECHNICAL",
    topic: "Programming languages",
    description: "Syntax, data types, lists, dicts, functions, classes and exceptions.",
    aliases: ["python3", "python 3", "py"],
  },
  {
    slug: "java",
    name: "Java",
    category: "TECHNICAL",
    topic: "Programming languages",
    description: "Classes, inheritance, interfaces, collections, exceptions and strings.",
    aliases: ["core java", "java se"],
  },
  {
    slug: "c",
    name: "C",
    category: "TECHNICAL",
    topic: "Programming languages",
    description: "Pointers, arrays, strings, structs, memory and control flow.",
    aliases: ["c language", "c programming"],
  },
  {
    slug: "cpp",
    name: "C++",
    category: "TECHNICAL",
    topic: "Programming languages",
    description: "Classes, references, the STL, templates and memory management.",
    aliases: ["c++", "cpp", "c plus plus", "stl"],
  },

  // CS fundamentals
  {
    slug: "dsa",
    name: "Data structures & algorithms",
    category: "TECHNICAL",
    topic: "CS fundamentals",
    description:
      "Arrays, linked lists, stacks, queues, trees, graphs, sorting, searching and Big-O.",
    aliases: [
      "dsa",
      "data structures",
      "algorithms",
      "data structures and algorithms",
      "ds algo",
      "ds and algo",
      "competitive programming",
    ],
  },
  {
    slug: "oop",
    name: "Object-oriented programming",
    category: "TECHNICAL",
    topic: "CS fundamentals",
    description: "Encapsulation, inheritance, polymorphism, abstraction and SOLID basics.",
    aliases: ["oops", "oop", "object oriented programming", "oops concepts"],
  },
  {
    slug: "operating-systems",
    name: "Operating systems",
    category: "TECHNICAL",
    topic: "CS fundamentals",
    description: "Processes, threads, scheduling, deadlocks, memory management and paging.",
    aliases: ["os", "operating system"],
  },
  {
    slug: "computer-networks",
    name: "Computer networks",
    category: "TECHNICAL",
    topic: "CS fundamentals",
    description: "OSI and TCP/IP models, IP addressing, TCP vs UDP, DNS and HTTP.",
    aliases: ["cn", "networking", "computer networking", "networks"],
  },
  {
    slug: "dbms",
    name: "DBMS",
    category: "TECHNICAL",
    topic: "Databases",
    description: "ER models, keys, normalisation, transactions, ACID and indexing.",
    aliases: ["database management systems", "databases", "database", "rdbms"],
  },
  {
    slug: "sql",
    name: "SQL",
    category: "TECHNICAL",
    topic: "Databases",
    description: "SELECT, joins, GROUP BY, subqueries, constraints and basic optimisation.",
    aliases: ["mysql", "postgresql", "postgres", "sql queries", "oracle sql", "plsql"],
  },
  {
    slug: "mongodb",
    name: "MongoDB",
    category: "TECHNICAL",
    topic: "Databases",
    description: "Documents, collections, CRUD queries, indexes and aggregation basics.",
    aliases: ["mongo", "nosql"],
  },
  {
    slug: "system-design",
    name: "System design basics",
    category: "TECHNICAL",
    topic: "CS fundamentals",
    description: "Scalability, caching, load balancing, databases and API design trade-offs.",
    aliases: ["system design", "hld", "lld", "low level design", "high level design"],
  },

  // Tools
  {
    slug: "git",
    name: "Git & GitHub",
    category: "TECHNICAL",
    topic: "Tools",
    description: "Commits, branches, merging, resolving conflicts and pull requests.",
    aliases: ["git", "github", "version control", "git and github"],
  },
  {
    slug: "linux",
    name: "Linux & shell",
    category: "TECHNICAL",
    topic: "Tools",
    description: "Files and permissions, common commands, pipes and simple shell scripts.",
    aliases: ["linux", "bash", "shell", "shell scripting", "unix", "linux commands"],
  },

  // Data & AI
  {
    slug: "excel",
    name: "Excel",
    category: "TECHNICAL",
    topic: "Data & AI",
    description: "Formulas, lookups, pivot tables, charts and cleaning data.",
    aliases: ["ms excel", "microsoft excel", "advanced excel", "spreadsheets"],
  },
  {
    slug: "data-analysis-python",
    name: "Data analysis with Python",
    category: "TECHNICAL",
    topic: "Data & AI",
    description: "pandas and NumPy for loading, cleaning, grouping and summarising data.",
    aliases: ["pandas", "numpy", "data analysis", "data analytics"],
  },
  {
    slug: "machine-learning",
    name: "Machine learning basics",
    category: "TECHNICAL",
    topic: "Data & AI",
    description: "Supervised vs unsupervised learning, regression, classification and evaluation.",
    aliases: ["ml", "machine learning", "ai ml", "aiml", "ai and ml", "scikit learn"],
  },
  {
    slug: "cloud-basics",
    name: "Cloud basics",
    category: "TECHNICAL",
    topic: "Tools",
    description: "Compute, storage, networking and deployment on AWS, Azure or GCP.",
    aliases: ["cloud", "cloud computing", "aws", "azure", "gcp", "google cloud"],
  },

  // Aptitude
  {
    slug: "quantitative-aptitude",
    name: "Quantitative aptitude",
    category: "APTITUDE",
    topic: "Aptitude",
    description: "Percentages, ratios, profit and loss, time and work, speed and distance.",
    aliases: ["quant", "quants", "aptitude", "maths", "math", "mathematics", "quantitative"],
  },
  {
    slug: "logical-reasoning",
    name: "Logical reasoning",
    category: "APTITUDE",
    topic: "Aptitude",
    description: "Series, coding-decoding, blood relations, syllogisms and arrangements.",
    aliases: ["reasoning", "logical", "logic", "analytical reasoning"],
  },
  {
    slug: "verbal-ability",
    name: "Verbal ability",
    category: "APTITUDE",
    topic: "Aptitude",
    description: "Grammar, vocabulary, sentence correction and reading comprehension.",
    aliases: ["verbal", "english", "english grammar", "grammar", "vocabulary"],
  },
  {
    slug: "data-interpretation",
    name: "Data interpretation",
    category: "APTITUDE",
    topic: "Aptitude",
    description: "Reading tables, bar charts, line graphs and pie charts to answer questions.",
    aliases: ["di", "data interpretation"],
  },

  // Soft skills (situational questions)
  {
    slug: "communication",
    name: "Communication",
    category: "SOFT",
    topic: "Soft skills",
    description: "Clear speaking and writing, listening, and explaining ideas simply.",
    aliases: ["communication skills", "english communication", "public speaking", "presentation"],
  },
  {
    slug: "teamwork",
    name: "Teamwork",
    category: "SOFT",
    topic: "Soft skills",
    description: "Collaborating, sharing work, handling disagreement and giving credit.",
    aliases: ["team work", "collaboration", "team player"],
  },
  {
    slug: "problem-solving",
    name: "Problem solving",
    category: "SOFT",
    topic: "Soft skills",
    description: "Breaking problems down, weighing options and deciding under constraints.",
    aliases: ["problem solving skills", "critical thinking", "analytical thinking"],
  },
  {
    slug: "time-management",
    name: "Time management",
    category: "SOFT",
    topic: "Soft skills",
    description: "Prioritising, planning, meeting deadlines and avoiding overcommitment.",
    aliases: ["time management skills", "prioritisation", "prioritization"],
  },
  {
    slug: "leadership",
    name: "Leadership",
    category: "SOFT",
    topic: "Soft skills",
    description: "Taking ownership, guiding a group and making decisions others can follow.",
    aliases: ["leadership skills", "team leadership"],
  },
  {
    slug: "workplace-etiquette",
    name: "Workplace etiquette",
    category: "SOFT",
    topic: "Soft skills",
    description: "Professional emails, meetings, feedback and conduct at work.",
    aliases: ["professionalism", "email writing", "professional communication", "etiquette"],
  },
];
