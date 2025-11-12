"use client"
import { useState, useMemo } from "react";
import { NewsCard } from "@/components/(secondary-layout)/(blogs-page)/NewsCard";
import { CategoryTabs } from "@/components/(secondary-layout)/(blogs-page)/CategoryTabs";
import gradientBluePurple from "./assets/blog.png";
import gradientTeal from "./assets/blog1.png";
import gradientGreen from "./assets/blog2.png";
import gradientDark from "./assets/blog3.png";
import gradientPink from "./assets/blog4.png";
import gradientOrange from "./assets/blog5.png";


const newsArticles = [
  {
    id: 1,
    title: "Introducing Next-Gen AI Models with Enhanced Capabilities",
    category: "Product",
    date: "Nov 12, 2025",
    image: gradientBluePurple,
    featured: true,
  },
  {
    id: 2,
    title: "Building Safe AI Systems for Everyone",
    category: "Safety",
    date: "Nov 10, 2025",
    image: gradientGreen,
  },
  {
    id: 3,
    title: "New Research on Large Language Models",
    category: "Research",
    date: "Nov 8, 2025",
    image: gradientDark,
  },
  {
    id: 4,
    title: "Developer Tools for AI Integration",
    category: "Engineering",
    date: "Nov 5, 2025",
    image: gradientTeal,
  },
  {
    id: 5,
    title: "AI Safety Standards and Best Practices",
    category: "Safety",
    date: "Nov 3, 2025",
    image: gradientPink,
  },
  {
    id: 6,
    title: "Company Updates and Future Roadmap",
    category: "Company",
    date: "Nov 1, 2025",
    image: gradientOrange,
  },
];

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  // initialize correctly with strings
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

  const filteredAndSortedArticles = useMemo(() => {
    let filtered =
      activeCategory === "All"
        ? newsArticles
        : newsArticles.filter((article) => article.category === activeCategory);

    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return sorted;
  }, [activeCategory, sortBy]);

  return (
    <div className="bg-background min-h-screen">
      <main className="flex-1">
        <div className="container max-w-7xl px-6 py-8">
          <h1 className="mb-8 text-4xl font-bold">Blogs</h1>
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          <div
            className={`mt-8 ${
              viewMode === "grid"
                ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                : "flex flex-col gap-6"
            }`}
          >
            {filteredAndSortedArticles.map((article) => (
              <NewsCard
                key={article.id}
                id={article.id}
                title={article.title}
                category={article.category}
                date={article.date}
                image={article.image}
                featured={article.featured}
                viewMode={viewMode}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
