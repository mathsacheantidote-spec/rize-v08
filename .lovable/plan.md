# Rize v7.8.3 — Resume, Trends Dashboard & Easy Apply

## Step 0 — Bring uploaded codebase into the live preview

The current preview is the default Lovable starter. The uploaded ZIP (`rizev7-8-3-main`) contains the real app. I'll copy every file from the unpacked archive into the project (overwriting `src/`, `package.json`, `tailwind.config.ts`, `index.html`, `supabase/`, `public/`, configs), install the existing deps, and verify the preview boots into the real `Welcome → Home → Profile → Employability` flow before touching any features. Recharts, Sonner, Zustand, shadcn UI, and Supabase are already in `package.json` — no new libraries needed.

---

## Codebase facts the plan relies on

- **Stack:** Vite + React 18 + TS, Tailwind, full shadcn/ui kit, Zustand (`src/lib/store.ts`, persisted as `rize-store`), Recharts, Sonner + legacy `useToast`, Supabase (auth + storage), `lucide-react`, `AppShell` layout, design tokens (`bg-gradient-hero`, `bg-card`, `shadow-card`, `font-display`).
- **Routes:** `/profile`, `/employability` (already mount `<JobListingsSection jobRole skills />` below the project tabs).
- **Profile page:** `src/pages/Profile.tsx` — renders `useRize` profile, no resume upload UI yet. The existing `resume` field in the store is the AI-generated PDF (data URL) from `/resume`, separate concern.
- **Employability:** `src/pages/Employability.tsx` — Tabs (`mine` / `showcase` / `suggest`) above the live job listings.
- **Jobs:** `src/components/employability/JobCard.tsx` has a single external "Apply Now" link. `Job` type (`useJobListings.ts`): `id, title, company, industry, location, workType, publishedAt, description, applyUrl`.

All new UI will reuse existing shadcn components (`Button`, `Dialog`, `Switch`, `Card`, `Input`, `Tabs`, `Badge`, `Skeleton`, Sonner `toast`) and the `AppShell` shell. Mobile-first, verified at 375 / 768 / 1280.

---

## Feature 1 — Profile: Resume Upload & Management

Extend `src/lib/store.ts` (no breaking changes — additive only):

```ts
interface UploadedResume {
  filename: string;
  size: number;          // bytes
  mimeType: string;
  uploadedAt: number;    // epoch ms
  dataUrl: string;       // base64 (PDF/DOC/DOCX) — local mock, persisted by Zustand
}
// state additions
uploadedResume: UploadedResume | null;
useResumeForEasyApply: boolean;     // default true
appliedJobs: Record<string, { appliedAt: number; refId: string; resumeName: string }>;
// actions
setUploadedResume, clearUploadedResume, setUseResumeForEasyApply,
markJobApplied(jobId), hasAppliedTo(jobId)
```

Note: kept `resume` (AI-generated) untouched so `/resume` page keeps working.

Build a reusable `src/components/profile/ResumeManager.tsx`:

- Drag-and-drop dropzone + click-to-upload `<input type="file" accept=".pdf,.doc,.docx">` (hidden, triggered by Button).
- Validation: extension/MIME must be PDF/DOC/DOCX, size ≤ 5 MB. Failures → Sonner error toast; never write to store.
- During read: spinner inside the drop area, button disabled. On `FileReader.onload` → store + success toast "Resume uploaded".
- Empty state: dashed Card with upload icon + helper text.
- Filled state: Card showing filename, formatted size (`KB`/`MB`), relative upload date (`date-fns formatDistanceToNow`), and four action buttons:
  - **Preview** — open `dataUrl` in a new tab (PDF) or in a Dialog `<iframe>` for PDFs; for DOC/DOCX, show "Download to preview" notice.
  - **Download** — anchor with `download={filename}`.
  - **Replace** — re-opens file picker.
  - **Delete** — AlertDialog confirmation, then `clearUploadedResume()`.
- Switch row: "Use this resume as default for Easy Apply" bound to `useResumeForEasyApply`.

Insert a new "Resume" section into `src/pages/Profile.tsx` between the stats card and the existing "About you" block. Match existing card styling (`bg-card rounded-2xl border border-border`, `text-xs uppercase tracking-wider` section header).

Also export a slim `<ResumeUploadInline />` variant for reuse in Feature 3 (no surrounding Card chrome).

---

## Feature 2 — Employability: Job Trends Dashboard

Add a fourth tab to the existing `<Tabs>` in `src/pages/Employability.tsx`:

```text
[ My Projects ] [ Employer Showcase ] [ AI Project Ideas ] [ Job Trends ]
```

On mobile the `TabsList` becomes a horizontally scrollable strip (`overflow-x-auto`, `snap-x`) so 4 items fit at 375 px.

