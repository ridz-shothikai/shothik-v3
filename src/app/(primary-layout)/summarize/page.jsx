import { summarizeFaq } from "@/_mock/tools/summarizefaq";
import SummarizeContentSection from "@/components/(primary-layout)/(summarize-page)/SummarizeContentSection";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import HomeAdvertisement from "@/components/common/HomeAdvertisement";
import ToolsCTA from "@/components/tools/common/ToolsCTA";
import ToolsSepecigFaq from "@/components/tools/common/ToolsSepecigFaq";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return {
    title: "Summarize || Shothik AI",
    description: "This is Summarize page",
  };
}

const Summarize = () => {
  return (
    <div
      className={cn("container mx-auto flex flex-col gap-10 px-4 md:gap-14")}
    >
      <ErrorBoundary>
        <SummarizeContentSection />
      </ErrorBoundary>
      <ToolsSepecigFaq
        tag="All you need to know about Summarize feature"
        data={summarizeFaq}
      />
      <ToolsCTA toolType="summarize" />
      <HomeAdvertisement />
    </div>
  );
};

export default Summarize;
