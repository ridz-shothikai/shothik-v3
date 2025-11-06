"use client";

import type { Ad, Persona } from "@/types/campaign";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface PersonasTabProps {
  personas: Persona[];
  ads: Ad[];
}

export default function PersonasTab({ personas, ads }: PersonasTabProps) {
  if (personas.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Users className="mx-auto mb-4 h-16 w-16 text-primary" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          No Personas Yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Chat with AI to identify buyer personas for your product
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {personas.map((persona, index) => (
        <Card key={index} className="p-6">
          <CardHeader>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <CardTitle className="mb-2 text-2xl font-bold">
                  {persona.name}
                </CardTitle>
                <p className="text-muted-foreground">{persona.description}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="mb-3 text-sm font-semibold text-foreground">
                  Pain Points
                </h4>
                <ul className="space-y-2">
                  {persona.pain_points?.map((pain, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <span className="text-destructive">•</span>
                      {pain}
                    </li>
                  )) || (
                    <li className="text-sm text-muted-foreground italic">
                      No pain points defined
                    </li>
                  )}
                </ul>
              </Card>
              <Card className="p-4">
                <h4 className="mb-3 text-sm font-semibold text-foreground">
                  Motivations
                </h4>
                <ul className="space-y-2">
                  {persona.motivations?.map((motivation, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <span className="text-primary">•</span>
                      {motivation}
                    </li>
                  )) || (
                    <li className="text-sm text-muted-foreground italic">
                      No motivations defined
                    </li>
                  )}
                </ul>
              </Card>
            </div>

            <div className="mt-4 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Ads for this persona:{" "}
                <span className="font-semibold text-foreground">
                  {ads.filter((ad) => ad.persona === persona.name).length}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
