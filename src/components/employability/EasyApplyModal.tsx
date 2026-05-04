import { useEffect, useState } from "react";
import { Loader2, FileText, CheckCircle2, Building2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRize } from "@/lib/store";
import { ResumeManager } from "@/components/profile/ResumeManager";
import type { Job } from "@/hooks/useJobListings";

interface EasyApplyModalProps {
  job: Job;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function EasyApplyModal({ job, open, onOpenChange }: EasyApplyModalProps) {
  const uploadedResume = useRize((s) => s.uploadedResume);
  const useDefault = useRize((s) => s.useResumeForEasyApply);
  const setUseDefault = useRize((s) => s.setUseResumeForEasyApply);
  const markJobApplied = useRize((s) => s.markJobApplied);
  const hasAppliedTo = useRize((s) => s.hasAppliedTo);

  const [submitting, setSubmitting] = useState(false);

  // When modal closes, reset submitting state.
  useEffect(() => {
    if (!open) setSubmitting(false);
  }, [open]);

  async function handleSubmit() {
    if (!uploadedResume || hasAppliedTo(job.id)) return;
    setSubmitting(true);
    try {
      // Simulated network latency.
      // TODO: replace with real POST /applications API call
      await new Promise((res) => setTimeout(res, 800));
      const record = markJobApplied(job.id, { jobTitle: job.title, company: job.company });
      onOpenChange(false);
      toast.success(`Applied to ${job.company}`, {
        description: record ? `Reference: ${record.refId}` : undefined,
      });
    } catch (e: any) {
      toast.error("Application failed", { description: e?.message ?? "Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  const hasResume = Boolean(uploadedResume);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            {hasResume ? "Confirm your application" : "Upload a resume to apply"}
          </DialogTitle>
          <DialogDescription>
            {hasResume
              ? "Review your details, then submit in one click."
              : "Easy Apply needs a resume on file. Upload one to continue."}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border bg-muted/30 p-3 flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4 text-secondary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{job.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {job.company}{job.location ? ` · ${job.location}` : ""}
            </p>
          </div>
        </div>

        {hasResume ? (
          <>
            <div className="rounded-xl border border-border p-3 flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Using this resume</p>
                <p className="text-sm font-semibold truncate">{uploadedResume!.filename}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {formatSize(uploadedResume!.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <Label htmlFor="ea-default" className="text-sm">
                Set as default for Easy Apply
              </Label>
              <Switch id="ea-default" checked={useDefault} onCheckedChange={setUseDefault} />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {submitting ? "Submitting…" : "Submit Application"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <ResumeManager compact hideDefaultToggle />
          // After upload, the `hasResume` branch above auto-renders because state updates.
        )}
      </DialogContent>
    </Dialog>
  );
}
