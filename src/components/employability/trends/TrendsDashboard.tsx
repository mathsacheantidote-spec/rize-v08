import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Briefcase, MapPin, Building2, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ACTIVE_OPENINGS, DEFAULT_FILTERS, EXPERIENCE_BREAKDOWN, HIRING_ACTIVITY,
  IN_DEMAND_SKILLS, SALARY_INSIGHTS, TOP_COMPANIES, TOP_LOCATIONS, TRENDING_ROLES,
  type TrendsFilters,
} from "./mockTrendsData";

// Use HSL CSS variables so colors track the design system in light/dark mode.
const PRIMARY = "hsl(var(--primary))";
const ACCENT = "hsl(var(--accent-foreground))";
const MUTED = "hsl(var(--muted-foreground))";
const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary-foreground))",
  "hsl(var(--accent-foreground))",
  "hsl(var(--muted-foreground))",
];

/* -------- Filter bar -------- */

function FilterBar({
  filters, onChange, onReset,
}: { filters: TrendsFilters; onChange: (f: TrendsFilters) => void; onReset: () => void }) {
  const set = <K extends keyof TrendsFilters>(k: K, v: TrendsFilters[K]) =>
    onChange({ ...filters, [k]: v });

  return (
    <div className="bg-card border border-border rounded-2xl p-3 grid grid-cols-2 md:grid-cols-4 gap-2 lg:sticky lg:top-2 z-10">
      <Select value={filters.industry} onValueChange={(v) => set("industry", v as any)}>
        <SelectTrigger><SelectValue placeholder="Industry" /></SelectTrigger>
        <SelectContent>
          {["All", "Technology", "Finance", "Healthcare", "Retail", "Education"].map((o) => (
            <SelectItem key={o} value={o}>{o === "All" ? "All industries" : o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.roleType} onValueChange={(v) => set("roleType", v as any)}>
        <SelectTrigger><SelectValue placeholder="Role type" /></SelectTrigger>
        <SelectContent>
          {["All", "Full-time", "Internship", "Contract", "Part-time"].map((o) => (
            <SelectItem key={o} value={o}>{o === "All" ? "All role types" : o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.experience} onValueChange={(v) => set("experience", v as any)}>
        <SelectTrigger><SelectValue placeholder="Experience" /></SelectTrigger>
        <SelectContent>
          {["All", "Entry", "Mid", "Senior", "Lead"].map((o) => (
            <SelectItem key={o} value={o}>{o === "All" ? "All levels" : o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Select value={filters.location} onValueChange={(v) => set("location", v as any)}>
          <SelectTrigger className="flex-1"><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent>
            {["All", "Bengaluru", "Hyderabad", "Pune", "Mumbai", "Delhi NCR", "Remote"].map((o) => (
              <SelectItem key={o} value={o}>{o === "All" ? "All locations" : o}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={onReset} title="Reset filters">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* -------- Active openings stat -------- */

function ActiveOpeningsStat({ filters }: { filters: TrendsFilters }) {
  // Apply a deterministic filter multiplier so the number reacts to filters.
  const multiplier = useMemo(() => {
    let m = 1;
    if (filters.industry !== "All") m *= 0.45;
    if (filters.roleType !== "All") m *= 0.55;
    if (filters.experience !== "All") m *= 0.6;
    if (filters.location !== "All") m *= 0.4;
    return m;
  }, [filters]);
  const total = Math.round(ACTIVE_OPENINGS.total * multiplier);
  const up = ACTIVE_OPENINGS.changePct >= 0;
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground inline-flex items-center gap-1.5">
          <Briefcase className="h-4 w-4" /> Active openings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <p className="font-display text-3xl font-bold">{total.toLocaleString()}</p>
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              up ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}
          >
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(ACTIVE_OPENINGS.changePct)}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">vs. previous month</p>
      </CardContent>
    </Card>
  );
}

/* -------- Trending roles bar chart -------- */

function TrendingRolesChart({ filters }: { filters: TrendsFilters }) {
  const data = useMemo(() => {
    const filtered = filters.industry === "All"
      ? TRENDING_ROLES
      : TRENDING_ROLES.filter((r) => r.industries.includes(filters.industry));
    return [...filtered].sort((a, b) => b.openings - a.openings).slice(0, 10);
  }, [filters.industry]);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Trending job roles</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
            <CartesianGrid stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: MUTED }} />
            <YAxis type="category" dataKey="role" width={110} tick={{ fontSize: 11, fill: MUTED }} />
            <RTooltip cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar dataKey="openings" fill={PRIMARY} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* -------- In-demand skills ranked list -------- */

function InDemandSkillsList() {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">In-demand skills</CardTitle></CardHeader>
      <CardContent>
        <ul className="space-y-2.5">
          {IN_DEMAND_SKILLS.map((s, i) => (
            <li key={s.skill}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium">{i + 1}. {s.skill}</span>
                <span className="text-muted-foreground tabular-nums">{s.demand}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${s.demand}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/* -------- Hiring activity line chart -------- */

function HiringActivityChart() {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Hiring activity (last 6 months)</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={HIRING_ACTIVITY} margin={{ left: 8, right: 8 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: MUTED }} />
            <YAxis tick={{ fontSize: 11, fill: MUTED }} />
            <RTooltip />
            <Line type="monotone" dataKey="postings" stroke={PRIMARY} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* -------- Salary insights grouped bar chart -------- */

function SalaryInsightsChart() {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Salary insights (LPA)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={SALARY_INSIGHTS} margin={{ left: 8, right: 8 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis dataKey="role" tick={{ fontSize: 11, fill: MUTED }} />
            <YAxis tick={{ fontSize: 11, fill: MUTED }} />
            <RTooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="min" name="Min" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="median" name="Median" fill={PRIMARY} radius={[4, 4, 0, 0]} />
            <Bar dataKey="max" name="Max" fill="hsl(var(--accent-foreground))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* -------- Who is hiring panel -------- */

function WhoIsHiringPanel() {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Who is getting hired</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">By experience level</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={EXPERIENCE_BREAKDOWN}
                dataKey="value"
                nameKey="name"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
              >
                {EXPERIENCE_BREAKDOWN.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <RTooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Top hiring companies</p>
          <ul className="space-y-1.5">
            {TOP_COMPANIES.map((c) => (
              <li key={c.name} className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-2 min-w-0">
                  <span className="h-6 w-6 rounded-md bg-secondary flex items-center justify-center shrink-0">
                    <Building2 className="h-3 w-3 text-secondary-foreground" />
                  </span>
                  <span className="truncate font-medium">{c.name}</span>
                </span>
                <span className="text-muted-foreground tabular-nums">{c.openings}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Top locations</p>
          <ul className="space-y-1.5">
            {TOP_LOCATIONS.map((l) => (
              <li key={l.city} className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-2 min-w-0">
                  <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="truncate font-medium">{l.city}</span>
                </span>
                <span className="text-muted-foreground tabular-nums">{l.openings.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------- Public dashboard component -------- */

export function TrendsDashboard() {
  const [filters, setFilters] = useState<TrendsFilters>(DEFAULT_FILTERS);

  return (
    <div className="space-y-4">
      <FilterBar filters={filters} onChange={setFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <ActiveOpeningsStat filters={filters} />
        <TrendingRolesChart filters={filters} />
        <InDemandSkillsList />
        <div className="md:col-span-2">
          <HiringActivityChart />
        </div>
        <WhoIsHiringPanel />
        <div className="xl:col-span-3">
          <SalaryInsightsChart />
        </div>
      </div>
    </div>
  );
}
