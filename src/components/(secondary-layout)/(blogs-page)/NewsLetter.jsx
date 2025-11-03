import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useSnackbar from "@/hooks/useSnackbar";
import { cn } from "@/lib/utils";
import { useNewsletterMutation } from "@/redux/api/blog/blogApiSlice";
import { useState } from "react";

const NewsLetter = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [newsletter] = useNewsletterMutation();
  const enqueueSnackbar = useSnackbar();
  const [email, setEmail] = useState("");

  async function handlenewLatter(e) {
    try {
      e.preventDefault();
      setIsLoading(true);
      if (!email) {
        enqueueSnackbar("Please enter your email address.", {
          variant: "error",
        });
        return;
      }
      await newsletter({ email }).unwrap();
      enqueueSnackbar("Thank you for subscribing to our newsletter!", {
        variant: "success",
      });
      setEmail("");
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error.data?.message || "Something went wrong", {
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <form onSubmit={handlenewLatter} className={cn("mt-10")}>
      <h2 className="mb-4 text-xl leading-tight font-semibold">
        Get our newsletter
      </h2>
      <p className="text-muted-foreground mb-4 text-sm">
        Stay up to date by signing up for Shothik AI&apos;s Infrastructure as a
        Newsletter.
      </p>
      <div className="mt-2 flex gap-2">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Email address"
          className="h-9 flex-grow"
        />
        <Button disabled={isLoading} type="submit" variant="default">
          Submit
        </Button>
      </div>
    </form>
  );
};

export default NewsLetter;
