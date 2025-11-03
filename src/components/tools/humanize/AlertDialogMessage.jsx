import { Gem } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const AlertDialogMessage = () => {
  return (
    <div className="absolute left-1/2 top-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center">
      <div className="w-[90%] max-w-sm rounded-lg bg-card p-5 text-center text-card-foreground shadow">
        <h3 className="mb-2 text-xl font-semibold">Upgrade</h3>
        <p className="text-sm text-muted-foreground">
          Unlock advanced features and enhance your paraphrasing experience.
        </p>
        <Link href="/pricing" className="inline-block">
          <Button className="mt-4">
            <Gem className="mr-2 h-4 w-4" /> Upgrade to Premium
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AlertDialogMessage;
