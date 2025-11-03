import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CategoryBtn({
  category,
  selectedCategory,
  handleCategoryClick,
}) {
  const isSelected = selectedCategory === category._id;
  return (
    <Button
      key={category._id}
      variant="ghost"
      className={cn(
        "w-full justify-start text-left p-2 m-0 hover:bg-accent",
        isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
      onClick={() => handleCategoryClick(category)}
    >
      {category.title}
    </Button>
  );
}
