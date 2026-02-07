'use client';

import { ReactNode, useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, className = '', children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-dash-card border border-dash-border rounded-xl shadow-xl max-w-lg w-full p-6 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-dash-text">{title}</h2>
            <button
              onClick={onClose}
              className="text-dash-text-muted hover:text-dash-text transition-colors text-lg leading-none"
            >
              &times;
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
