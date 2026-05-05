'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: number;
  className?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 520, className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape key closes modal
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    // Focus the panel for keyboard navigation
    panelRef.current?.focus();
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 20px',
      }}
      // Backdrop click closes modal
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={className}
        style={{
          background: T.c50,
          borderRadius: 16,
          width: '100%',
          maxWidth,
          maxHeight: 'calc(100vh - 40px)',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${T.c200}`,
          boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
          outline: 'none',
          animation: 'lokal-fade-up 220ms cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      >
        {/* Header */}
        {title && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px 16px',
            borderBottom: `1px solid ${T.c200}`,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em' }}>
              {title}
            </span>
            <button
              onClick={onClose}
              aria-label="Close modal"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 4,
                borderRadius: 6,
                color: T.g500,
                transition: 'background 150ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = T.c200)}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Body — scrollable */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
