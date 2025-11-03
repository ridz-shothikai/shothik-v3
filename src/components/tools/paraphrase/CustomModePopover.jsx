// src/components/tools/paraphrase/CustomModePopover.jsx
import { Popover, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import CustomModeContent from "./CustomModeContent";

/**
 * Popover wrapper for editing existing custom modes
 * Shows when user clicks on a custom mode tab
 */
const CustomModePopover = ({
  anchorEl,
  open,
  onClose,
  modeName,
  recentModes,
  recommendedModes,
  onUpdate,
  onDelete,
  error,
  isLoading,
}) => {
  const handleUpdate = (newName) => {
    onUpdate(newName);
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <PopoverContent
        side="bottom"
        align="center"
        className={cn("max-w-[500px] rounded-2xl p-0 shadow-md")}
      >
        <div className="p-2.5">
          <CustomModeContent
            mode="edit"
            existingModeName={modeName}
            recentModes={recentModes}
            recommendedModes={recommendedModes}
            onSubmit={handleUpdate}
            onDelete={handleDelete}
            onClose={onClose}
            error={error}
            isLoading={isLoading}
            showHeader={true}
            showActions={true}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CustomModePopover;
