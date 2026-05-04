import { useEffect } from "react";
import { Loader2, RefreshCw, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobListings } from "@/hooks/useJobListings";
import { JobCard } from "./JobCard";

interface JobListingsSectionProps {
  jobRole: string;
  skills: string[];
}

export function JobListingsSection({ jobRole, skills }: JobListingsSectionProps) {
  const { jobs, isLoading, error, totalJobs, page, fetchJobs } = useJobListings();

  useEffect(() => {
    if (jobRole || skills.length > 0) {
      fetchJobs(jobRole, skills, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobRole, skills.join(",")]);

  return (
    <section className="mt-8 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display font-bold text-lg">Live Job Listings</h2>
          {!isLoading && totalJobs > 0 && (
            <p className="text-xs text-muted-foreground">
              {totalJobs} matching roles found
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchJobs(jobRole, skills, 1)}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {(jobRole || skills.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {jobRole && (
            <Badge variant="secondary" className="text-[10px]">
              Role: {jobRole}
            </Badge>
          )}
          {skills.slice(0, 4).map((s) => (
            <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
          ))}
          {skills.length > 4 && (
            <Badge variant="outline" className="text-[10px]">+{skills.length - 4} more</Badge>
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && jobs.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && jobs.length === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <SearchX className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-medium">No jobs found for your current role and skills.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try updating your target role or adding more skills to your profile.
          </p>
        </div>
      )}

      {jobs.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} userSkills={skills} />
            ))}
          </div>
          {jobs.length < totalJobs && (
            <div className="flex justify-center pt-3">
              <Button
                variant="outline"
                onClick={() => fetchJobs(jobRole, skills, page + 1)}
                disabled={isLoading}
                className="gap-2 min-w-[160px]"
              >
                {isLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : "Load More Jobs"}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}