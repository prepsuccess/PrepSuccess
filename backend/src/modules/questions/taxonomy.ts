/**
 * Fixed lists for interview-question tags, so filters don't split
 * ("TCS" vs "Tata Consultancy"). Admins pick from these; extend them here.
 */

export const COMPANIES = [
  "TCS",
  "Infosys",
  "Wipro",
  "Accenture",
  "Cognizant",
  "Capgemini",
  "HCLTech",
  "Tech Mahindra",
  "Deloitte",
  "IBM",
  "Zoho",
  "Freshworks",
  "Amazon",
  "Microsoft",
  "Google",
  "Flipkart",
  "Paytm",
  "PhonePe",
  "Swiggy",
  "Zomato",
  "Goldman Sachs",
  "JP Morgan",
] as const;

export const ROLES = [
  "SDE",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "ML Engineer",
  "DevOps Engineer",
  "QA Engineer",
  "Business Analyst",
] as const;

export type Company = (typeof COMPANIES)[number];
export type Role = (typeof ROLES)[number];
