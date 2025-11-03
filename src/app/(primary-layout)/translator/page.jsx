import { transtorFaq } from "@/_mock/tools/translator";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import HomeAdvertisement from "@/components/common/HomeAdvertisement";
import ToolsCTA from "@/components/tools/common/ToolsCTA";
import ToolsSepecigFaq from "@/components/tools/common/ToolsSepecigFaq";
import Translator from "@/components/tools/tanslator/Translator";

export async function generateMetadata() {
  return {
    title: "Translator | Shothik AI",
    description: "This is Translator page",
  };
}

const TranslatorPage = () => {
  return (
    <div className="container mx-auto flex max-w-7xl flex-col gap-20 px-4 md:gap-28">
      <ErrorBoundary>
        <Translator />
      </ErrorBoundary>
      <ToolsSepecigFaq
        tag="All you need to know about Translator feature"
        data={transtorFaq}
      />
      <ToolsCTA toolType="translator" />
      <HomeAdvertisement />
    </div>
  );
};

export default TranslatorPage;
