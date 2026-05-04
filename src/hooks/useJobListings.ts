import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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

      setJobs((prev) => pageNum === 1 ? incoming : [...prev, ...incoming]);
      setTotalJobs(data?.totalJobs ?? incoming.length);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch jobs. Please try again.");
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