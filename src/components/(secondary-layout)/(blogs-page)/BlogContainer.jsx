"use client";
import { useState } from "react";
import BottomCard from "./BottomCard";
import MainContend from "./MainContend";
import NewsLetter from "./NewsLetter";
import SideBar from "./SideBar";

const BlogContainer = () => {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleCategoryClick = (id) => {
    setPage(1);
    setSelectedCategory(id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
      <div className="md:col-span-3">
        <SideBar
          onCategoryClick={handleCategoryClick}
          selectedCategory={selectedCategory}
        />
      </div>

      <div className="md:col-span-9">
        <MainContend
          page={page}
          selectedCategory={selectedCategory}
          setPage={setPage}
        >
          <NewsLetter />
          <BottomCard />
        </MainContend>
      </div>
    </div>
  );
};

export default BlogContainer;
