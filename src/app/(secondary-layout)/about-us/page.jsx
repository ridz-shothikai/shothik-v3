import AboutHero from "@/components/(secondary-layout)/(about-page)/AboutHero";
import AboutTeam from "@/components/(secondary-layout)/(about-page)/AboutTeam";
import AboutVision from "@/components/(secondary-layout)/(about-page)/AboutVision";
import AboutWhat from "@/components/(secondary-layout)/(about-page)/AboutWhat";

export async function generateMetadata() {
  return {
    title: "About us | Shothik AI",
    description: "This is About us page",
  };
}

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <div className="container mx-auto px-4">
        <AboutWhat />
        <AboutVision />
        <div className="bg-border mx-auto mt-12 mb-2 h-0.5 w-[100px]" />
        <div className="bg-border mx-auto mb-12 h-0.5 w-[100px]" />
        <AboutTeam />
      </div>
    </>
  );
}
