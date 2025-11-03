import { cn } from "@/lib/utils";
import Link from "next/link";

export default function SideMenu() {
  return (
    <div className={cn("mt-2 flex flex-col p-1")}>
      <Link
        href="/tutorials"
        className={cn(
          "text-primary p-0 text-sm transition-colors hover:bg-transparent hover:underline",
        )}
      >
        Tutorial series →
      </Link>
      <Link
        href="/tutorials"
        className={cn(
          "text-primary p-0 text-sm transition-colors hover:bg-transparent hover:underline",
        )}
      >
        Product tutorials →
      </Link>
      <Link
        href="/paraphrase"
        className={cn(
          "text-primary p-0 text-sm transition-colors hover:bg-transparent hover:underline",
        )}
      >
        Browse all tools →
      </Link>
    </div>
  );
}
