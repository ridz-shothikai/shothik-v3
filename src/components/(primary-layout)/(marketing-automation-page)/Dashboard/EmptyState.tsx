"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EmptyState() {
  const router = useRouter();

  return (
    <Card className="p-12 text-center">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Target className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-foreground">
        No Published Campaigns Yet
      </h2>
      <p className="mx-auto mb-6 max-w-md text-muted-foreground">
        Publish your first campaign to Meta to see performance insights and
        AI-powered optimization suggestions.
      </p>
      <Button onClick={() => router.push("/marketing-automation/analysis")}>
        Go to Projects
      </Button>
    </Card>
  );
}
