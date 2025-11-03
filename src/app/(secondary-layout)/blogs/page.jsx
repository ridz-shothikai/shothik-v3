import BlogContainer from "@/components/(secondary-layout)/(blogs-page)/BlogContainer";

export async function generateMetadata() {
  return {
    title: "Blogs | Shothik AI",
    description: "This is Blogs page",
  };
}

export default function Blogs() {
  return (
    <div className="container mx-auto mb-16 px-4 py-16">
      <BlogContainer />
    </div>
  );
}
