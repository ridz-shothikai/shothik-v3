import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";

const BlogHeader = ({ searchQuery, setSearchQuery }) => {
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="bg-primary rounded-lg px-5 py-4 mb-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
      <div className="md:col-span-9">
        <div className="pt-4 pb-2">
          <h6 className="text-lg font-semibold text-primary-foreground mb-4">
            Search our 8,000+ development and sysadmin blogs.
          </h6>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search Blogs ..."
              value={searchQuery}
              onChange={handleInputChange}
              className="w-full bg-background pl-10 border-none"
            />
          </div>
          <p className="text-sm text-primary-foreground/80 mt-2">
            search this query on questions and answers
          </p>
        </div>
      </div>
      <div className="md:col-span-3 flex justify-center md:justify-end">
        <Image
          src="/moscot.png"
          alt="Blog Header Image"
          height={180}
          width={200}
        />
      </div>
    </div>
  );
};

export default BlogHeader;
