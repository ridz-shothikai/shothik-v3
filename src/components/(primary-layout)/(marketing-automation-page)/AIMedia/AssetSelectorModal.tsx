import { Check, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Asset {
  _id: string;
  name: string;
  imagekitUrl: string;
  thumbnailUrl?: string;
  type: string;
}

interface AssetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  mode: "single" | "multiple";
  onSelect: (selectedUrls: string[]) => void;
  title: string;
  selectedAssets?: string[];
}

export default function AssetSelectorModal({
  isOpen,
  onClose,
  assets,
  mode,
  onSelect,
  title,
  selectedAssets = [],
}: AssetSelectorModalProps) {
  const [selected, setSelected] = useState<string[]>(selectedAssets);

  const handleToggle = (url: string) => {
    if (mode === "single") {
      setSelected([url]);
    } else {
      setSelected((prev) =>
        prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
      );
    }
  };

  const handleConfirm = () => {
    onSelect(selected);
    onClose();
  };

  // Show all assets (images, logos, and videos)
  const filteredAssets = assets;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === "multiple"
              ? "Select multiple assets (images, logos, videos)"
              : "Select an asset"}
          </DialogDescription>
        </DialogHeader>

        {/* Assets Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredAssets.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <p className="text-lg">No assets available</p>
              <p className="mt-2 text-sm">Upload some media first</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredAssets.map((asset) => {
                const isSelected = selected.includes(asset.imagekitUrl);
                return (
                  <div
                    key={asset._id}
                    onClick={() => handleToggle(asset.imagekitUrl)}
                    className={cn(
                      "group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all",
                      isSelected
                        ? "border-primary ring-2 ring-primary/50"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex aspect-square items-center justify-center bg-muted">
                      {asset.type === "video" ? (
                        <video
                          src={asset.imagekitUrl}
                          className="h-full w-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={asset.thumbnailUrl || asset.imagekitUrl}
                          alt={asset.name}
                          className={cn(
                            "h-full w-full",
                            asset.type === "logo"
                              ? "object-contain p-4"
                              : "object-cover"
                          )}
                        />
                      )}
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 rounded-full bg-primary p-1">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}

                    {/* Asset Name */}
                    <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <p className="truncate text-xs font-medium text-foreground">
                        {asset.name}
                      </p>
                    </div>

                    {/* Hover Overlay */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-primary/20 opacity-0 transition-opacity group-hover:opacity-100",
                        isSelected && "opacity-100"
                      )}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border p-6">
          <p className="text-sm text-muted-foreground">
            {selected.length} selected
            {mode === "multiple" && ` (${selected.length} assets)`}
          </p>
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selected.length === 0}
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
