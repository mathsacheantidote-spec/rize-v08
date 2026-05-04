import { useEffect, useRef, useState } from "react";
import { FileText, Upload, Eye, Download, RefreshCw, Trash2, Loader2, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRize, type UploadedResume } from "@/lib/store";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXT = ["pdf", "doc", "docx"] as const;
const ALLOWED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

interface ResumeManagerProps {
  /** When true, renders without surrounding chrome — for use inside dialogs. */
  compact?: boolean;
  /** Hide the "use as default" switch (e.g. inside Easy Apply modal). */
  hideDefaultToggle?: boolean;
  /** Fired right after a successful upload. */
  onUploaded?: (r: UploadedResume) => void;
}

export function ResumeManager({ compact = false, hideDefaultToggle = false, onUploaded }: ResumeManagerProps) {
  const uploadedResume = useRize((s) => s.uploadedResume);
  const setUploadedResume = useRize((s) => s.setUploadedResume);
  const clearUploadedResume = useRize((s) => s.clearUploadedResume);
  const useDefault = useRize((s) => s.useResumeForEasyApply);
  const setUseDefault = useRize((s) => s.setUseResumeForEasyApply);

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  function pickFile() {
    inputRef.current?.click();
  }

  function validateAndRead(file: File) {
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const okExt = (ALLOWED_EXT as readonly string[]).includes(ext);
    const okMime = file.type === "" || ALLOWED_MIME.includes(file.type);

    if (!okExt || !okMime) {
      toast.error("Unsupported file type", {
        description: "Please upload a PDF, DOC, or DOCX file.",
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File too large", {
        description: `Max size is 5 MB. Yours is ${formatSize(file.size)}.`,
      });
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onerror = () => {
      setUploading(false);
      toast.error("Couldn't read that file", { description: "Please try again." });
    };
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const record: UploadedResume = {
        filename: file.name,
        size: file.size,
        mimeType: file.type || (ext === "pdf" ? "application/pdf" : "application/octet-stream"),
        uploadedAt: Date.now(),
        dataUrl,
      };
      setUploadedResume(record);
      setUploading(false);
      toast.success("Resume uploaded", { description: file.name });
      onUploaded?.(record);
    };
    reader.readAsDataURL(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) validateAndRead(f);
    // reset input so the same file can be re-picked
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) validateAndRead(f);
  }

  function downloadCurrent() {
    if (!uploadedResume) return;
    const a = document.createElement("a");
    a.href = uploadedResume.dataUrl;
    a.download = uploadedResume.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function previewCurrent() {
    if (!uploadedResume) return;
    if (uploadedResume.mimeType === "application/pdf") {
      setPreviewOpen(true);
    } else {
      toast("Preview not available", {
        description: "DOC/DOCX previews aren't supported in-browser. Use Download instead.",
      });
    }
  }

  const hidden = (
    <input
      ref={inputRef}
      type="file"
      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      className="hidden"
      onChange={onInputChange}
    />
  );

  // ---- Empty state: dropzone ----
  if (!uploadedResume) {
    return (
      <div className={cn(!compact && "bg-card rounded-2xl border border-border p-4")}>
        {hidden}
        <button
          type="button"
          onClick={pickFile}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          disabled={uploading}
          className={cn(
            "w-full rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center transition-base tap-scale",
            dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/30",
            uploading && "opacity-70 cursor-wait",
          )}
        >
          {uploading ? (
            <Loader2 className="h-7 w-7 text-primary animate-spin mb-2" />
          ) : (
            <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center mb-2">
              <Upload className="h-5 w-5 text-secondary-foreground" />
            </div>
          )}
          <p className="text-sm font-medium">
            {uploading ? "Uploading…" : "Drop your resume here or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> PDF, DOC or DOCX · max 5 MB
          </p>
        </button>
      </div>
    );
  }

  // ---- Filled state ----
  const sizeLabel = formatSize(uploadedResume.size);
  const whenLabel = formatDistanceToNow(uploadedResume.uploadedAt, { addSuffix: true });

  return (
    <div className={cn(!compact && "bg-card rounded-2xl border border-border p-4")}>
      {hidden}

      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
          <FileText className="h-5 w-5 text-secondary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{uploadedResume.filename}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {sizeLabel} · uploaded {whenLabel}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={previewCurrent}>
          <Eye className="h-3.5 w-3.5" /> Preview
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadCurrent}>
          <Download className="h-3.5 w-3.5" /> Download
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={pickFile} disabled={uploading}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Replace
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-destructive hover:text-destructive"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </div>

      {!hideDefaultToggle && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-border p-3 bg-muted/30">
          <div className="pr-3">
            <Label htmlFor="use-default-resume" className="text-sm font-medium">
              Use this resume for Easy Apply
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Auto-fills your default resume on every Easy Apply submission.
            </p>
          </div>
          <Switch
            id="use-default-resume"
            checked={useDefault}
            onCheckedChange={setUseDefault}
          />
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this resume?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to upload a new one before using Easy Apply.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                clearUploadedResume();
                toast.success("Resume removed");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="truncate">{uploadedResume.filename}</DialogTitle>
          </DialogHeader>
          <iframe
            src={uploadedResume.dataUrl}
            title={uploadedResume.filename}
            className="flex-1 w-full rounded-md border border-border"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
