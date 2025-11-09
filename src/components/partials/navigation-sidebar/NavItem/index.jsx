import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ----------------------------------------------------------------------

export default function NavItem({ item, sidebar, className }) {
  const pathname = usePathname();
  const isActive = pathname === item.path;
  const { title, path, icon, iconColor } = item;
  const isCompact = sidebar === "compact";

  return (
    <Link
      data-umami-event={`Nav: ${title}`}
      data-rybbit-event="Nav Item"
      data-rybbit-prop-nav_item={`Nav: ${title}`}
      href={path}
      id={item?.id}
      className={cn(
        "relative flex w-full flex-row items-center justify-start gap-x-4 gap-y-1 rounded-md px-4 py-2 capitalize transition-colors",
        {
          "lg:mx-auto lg:w-[72px] lg:min-w-[72px] lg:flex-col lg:justify-center lg:p-2":
            isCompact,
        },
        isActive
          ? "text-primary bg-primary/10 hover:bg-primary/10 hover:text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        className,
      )}
    >
      {icon && (
        <div
          className={cn("flex h-8 w-8 shrink-0 items-center justify-center")}
          style={{ color: iconColor }}
        >
          {icon}
        </div>
      )}

      <span
        className={cn(
          "grow",
          isCompact
            ? "whitespace-wrap text-center text-xs"
            : "text-start text-base whitespace-nowrap",
        )}
      >
        {title === "AI Detector" ? (
          <>
            AI
            <br className={isCompact ? "block" : "hidden"} /> Detector
          </>
        ) : (
          title
        )}
      </span>
    </Link>
  );
}
