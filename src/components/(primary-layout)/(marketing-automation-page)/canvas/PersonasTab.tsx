"use client";

import type { Ad, Persona } from "@/types/campaign";
import { Users } from "lucide-react";

interface PersonasTabProps {
  personas: Persona[];
  ads: Ad[];
}

export default function PersonasTab({ personas, ads }: PersonasTabProps) {
  if (personas.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-12 text-center">
        <Users className="mx-auto mb-4 h-16 w-16 text-purple-400" />
        <h3 className="mb-2 text-lg font-semibold text-white">
          No Personas Yet
        </h3>
        <p className="text-sm text-gray-400">
          Chat with AI to identify buyer personas for your product
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {personas.map((persona, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6"
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="mb-2 text-2xl font-bold text-white">
                {persona.name}
              </h3>
              <p className="text-gray-300">{persona.description}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/20">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
              <h4 className="mb-3 text-sm font-semibold text-gray-300">
                Pain Points
              </h4>
              <ul className="space-y-2">
                {persona.pain_points?.map((pain, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-300"
                  >
                    <span className="text-red-500">•</span>
                    {pain}
                  </li>
                )) || (
                  <li className="text-sm text-gray-400 italic">
                    No pain points defined
                  </li>
                )}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
              <h4 className="mb-3 text-sm font-semibold text-gray-300">
                Motivations
              </h4>
              <ul className="space-y-2">
                {persona.motivations?.map((motivation, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-300"
                  >
                    <span className="text-green-500">•</span>
                    {motivation}
                  </li>
                )) || (
                  <li className="text-sm text-gray-400 italic">
                    No motivations defined
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-700/50 pt-4">
            <p className="text-sm text-gray-400">
              Ads for this persona:{" "}
              <span className="font-semibold text-white">
                {ads.filter((ad) => ad.persona === persona.name).length}
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
