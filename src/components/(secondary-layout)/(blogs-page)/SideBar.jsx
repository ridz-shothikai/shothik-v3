"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import useResponsive from "@/hooks/ui/useResponsive";
import { useCategoryQuery } from "@/redux/api/blog/blogApiSlice";
import { ArrowRight, X } from "lucide-react";
import { useState } from "react";
import CategoryBtn from "./CategoryBtn";
import SideCard from "./SideCard";
import SideMenu from "./SideMenu";

const SideBar = ({ onCategoryClick, selectedCategory }) => {
  const [open, setOpen] = useState(false);
  const isMobile = useResponsive("down", "sm");
  const { data: categories, isLoading } = useCategoryQuery();

  const handleCategoryClick = (category) => {
    onCategoryClick(category._id);
    if (isMobile) {
      setOpen(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="w-full md:w-[250px]">
      <div className="w-[250px]">
        {isMobile ? (
          <>
            <Button
              variant="default"
              size="lg"
              onClick={handleOpen}
              className="w-full"
            >
              Popular Topics
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent
                showCloseButton={false}
                className="data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom fixed top-auto right-0 bottom-0 left-0 h-[80vh] max-w-full translate-x-0 translate-y-0 rounded-t-2xl border-t p-0"
              >
                <div className="flex h-full flex-col overflow-hidden">
                  {/* Header with close button */}
                  <div className="flex flex-shrink-0 items-center justify-between border-b p-4">
                    <h6 className="text-lg font-semibold">All topics</h6>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClose}
                      className="transition-transform hover:scale-110"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Scrollable content */}
                  <div className="flex-1 overflow-y-auto overscroll-contain p-4">
                    <div className="space-y-1">
                      {categories?.data?.length ? (
                        categories.data.map((category) => (
                          <Button
                            key={category._id}
                            variant="ghost"
                            className="hover:bg-accent w-full justify-start rounded-lg p-3 text-left"
                            onClick={() => handleCategoryClick(category)}
                          >
                            {category.title}
                          </Button>
                        ))
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-muted-foreground">
                            No Category found
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6">
                      <SideMenu />
                    </div>

                    <div className="bg-muted mt-6 mb-4 rounded-lg p-4">
                      <SideCard />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="flex max-w-[500px] flex-col gap-4">
            <div className="bg-card scrollbar-hide flex flex-col overflow-y-auto rounded">
              <CategoryBtn
                selectedCategory={selectedCategory}
                category={{ title: "All topics", _id: "" }}
                handleCategoryClick={handleCategoryClick}
              />
              <div>
                {isLoading ? (
                  <>
                    <Skeleton className="mb-2 h-5 w-full" />
                    <Skeleton className="mb-2 h-5 w-full" />
                    <Skeleton className="mb-2 h-5 w-full" />
                    <Skeleton className="mb-2 h-5 w-full" />
                    <Skeleton className="mb-2 h-5 w-full" />
                    <Skeleton className="mb-2 h-5 w-full" />
                    <Skeleton className="mb-2 h-5 w-full" />
                    <Skeleton className="mb-2 h-5 w-full" />
                  </>
                ) : !categories?.data?.length ? (
                  <div>
                    <p className="text-muted-foreground">No Category found</p>
                  </div>
                ) : (
                  categories?.data?.map((category) => (
                    <CategoryBtn
                      selectedCategory={selectedCategory}
                      key={category._id}
                      category={category}
                      handleCategoryClick={handleCategoryClick}
                    />
                  ))
                )}
              </div>
              <SideMenu />
            </div>
            <Card className="rounded p-2">
              <SideCard />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SideBar;
