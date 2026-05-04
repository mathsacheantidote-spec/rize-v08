// Mock data for the Employability → Job Trends dashboard.
// Every dataset is intentionally static and realistic.
// TODO: replace each export with a real API call (e.g. GET /trends/...)

export type Industry = "All" | "Technology" | "Finance" | "Healthcare" | "Retail" | "Education";
export type RoleType = "All" | "Full-time" | "Internship" | "Contract" | "Part-time";
export type ExperienceLevel = "All" | "Entry" | "Mid" | "Senior" | "Lead";
export type Location = "All" | "Bengaluru" | "Hyderabad" | "Pune" | "Mumbai" | "Delhi NCR" | "Remote";

export interface TrendsFilters {
  industry: Industry;
  roleType: RoleType;
  experience: ExperienceLevel;
  location: Location;
}

export const DEFAULT_FILTERS: TrendsFilters = {
  industry: "All",
  roleType: "All",
  experience: "All",
  location: "All",
};

// TODO: replace with API call to GET /trends/roles
export const TRENDING_ROLES = [
  { role: "Software Engineer", openings: 4820, industries: ["Technology", "Finance"] },
  { role: "Data Analyst", openings: 3140, industries: ["Technology", "Finance", "Retail"] },
  { role: "Product Manager", openings: 2210, industries: ["Technology", "Retail"] },
  { role: "DevOps Engineer", openings: 1980, industries: ["Technology"] },
  { role: "UX Designer", openings: 1640, industries: ["Technology", "Retail"] },
  { role: "Data Scientist", openings: 1520, industries: ["Technology", "Finance", "Healthcare"] },
  { role: "Frontend Engineer", openings: 1410, industries: ["Technology"] },
  { role: "ML Engineer", openings: 1180, industries: ["Technology", "Healthcare"] },
  { role: "QA Engineer", openings: 990, industries: ["Technology", "Finance"] },
  { role: "Cloud Architect", openings: 870, industries: ["Technology", "Finance"] },
];

// TODO: replace with API call to GET /trends/skills
export const IN_DEMAND_SKILLS = [
  { skill: "Python", demand: 92 },
  { skill: "React", demand: 88 },
  { skill: "AWS", demand: 84 },
  { skill: "SQL", demand: 81 },
  { skill: "TypeScript", demand: 76 },
  { skill: "Kubernetes", demand: 68 },
  { skill: "Docker", demand: 64 },
  { skill: "Figma", demand: 58 },
  { skill: "Tableau", demand: 52 },
  { skill: "Go", demand: 47 },
];

// TODO: replace with API call to GET /trends/hiring-activity?range=6m
export const HIRING_ACTIVITY = [
  { month: "Dec", postings: 8200 },
  { month: "Jan", postings: 9450 },
  { month: "Feb", postings: 10120 },
  { month: "Mar", postings: 11380 },
  { month: "Apr", postings: 12600 },
  { month: "May", postings: 13950 },
];

// TODO: replace with API call to GET /trends/salary
export const SALARY_INSIGHTS = [
  { role: "SWE", min: 8, median: 16, max: 32 },
  { role: "Data Analyst", min: 6, median: 12, max: 22 },
  { role: "PM", min: 14, median: 24, max: 48 },
  { role: "DevOps", min: 10, median: 18, max: 36 },
  { role: "UX", min: 7, median: 14, max: 28 },
  { role: "Data Sci.", min: 12, median: 22, max: 44 },
];

// TODO: replace with API call to GET /trends/who-is-hiring
export const EXPERIENCE_BREAKDOWN = [
  { name: "Entry", value: 38 },
  { name: "Mid", value: 34 },
  { name: "Senior", value: 21 },
  { name: "Lead", value: 7 },
];

export const TOP_COMPANIES = [
  { name: "Acme Cloud", openings: 412 },
  { name: "Northwind Tech", openings: 367 },
  { name: "Bluepeak Labs", openings: 298 },
  { name: "Helios Finance", openings: 254 },
  { name: "Vertex Health", openings: 211 },
];

export const TOP_LOCATIONS = [
  { city: "Bengaluru", openings: 5840 },
  { city: "Hyderabad", openings: 3920 },
  { city: "Pune", openings: 2710 },
  { city: "Mumbai", openings: 2180 },
  { city: "Delhi NCR", openings: 1960 },
  { city: "Remote", openings: 4120 },
];

// TODO: replace with API call to GET /trends/active-openings
export const ACTIVE_OPENINGS = {
  total: 42_815,
  changePct: 8.4, // vs previous month
};
