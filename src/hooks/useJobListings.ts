import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DUMMY_JOBS } from "@/lib/dummy-jobs";

export interface Job {
  id: string;
  title: string;
  company: string;
  industry: string;
  companySize: string;
  location: string;
  workType: string;
  publishedAt: string | null;
  description: string;
  applyUrl: string;
  source: string;
}

interface UseJobListingsResult {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  totalJobs: number;
  page: number;
  fetchJobs: (jobRole: string, skills: string[], page?: number) => Promise<void>;
  reset: () => void;
}

export function useJobListings(): UseJobListingsResult {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalJobs, setTotalJobs] = useState(0);
  const [page, setPage] = useState(1);

  const fetchJobs = useCallback(async (
    jobRole: string,
    skills: string[],
    pageNum: number = 1
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("fetch-jobs", {
        body: { jobRole, skills, page: pageNum },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      const incoming: Job[] = data?.jobs ?? [];
      // Always include dummy openings on page 1 so users can try Easy Apply
      // and the manual external redirect (LinkedIn / Indeed / Naukri).
      const merged = pageNum === 1 ? [...DUMMY_JOBS, ...incoming] : incoming;

      setJobs((prev) => (pageNum === 1 ? merged : [...prev, ...incoming]));
      setTotalJobs((data?.totalJobs ?? incoming.length) + (pageNum === 1 ? DUMMY_JOBS.length : 0));
      setPage(pageNum);
    } catch (err: any) {
      // Edge function failed — still show dummy jobs as a safety net.
      if (pageNum === 1) {
        setJobs(DUMMY_JOBS);
        setTotalJobs(DUMMY_JOBS.length);
        setPage(1);
      }
      setError(null); // suppress error UI since fallback content is shown
      console.warn("[useJobListings] using dummy jobs fallback:", err?.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setJobs([]);
    setError(null);
    setTotalJobs(0);
    setPage(1);
  }, []);

  return { jobs, isLoading, error, totalJobs, page, fetchJobs, reset };
}