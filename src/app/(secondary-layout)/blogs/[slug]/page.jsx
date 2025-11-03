import MainLayout from "@/components/(secondary-layout)/(blogs-page)/details/MainLayout";

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL_WITH_PREFIX}/blog/${slug}`);
    const blogData = await res.json();

    if (!blogData?.data) {
      return {
        title: "Blog Not Found | Shothik AI",
        description: "Blog not found",
      };
    }
    const blog = blogData.data;

    const metaTitle =
      blog?.metaTitle || blog?.title || "Shothik AI blog section";
    const metaDescription =
      blog?.metaDescription ||
      blog?.content?.slice(0, 150)?.replace(/\u003e|\u003ch2/g, "") ||
      "Shothik AI blog section";
    const metaKeywords =
      blog?.metaKeywords || "Shothik AI, Paraphrase, Humanize contend";
    const metaImage = blog?.banner;

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: metaKeywords,
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        images: [metaImage],
        url: `${process.env.NEXT_PUBLIC_APP_URL}/blogs/${slug}`,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: metaTitle,
        description: metaDescription,
        images: [metaImage],
      },
    };
  } catch (error) {
    console.error("Error fetching blog data:", error);
    return {
      title: "Error | Shothik AI",
      description: "Error fetching blog data",
    };
  }
}

const BlogDetails = async ({ params }) => {
  let blog = null;
  try {
    const { slug } = await params;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL_WITH_PREFIX}/blog/${slug}`);
    const blogData = await res.json();

    if (!blogData?.data) {
      return (
        <div className="w-full py-20 text-center">
          <h6 className="text-muted-foreground text-lg">No blogs found.</h6>
        </div>
      );
    }
    blog = blogData.data;
  } catch (error) {
    console.error("Error fetching blog data:", error);
    return (
      <div className="w-full py-20 text-center">
        <h6 className="text-muted-foreground text-lg">Error loading blog</h6>
      </div>
    );
  }

  return <MainLayout blog={blog} />;
};

export default BlogDetails;
