"use client";

import { useEffect } from "react";
import Button from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger";
  onConfirm?: () => void;
  loading?: boolean;
  children?: React.ReactNode;
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Onayla",
  confirmVariant = "primary",
  onConfirm,
  loading = false,
  children,
}: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6 animate-slide-up">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold font-display text-text-primary">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm font-body text-text-secondary">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {children && <div className="mb-5">{children}</div>}

        {onConfirm && (
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              İptal
            </Button>
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              loading={loading}
            >
              {confirmLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
