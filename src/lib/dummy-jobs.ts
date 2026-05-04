import type { Job } from "@/hooks/useJobListings";

// Dummy job openings used as a guaranteed fallback so users can always try
// Easy Apply (with a stored resume) or open the original posting on
// LinkedIn / Indeed / Naukri via the manual external link.
export const DUMMY_JOBS: Job[] = [
  {
    id: "dummy-li-001",
    title: "Frontend Engineer (React)",
    company: "Razorpay",
    industry: "Fintech",
    companySize: "1000-5000",
    location: "Bengaluru, India · Hybrid",
    workType: "Full-time",
    publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    description:
      "Build delightful payment experiences using React, TypeScript, and Tailwind. Collaborate with design and backend teams to ship features used by millions.",
    applyUrl:
      "https://www.linkedin.com/jobs/search/?keywords=Frontend%20Engineer%20React&location=India",
    source: "LinkedIn",
  },
  {
    id: "dummy-in-002",
    title: "Full Stack Developer",
    company: "Zoho",
    industry: "SaaS",
    companySize: "5000+",
    location: "Chennai, India · On-site",
    workType: "Full-time",
    publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    description:
      "Work across Node.js, React and PostgreSQL to ship product features end-to-end. Strong fundamentals in data structures, REST APIs and SQL required.",
    applyUrl:
      "https://in.indeed.com/jobs?q=Full+Stack+Developer&l=India",
    source: "Indeed",
  },
  {
    id: "dummy-na-003",
    title: "Data Analyst Intern",
    company: "Swiggy",
    industry: "Food Tech",
    companySize: "5000+",
    location: "Bengaluru, India · Hybrid",
    workType: "Internship",
    publishedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    description:
      "Use SQL, Python and Tableau to analyze customer behavior, build dashboards, and deliver insights to growth and ops teams.",
    applyUrl:
      "https://www.naukri.com/data-analyst-intern-jobs",
    source: "Naukri",
  },
  {
    id: "dummy-li-004",
    title: "Backend Engineer (Node.js)",
    company: "CRED",
    industry: "Fintech",
    companySize: "1000-5000",
    location: "Bengaluru, India · On-site",
    workType: "Full-time",
    publishedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    description:
      "Design scalable microservices in Node.js and Go. Work on event-driven systems with Kafka, Redis and Postgres in a high-traffic production environment.",
    applyUrl:
      "https://www.linkedin.com/jobs/search/?keywords=Backend%20Engineer%20Node",
    source: "LinkedIn",
  },
  {
    id: "dummy-in-005",
    title: "UI/UX Designer",
    company: "Freshworks",
    industry: "SaaS",
    companySize: "5000+",
    location: "Remote, India",
    workType: "Full-time",
    publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    description:
      "Own the design of customer-facing SaaS products. Strong Figma skills, design systems experience and a portfolio of shipped work expected.",
    applyUrl:
      "https://in.indeed.com/jobs?q=UI+UX+Designer&l=Remote",
    source: "Indeed",
  },
  {
    id: "dummy-na-006",
    title: "Machine Learning Engineer",
    company: "Ola Electric",
    industry: "Mobility",
    companySize: "1000-5000",
    location: "Bengaluru, India · On-site",
    workType: "Full-time",
    publishedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    description:
      "Build and deploy ML models for battery analytics, demand forecasting and computer vision pipelines. Python, PyTorch and MLOps experience required.",
    applyUrl:
      "https://www.naukri.com/machine-learning-engineer-jobs",
    source: "Naukri",
  },
];
