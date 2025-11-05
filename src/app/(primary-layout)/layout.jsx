"use client";

import AuthSuccessPopup from "@/components/auth/AuthSuccessPopoup";
import VerifyEmailAlert from "@/components/auth/VerifyEmailAlert";
import LoadingScreen from "@/components/common/LoadingScreen";
import Footer from "@/components/partials/footer";
import Header from "@/components/partials/header";
import NavigationSidebar from "@/components/partials/navigation-sidebar";
import AlertDialog from "@/components/tools/common/AlertDialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import useResponsive from "@/hooks/ui/useResponsive";
import {
  useGetUserLimitQuery,
  useGetUserQuery,
  useLoginMutation,
} from "@/redux/api/auth/authApi";
import { setShowLoginModal, setShowRegisterModal } from "@/redux/slices/auth";
import { AppProgressProvider as ProgressProvider } from "@bprogress/next";
import { useGoogleOneTapLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function PrimaryLayout({ children }) {
  const { open, sidebar } = useSelector((state) => state.settings);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const pathname = usePathname();
  const isSharedPage = pathname?.startsWith("/shared");
  const isMobile = useResponsive("down", "sm");
  const isCompact = sidebar === "compact";
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state.auth);
  const { isLoading } = useGetUserQuery(undefined, {
    skip: !accessToken,
  });
  useGetUserLimitQuery();

  const [login] = useLoginMutation();

  useEffect(() => {
    setIsLoadingPage(false);
  }, []);

  useGoogleOneTapLogin({
    onSuccess: async (res) => {
      try {
        const { email, name } = jwtDecode(res.credential);

        const response = await login({
          auth_type: "google",
          googleToken: res.credential,
          oneTapLogin: true,
          oneTapUser: {
            email,
            name,
          },
        });

        if (response?.data) {
          dispatch(setShowRegisterModal(false));
          dispatch(setShowLoginModal(false));
        }
      } catch (error) {
        console.error(error);
      }
    },
    flow: "auth-code",
    onError: (err) => {
      console.error(err);
    },
    scope: "email profile",
    disabled: isLoading || user?.email || isSharedPage,
  });

  if (isLoadingPage) return <LoadingScreen />;

  return (
    <ProgressProvider
      color={"#00AB55"}
      options={{ showSpinner: false }}
      shallowRouting
    >
      <div>
        <SidebarProvider defaultOpen={true}>
          <div className="flex h-screen w-full">
            <NavigationSidebar />
            <div className="flex min-h-screen flex-1 flex-col">
              <div>
                <Header layout="primary" />
                <VerifyEmailAlert />
              </div>
              <div className="flex max-w-full flex-1 flex-col overflow-y-auto">
                <div className="flex min-h-full flex-1 flex-col">
                  {children}
                </div>
                <Footer />
              </div>
            </div>
          </div>
        </SidebarProvider>

        <>
          <AuthSuccessPopup />
          <AlertDialog />
        </>
      </div>
    </ProgressProvider>
  );
}