New folder `src/components/employability/trends/` with:

- `TrendsDashboard.tsx` — orchestrator + filter bar
- `mockTrendsData.ts` — realistic static data; every dataset begins with `// TODO: replace with API call to <endpoint>` so the integration point is obvious
- `TrendingRolesChart.tsx` — Recharts horizontal `BarChart`, top 10
- `InDemandSkillsList.tsx` — ranked list with Tailwind percentage bars (no extra lib)
- `HiringActivityChart.tsx` — Recharts `LineChart`, last 6 months
- `SalaryInsightsChart.tsx` — Recharts grouped `BarChart` (min / median / max per role)
- `WhoIsHiringPanel.tsx` — donut (Recharts `PieChart`) for experience-level mix + ranked lists for top companies (lucide `Building2` placeholder logos) and top locations
- `ActiveOpeningsStat.tsx` — Card with big number + ↑/↓ trend chip (lucide `TrendingUp/Down`)

Filter bar at the top (sticky on desktop) using shadcn `Select`: **Industry**, **Role Type**, **Experience Level**, **Location** + a "Reset" Button. Filters live in local state and pass through to all child components — each child filters the mock dataset purely (no shared global state).

Layout: CSS grid — `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` with the Hiring Activity chart spanning two columns on `xl`. All Recharts components wrapped in `<ResponsiveContainer width="100%" height={...}>` for proper reflow.

The existing `<JobListingsSection>` stays where it is, below the Tabs — no change.

---

## Feature 3 — Job Openings: Enhanced Easy Apply

Modify `src/components/employability/JobCard.tsx` and add `src/components/employability/EasyApplyModal.tsx`.

**JobCard changes:**
- Replace the single external "Apply Now" link with two actions: external link icon-button (keeps the `applyUrl` escape hatch) + primary **Easy Apply** button.
- If `useRize.hasAppliedTo(job.id)` → render a disabled `Applied ✓` button styled with `variant="secondary"` and a Tooltip `You applied on {formatted date}`.

**EasyApplyModal.tsx (shadcn `Dialog` — gives focus trap, ESC, backdrop close for free):**
- Two internal modes driven by `useRize.uploadedResume`:
  1. **Has resume** → confirmation view: shows resume filename + size, `useResumeForEasyApply` toggle (read-only display), single primary `Submit Application` button with loading spinner. On submit: 800 ms simulated latency → `markJobApplied(job.id)` with `refId = "APP-2025-" + nanoid(5).toUpperCase()` → close modal → Sonner success toast `Applied to {company}. Reference: {refId}` → JobCard re-renders as `Applied ✓`.
  2. **No resume** → renders `<ResumeUploadInline />` from Feature 1 with copy "Upload your resume to apply in one click". When upload finishes, the modal automatically transitions to mode 1 (effect on `uploadedResume`).
- Submit button always shows loading → success → error states; on thrown error, Sonner error toast and button re-enables.

Re-application guard: clicking Easy Apply on an already-applied job is impossible (button is disabled), but `markJobApplied` also early-returns if the id exists, defensively.

---

## Global / non-regression checklist

- All new components import from `@/components/ui/*`; no duplicate primitives created.
- Sonner `toast` for all notifications (matches project convention in `Employability.tsx`).
- New Zustand fields are additive — existing `resume`, `profile`, `completedSteps` etc. untouched, so `/resume`, `/home`, `/skills` keep working.
- Mobile-first Tailwind; manual visual check at 375 / 768 / 1280.
- Mock-data files include explicit `// TODO: replace with API call` comments at every fetch boundary.
- No backend migrations required (resume kept client-side per brief's "local mock if no backend" allowance).

---

## Files created / modified

**Modified**
- `src/lib/store.ts` — add `uploadedResume`, `useResumeForEasyApply`, `appliedJobs`, related actions/selectors
- `src/pages/Profile.tsx` — insert Resume Manager section
- `src/pages/Employability.tsx` — add 4th Tab "Job Trends"
- `src/components/employability/JobCard.tsx` — Easy Apply button + Applied state

**Created**
- `src/components/profile/ResumeManager.tsx` (+ inline variant)
- `src/components/employability/EasyApplyModal.tsx`
- `src/components/employability/trends/TrendsDashboard.tsx`
- `src/components/employability/trends/mockTrendsData.ts`
- `src/components/employability/trends/TrendingRolesChart.tsx`
- `src/components/employability/trends/InDemandSkillsList.tsx`
- `src/components/employability/trends/HiringActivityChart.tsx`
- `src/components/employability/trends/SalaryInsightsChart.tsx`
- `src/components/employability/trends/WhoIsHiringPanel.tsx`
- `src/components/employability/trends/ActiveOpeningsStat.tsx`
