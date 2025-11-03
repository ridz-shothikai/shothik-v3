"use client";
import LoadingScreen from "@/components/common/LoadingScreen";
import Footer from "@/components/partials/footer";
import Header from "@/components/partials/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  useGetUserLimitQuery,
  useGetUserQuery,
} from "@/redux/api/auth/authApi";
import { AppProgressProvider as ProgressProvider } from "@bprogress/next";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function SecondaryLayout({ children }) {
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const { accessToken } = useSelector((state) => state.auth);
  useGetUserQuery(undefined, {
    skip: !accessToken,
  });
  useGetUserLimitQuery();

  useEffect(() => {
    setIsLoadingPage(false);
  }, []);

  if (isLoadingPage) return <LoadingScreen />;

  return (
    <ProgressProvider
      height="3px"
      color="#00AB55"
      options={{ showSpinner: false }}
      shallowRouting
    >
      <SidebarProvider>
        <Header />
        <main>{children}</main>
        <Footer />
      </SidebarProvider>
    </ProgressProvider>
  );
}
