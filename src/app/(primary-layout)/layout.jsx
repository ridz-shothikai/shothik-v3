import AuthApplier from "@/components/appliers/AuthApplier";
import AuthSuccessPopup from "@/components/auth/AuthSuccessPopoup";
import VerifyEmailAlert from "@/components/auth/VerifyEmailAlert";
import Footer from "@/components/partials/footer";
import Header from "@/components/partials/header";
import NavigationSidebar from "@/components/partials/navigation-sidebar";
import AlertDialog from "@/components/tools/common/AlertDialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProgressProvider from "@/providers/ProgressProvider";

export default function PrimaryLayout({ children }) {
  return (
    <ProgressProvider
      color={"#00AB55"}
      options={{ showSpinner: false }}
      shallowRouting
    >
      <>
        <AuthApplier />
      </>
      <div suppressHydrationWarning>
        <SidebarProvider defaultOpen={true}>
          <div className="flex h-screen w-full">
            <NavigationSidebar />
            <div className="flex min-h-screen flex-1 flex-col">
              <div>
                <Header layout="primary" />
                <VerifyEmailAlert />
              </div>
              <div className="flex max-w-full flex-1 flex-col overflow-y-auto">
                <div className="flex flex-1 flex-col">{children}</div>
                <Footer />
              </div>
            </div>
          </div>
        </SidebarProvider>
      </div>
      <>
        <AuthSuccessPopup />
        <AlertDialog />
      </>
    </ProgressProvider>
  );
}
