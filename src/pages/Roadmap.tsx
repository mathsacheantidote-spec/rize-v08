import { useEffect } from "react";

export default function Roadmap() {
  useEffect(() => {
    window.location.replace("https://rizeai-roadmaps.lovable.app/");
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
      Redirecting to roadmaps…
    </div>
  );
}
