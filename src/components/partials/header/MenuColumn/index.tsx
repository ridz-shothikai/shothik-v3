"use client";

import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface MenuItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

interface MenuColumnProps {
  title: string;
  items: MenuItem[];
  onItemClick: () => void;
  className?: string;
}

export default function MenuColumn({
  title,
  items,
  onItemClick,
  className,
}: MenuColumnProps) {
  return (
    <div className={className}>
      <div className="text-subtitle2 text-foreground mb-4 text-sm font-bold tracking-wide uppercase">
        {title}
      </div>
      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.label}
              variant="ghost"
              asChild
              className="text-muted-foreground hover:bg-muted hover:text-primary justify-start rounded px-3 py-2 text-sm font-medium"
              data-testid={`menu-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={onItemClick}
            >
              <a href={item.href}>
                <Icon className="mr-2 h-[18px] w-[18px]" />
                {item.label}
              </a>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
