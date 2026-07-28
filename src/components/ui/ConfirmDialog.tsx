import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDestructive = false,
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      showCloseButton={false}
      className="sm:max-w-sm m-4 rounded-3xl" // More compact for alerts
    >
      <div className="flex flex-col items-center text-center">
        <h3 className="text-xl font-bold text-text-primary mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-text-secondary mb-6">
            {description}
          </p>
        )}
        
        <div className="w-full flex flex-col gap-3 mt-2">
          <Button
            variant={isDestructive ? "danger" : "primary"}
            fullWidth
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onClick={onClose}
            className="text-text-primary font-medium"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
