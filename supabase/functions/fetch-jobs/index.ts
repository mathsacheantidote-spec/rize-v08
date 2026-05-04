import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MANTIKS_API_KEY = Deno.env.get("MANTIKS_API_KEY") ?? "";
const MANTIKS_BASE_URL = "https://api.mantiks.io";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { jobRole, skills, page = 1 } = await req.json();

    if (!jobRole && (!skills || skills.length === 0)) {
      return new Response(
        JSON.stringify({ error: "jobRole or skills are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!MANTIKS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "MANTIKS_API_KEY is not set in edge function secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const skillQuery = skills && skills.length > 0
      ? skills.slice(0, 5).join(" OR ")
      : "";

    const titleQuery = jobRole
      ? skillQuery
        ? `${jobRole} AND (${skillQuery})`
        : jobRole
      : skillQuery;

    const params = new URLSearchParams({
      job_title: titleQuery,
      published_at_max_age_days: "30",
      page: String(page),
      limit: "20",
    });

    const mantiksUrl = `${MANTIKS_BASE_URL}/company/search?${params.toString()}`;

    console.log("[fetch-jobs] Calling Mantiks:", mantiksUrl);

    const mantiksRes = await fetch(mantiksUrl, {
      method: "GET",
      headers: {
        "accept": "application/json",
        "x-api-key": MANTIKS_API_KEY,
      },
    });

    if (!mantiksRes.ok) {
      const errText = await mantiksRes.text();
      console.error("[fetch-jobs] Mantiks error:", mantiksRes.status, errText);
      return new Response(
        JSON.stringify({
          error: `Mantiks API returned status ${mantiksRes.status}`,
          detail: errText,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawData = await mantiksRes.json();
    console.log("[fetch-jobs] Raw response keys:", Object.keys(rawData));

    const companies: any[] =
      rawData?.data ??
      rawData?.companies ??
      rawData?.results ??
      (Array.isArray(rawData) ? rawData : []);

    const jobs = companies.flatMap((company: any) => {
      const companyName =
        company?.name ?? company?.company_name ?? "Unknown Company";
      const companyIndustry = company?.industry ?? "";
      const companySize = company?.employees_count ?? "";
      const jobList: any[] =
        company?.jobs ?? company?.job_postings ?? company?.postings ?? [];

      return jobList.map((job: any) => ({
        id:
          job?.id ??
          `${companyName}-${job?.title ?? "job"}`.replace(/\s+/g, "-").toLowerCase(),
        title: job?.title ?? job?.job_title ?? "Untitled Role",
        company: companyName,
        industry: companyIndustry,
        companySize: companySize,
        location: job?.location ?? job?.city ?? "Location not specified",
        workType:
          job?.remote === true
            ? "Remote"
            : job?.work_type ?? job?.workplace_type ?? "On-site",
        publishedAt: job?.published_at ?? job?.date ?? null,
        description: job?.description ?? job?.summary ?? "",
        applyUrl: job?.apply_url ?? job?.job_url ?? job?.url ?? "#",
        source: job?.source ?? "Mantiks",
      }));
    });

    return new Response(
      JSON.stringify({
        jobs,
        totalCompanies: companies.length,
        totalJobs: jobs.length,
        page,
        query: titleQuery,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("[fetch-jobs] Unhandled error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        detail: err?.message ?? "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});