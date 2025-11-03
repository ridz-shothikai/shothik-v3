"use client";

import { Button } from "@/components/ui/button";
import { setShowLoginModal } from "@/redux/slices/auth";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

export default function SideCard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <>
      <h2 className="mb-1 font-bold">
        {user?.email
          ? user.package === "free"
            ? "Unlock Premium Features and Enhance Your Experience with Shothik AI"
            : "Explore All Features and Enhance Your Experience with Shothik AI"
          : "Sign up for free to access all features"}
      </h2>
      <p className="text-muted-foreground mb-2 text-xs">
        {(!user?.email || user?.package === "free") &&
          "Unlock the full potential of Shothik AI."}{" "}
        Experience AI-powered paraphrasing, human-like content generation,
        grammar refinement, and precise summarization to enhance your writing
        effortlessly.
      </p>
      <Button
        onClick={() => {
          if (user?.email) {
            router.push("/paraphrase");
          } else {
            dispatch(setShowLoginModal(true));
          }
        }}
        variant="default"
        className="w-full"
      >
        {user?.email ? "Explore the features" : "Sign up for free"}
      </Button>
    </>
  );
}
