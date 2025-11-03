import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const BlogLoading = () => {
  return (
    <div className="grid grid-cols-1 gap-4 py-10 text-center sm:grid-cols-2 md:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div key={item}>
          <Card className="h-full overflow-hidden rounded-lg shadow-md">
            <CardContent>
              <Skeleton className="h-[140px] w-full rounded-md" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-[60%] rounded-md" />
                <Skeleton className="h-4 w-[80%] rounded-md" />
                <Skeleton className="h-4 w-[40%] rounded-md" />
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default BlogLoading;
