import { useCallback, useState } from "react";
import { createRoot } from "react-dom/client";

type ConfirmOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
};

const useAlert = () => {
  return useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      const container = document.createElement("div");
      document.body.appendChild(container);
      const root = createRoot(container);

      const handleClose = (result: boolean) => {
        root.unmount();
        container.remove();
        resolve(result);
      };

      root.render(<ConfirmModal {...options} onClose={handleClose} />);
    });
  }, []);
};

const ConfirmModal = ({
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onClose,
}: ConfirmOptions & { onClose: (result: boolean) => void }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleConfirm = () => {
    setIsOpen(false);
    onClose(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    onClose(false);
  };

  return <></>;
};

export default useAlert;
