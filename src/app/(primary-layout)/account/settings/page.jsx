"use client";
import AccountBillingSection from "@/components/(primary-layout)/(account-page)/AccountBillingSection";
import AccountGeneral from "@/components/(primary-layout)/(account-page)/AccountGeneralFormSection";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PATH_ACCOUNT } from "@/config/route";
import { CreditCard, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function AccountSettings() {
  const { push } = useRouter();
  const { user, accessToken } = useSelector((state) => state.auth);
  const [currentTab, setCurrentTab] = useState("general");

  useEffect(() => {
    if (!accessToken || !user) {
      push("/");
    }
  }, [accessToken, user, push]);

  useEffect(() => {
    document.title = `Account Settings - ${currentTab} || Shothik AI`;
  }, [currentTab]);

  const handleTab = (newValue) => {
    setCurrentTab(newValue);
    window.history.pushState({}, "", PATH_ACCOUNT.settings[newValue]);
  };

  return (
    <div className="px-4">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Account</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="capitalize">{currentTab}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Tabs value={currentTab} onValueChange={handleTab} className="w-full">
        <TabsList className="grid w-fit grid-cols-2">
          <TabsTrigger
            value="general"
            className="flex cursor-pointer items-center gap-2"
          >
            <User className="text-muted-foreground h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="flex cursor-pointer items-center gap-2"
          >
            <CreditCard className="text-muted-foreground h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="my-8">
          <AccountGeneral user={user} />
        </TabsContent>

        <TabsContent value="billing" className="my-8">
          <AccountBillingSection user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
