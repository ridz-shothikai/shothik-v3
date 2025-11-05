import { Play, Settings, Trash2 } from "lucide-react";

interface AvatarPreviewProps {
  personaImage: string;
  personaName: string;
  personaId: string;
}

export default function AvatarPreview({
  personaImage,
  personaName,
  personaId,
}: AvatarPreviewProps) {
  return (
    <div className="rounded-xl bg-slate-800 p-4">
      <div className="flex items-center gap-4">
        <img
          src={personaImage}
          alt={personaName}
          className="h-20 w-20 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold">{personaName}</h3>
          <p className="text-sm text-gray-400">{personaId}</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg p-2 transition-colors hover:bg-slate-700">
            <Play className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-2 transition-colors hover:bg-slate-700">
            <Settings className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-2 text-red-400 transition-colors hover:bg-slate-700">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
