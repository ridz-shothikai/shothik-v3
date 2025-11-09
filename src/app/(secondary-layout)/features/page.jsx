import MetaAdsFeatures from "@/components/(secondary-layout)/(features)/MetaAdsFeatures";

export async function generateMetadata() {
  return {
    title: "Features | Shothik AI",
    description: "This is Features page",
  };
}

export default function FaqsPage() {
  return (
    <>
      <MetaAdsFeatures/>
    </>
  );
}