import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-center text-sm text-amber-800 dark:text-amber-200">
      <Info className="h-4 w-4 shrink-0" />
      <span>
        <Badge variant="outline" className="mr-1.5 text-[10px] border-amber-300 dark:border-amber-700">
          DEMO
        </Badge>
        This is a frontend demo. Data shown is sample data and not saved to any server.
      </span>
    </div>
  );
}
