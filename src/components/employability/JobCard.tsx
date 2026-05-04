import { ExternalLink, MapPin, Building2, Briefcase, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { Job } from "@/hooks/useJobListings";

interface JobCardProps {
  job: Job;
  userSkills: string[];
}

export function JobCard({ job, userSkills }: JobCardProps) {
  const normalizedSkills = userSkills.map((s) => s.toLowerCase());
  const descWords = (job.description || "").toLowerCase();
  const matchedSkills = normalizedSkills.filter((skill) => descWords.includes(skill));

  const publishedLabel = job.publishedAt
    ? new Date(job.publishedAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      })
    : null;

  return (
    <Card className="flex flex-col h-full shadow-card hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display font-bold leading-tight truncate">{job.title}</h3>
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-1 truncate">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="truncate">{job.company}</span>
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            {job.workType}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-2 text-xs text-muted-foreground">
        {job.location && (
          <div className="inline-flex items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
        )}
        {job.industry && (
          <div className="inline-flex items-center gap-1.5">
            <Briefcase className="h-3 w-3 shrink-0" />
            <span className="truncate">{job.industry}</span>
          </div>
        )}
        {publishedLabel && (
          <div className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3 shrink-0" />
            <span>Posted {publishedLabel}</span>
          </div>
        )}
        {matchedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {matchedSkills.map((skill) => (
              <Badge
                key={skill}
                className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
              >
                ✓ {skill}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        <Button asChild size="sm" className="w-full gap-2">
          <a href={job.applyUrl} target="_blank" rel="noreferrer">
            Apply Now <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}