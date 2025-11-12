import MetaAdsFeatures from "@/components/(secondary-layout)/(features)/MetaAdsFeatures";
import AgentLandingPage from "@/components/agents/AgentLandingPageMock";

export async function generateMetadata() {
  return {
    title: "Features | Shothik AI",
    description: "This is Features page",
  };
}

export default function FaqsPage() {
  return (
    <>
      {/* <MetaAdsFeatures /> */}
      <AgentLandingPage />
      {/* <iframe
        src="http://localhost:3000/paraphrase"
        // src={AgentLandingPage}
        width="10%"
        height="600"
        frameborder="0"
        allowfullscreen
      ></iframe> */}
    </>
  );
}