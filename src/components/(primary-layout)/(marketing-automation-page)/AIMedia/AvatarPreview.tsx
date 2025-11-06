import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="rounded-xl p-4">
      <CardContent className="flex items-center gap-4 p-0">
        <img
          src={personaImage}
          alt={personaName}
          className="h-20 w-20 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h3 className="text-foreground font-semibold">{personaName}</h3>
          <p className="text-muted-foreground text-sm">{personaId}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Play className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive">
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
