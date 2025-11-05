import { Check, X } from "lucide-react";
import { useState } from "react";

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="mt-1 text-sm text-gray-400">
              {mode === "multiple"
                ? "Select multiple assets (images, logos, videos)"
                : "Select an asset"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-slate-800"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Assets Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredAssets.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-gray-400">
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
                    className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-500/50"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex aspect-square items-center justify-center bg-slate-800">
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
                          className={`h-full w-full ${
                            asset.type === "logo"
                              ? "object-contain p-4"
                              : "object-cover"
                          }`}
                        />
                      )}
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 rounded-full bg-blue-500 p-1">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}

                    {/* Asset Name */}
                    <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <p className="truncate text-xs font-medium text-white">
                        {asset.name}
                      </p>
                    </div>

                    {/* Hover Overlay */}
                    <div
                      className={`absolute inset-0 bg-blue-500/20 opacity-0 transition-opacity group-hover:opacity-100 ${
                        isSelected ? "opacity-100" : ""
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 p-6">
          <p className="text-sm text-gray-400">
            {selected.length} selected
            {mode === "multiple" && ` (${selected.length} assets)`}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg bg-slate-800 px-6 py-2.5 font-medium text-white transition-colors hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selected.length === 0}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
