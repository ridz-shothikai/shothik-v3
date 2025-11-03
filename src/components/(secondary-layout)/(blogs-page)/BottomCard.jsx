import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { setShowLoginModal } from "@/redux/slices/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

const BottomCard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <div className={cn("grid grid-cols-1 gap-8 md:grid-cols-2", "mt-24")}>
      <div
        className={cn("bg-primary text-primary-foreground", "rounded-lg p-8")}
      >
        <h5 className={cn("mb-4 text-xl font-semibold")}>
          Shothik AI for Writing Solutions
        </h5>
        <p className={cn("mb-4 text-sm leading-relaxed")}>
          Unleash the power of advanced AI tools — streamline your content
          creation, perfect grammar, and generate high-quality summaries with
          ease, all while scaling your projects effortlessly.
        </p>
        <Link href="/paraphrase">
          <Button
            variant="outline"
            className={cn(
              "text-primary-foreground border-primary-foreground",
              "hover:bg-primary-foreground/10",
              "mt-4",
            )}
          >
            View all tools
          </Button>
        </Link>
      </div>
      <div className={cn("bg-muted text-foreground", "rounded-lg p-[1.75rem]")}>
        <h5 className={cn("mb-4 text-xl font-semibold")}>
          {user?.email ? "Explore the features" : "Get started for free"}
        </h5>
        <p className={cn("mb-4 text-sm leading-relaxed")}>
          {user?.email
            ? "Welcome back! Explore the full range of Shothik AI's advanced tools to elevate your writing even further. Take your content creation to the next level with AI-powered paraphrasing, grammar refinement, and more!"
            : "Sign up and explore all the advanced tools of Shothik AI to enhance your writing."}
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
          className={cn("mt-4")}
        >
          {user?.email ? "Explore" : "Get started"}
        </Button>
      </div>
    </div>
  );
};

export default BottomCard;
