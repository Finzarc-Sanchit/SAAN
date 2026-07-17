'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useId, useRef } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { LUXURY_EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';

type ModalShellProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  panelClassName?: string;
};

export function ModalShell({
  isOpen,
  onClose,
  title,
  children,
  className,
  panelClassName,
}: ModalShellProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  const transition = reducedMotion
    ? { duration: 0.01 }
    : { duration: 0.35, ease: LUXURY_EASE };

  const mobilePanel = {
    initial: { opacity: 0, y: '100%' },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '100%' },
  };

  const desktopPanel = {
    initial: { opacity: 0, scale: 0.96, y: 12 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: 12 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={cn('fixed inset-0 z-50', className)}>
          <motion.button
            type="button"
            aria-label="Close dialog overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            className="absolute inset-0 bg-saan-charcoal/40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={(isMobile ? mobilePanel : desktopPanel).initial}
            animate={(isMobile ? mobilePanel : desktopPanel).animate}
            exit={(isMobile ? mobilePanel : desktopPanel).exit}
            transition={transition}
            className={cn(
              'absolute bg-paper shadow-xl outline-none',
              isMobile
                ? 'inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-2xl px-6 pb-8 pt-6'
                : 'left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 px-8 py-10',
              panelClassName,
            )}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute right-4 top-4 text-saan-charcoal transition-opacity hover:opacity-60"
            >
              <X className="h-5 w-5" strokeWidth={1.25} />
            </button>

            <h2
              id={titleId}
              className="mb-8 text-center font-display text-2xl text-saan-charcoal"
            >
              {title}
            </h2>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
