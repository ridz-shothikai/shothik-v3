import type { Ad, Persona } from "@/types/campaign";
import { Users } from "lucide-react";

interface PersonasTabProps {
  personas: Persona[];
  ads: Ad[];
}

export default function PersonasTab({ personas, ads }: PersonasTabProps) {
  if (personas.length === 0) {
    return (
      <div className="bg-slate-800/60 rounded-2xl p-12 text-center border border-slate-700/50">
        <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-white font-semibold text-lg mb-2">
          No Personas Yet
        </h3>
        <p className="text-gray-400 text-sm">
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
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {persona.name}
              </h3>
              <p className="text-gray-300">{persona.description}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <h4 className="text-gray-300 text-sm font-semibold mb-3">
                Pain Points
              </h4>
              <ul className="space-y-2">
                {persona.pain_points?.map((pain, idx) => (
                  <li
                    key={idx}
                    className="text-gray-300 text-sm flex items-start gap-2"
                  >
                    <span className="text-red-500">•</span>
                    {pain}
                  </li>
                )) || (
                  <li className="text-gray-400 text-sm italic">
                    No pain points defined
                  </li>
                )}
              </ul>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <h4 className="text-gray-300 text-sm font-semibold mb-3">
                Motivations
              </h4>
              <ul className="space-y-2">
                {persona.motivations?.map((motivation, idx) => (
                  <li
                    key={idx}
                    className="text-gray-300 text-sm flex items-start gap-2"
                  >
                    <span className="text-green-500">•</span>
                    {motivation}
                  </li>
                )) || (
                  <li className="text-gray-400 text-sm italic">
                    No motivations defined
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-gray-400 text-sm">
              Ads for this persona:{" "}
              <span className="text-white font-semibold">
                {ads.filter((ad) => ad.persona === persona.name).length}
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
