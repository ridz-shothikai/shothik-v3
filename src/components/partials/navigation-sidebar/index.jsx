"use client";

import Logo from "@/components/partials/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAV_ITEMS } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { Dot } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import NavigantionIcons from "./NavigationIcons";
import NavItem from "./NavItem";
import UserInfo from "./UserInfo";

export default function NavigationSidebar() {
  const { accessToken, user } = useSelector((state) => state.auth);
  const { sidebar } = useSelector((state) => state.settings);
  const isCompact = sidebar === "compact";

  const { setOpen } = useSidebar();

  useEffect(() => {
    if (sidebar === "compact") {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [sidebar, setOpen]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-sidebar-border h-12 border-b p-0 lg:h-16">
        <div className="flex h-full items-center justify-center px-2 py-1">
          <Logo
            className={cn("", {
              "lg:hidden": isCompact,
              "lg:inline-block": !isCompact,
            })}
          />
          <Image
            src="/moscot.png"
            priority
            alt="shothik_logo"
            width={100}
            height={40}
            className={cn("mx-auto hidden! h-full w-auto object-contain", {
              "lg:hidden!": !isCompact,
              "lg:inline-block!": isCompact,
            })}
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto!">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <div className="flex flex-col py-4">
                {NAV_ITEMS?.map((group) => {
                  if (group?.roles && !group?.roles?.includes(user?.role)) {
                    return null;
                  }
                  const key = group.subheader || group.items?.[0]?.title;
                  return (
                    <div key={key} className="flex flex-col gap-4">
                      <div className="px-2">
                        {group?.subheader && (
                          <>
                            {isCompact ? (
                              <div className="flex h-6 items-center justify-center">
                                <Dot className="size-6" />
                              </div>
                            ) : (
                              <div className="text-muted-foreground flex h-6 items-center text-sm font-medium uppercase">
                                {group?.subheader}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {group?.items?.map((item) => (
                          <NavItem
                            key={item?.title + item?.path}
                            item={item}
                            sidebar={sidebar}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border flex min-h-12 items-center border-t lg:min-h-16">
        <div className="w-full">
          {!accessToken ? <UserInfo /> : <NavigantionIcons />}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
