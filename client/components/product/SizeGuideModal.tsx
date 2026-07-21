'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { SizeGuideCharts } from '@/components/product/SizeGuideCharts';
import { useScrollLock } from '@/hooks/useScrollLock';
import { SIZE_GUIDE_CHARTS, SIZE_GUIDE_COPY } from '@/lib/size-guide';

type SizeGuideModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.button
            type="button"
            aria-label="Close size guide overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-saan-charcoal/40"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-guide-title"
            data-lenis-prevent
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="scrollbar-panel relative max-h-[min(92dvh,920px)] w-full max-w-4xl overflow-y-auto overscroll-contain bg-paper shadow-xl lg:max-w-5xl"
          >
            <div className="sticky top-0 z-10 border-b border-neutral-200 bg-paper px-6 py-6 md:px-8 md:py-7">
              <button
                type="button"
                aria-label="Close size guide"
                onClick={onClose}
                className="absolute right-4 top-4 text-saan-charcoal transition-opacity hover:opacity-60 md:right-5 md:top-5"
              >
                <X className="h-5 w-5" strokeWidth={1.25} />
              </button>

              <h2
                id="size-guide-title"
                className="pr-8 font-display text-2xl text-saan-charcoal md:text-3xl"
              >
                {SIZE_GUIDE_COPY.title}
              </h2>
              <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-saan-ink/60 md:text-base">
                {SIZE_GUIDE_COPY.intro}
              </p>
            </div>

            <div className="px-6 py-6 md:px-8 md:py-7">
              <SizeGuideCharts charts={SIZE_GUIDE_CHARTS} />
              <p className="mt-8 font-body text-xs leading-relaxed text-saan-ink/55 md:text-sm">
                {SIZE_GUIDE_COPY.footer}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
