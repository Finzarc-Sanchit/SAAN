'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { SIZE_GUIDE_COPY, SIZE_GUIDE_ROWS } from '@/lib/size-guide';

type SizeGuideModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close size guide overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-saan-charcoal/40"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-guide-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-paper px-6 py-8 shadow-xl md:px-8 md:py-10"
          >
            <button
              type="button"
              aria-label="Close size guide"
              onClick={onClose}
              className="absolute right-4 top-4 text-saan-charcoal transition-opacity hover:opacity-60"
            >
              <X className="h-5 w-5" strokeWidth={1.25} />
            </button>

            <h2
              id="size-guide-title"
              className="font-display text-2xl text-saan-charcoal"
            >
              {SIZE_GUIDE_COPY.title}
            </h2>
            <p className="mt-3 font-body text-sm leading-relaxed text-saan-ink/60">
              {SIZE_GUIDE_COPY.intro}
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[280px] text-left">
                <thead>
                  <tr className="border-b border-saan-champagne/60">
                    <th className="text-label-caps pb-3 pr-4 text-[10px] text-saan-ink/50">
                      Size
                    </th>
                    <th className="text-label-caps pb-3 pr-4 text-[10px] text-saan-ink/50">
                      Bust
                    </th>
                    <th className="text-label-caps pb-3 pr-4 text-[10px] text-saan-ink/50">
                      Waist
                    </th>
                    <th className="text-label-caps pb-3 text-[10px] text-saan-ink/50">
                      Hip
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_GUIDE_ROWS.map((row) => (
                    <tr key={row.size} className="border-b border-saan-champagne/30">
                      <td className="py-3 pr-4 font-body text-sm text-saan-charcoal">
                        {row.size}
                      </td>
                      <td className="py-3 pr-4 font-body text-sm text-saan-ink/70">
                        {row.bust}
                      </td>
                      <td className="py-3 pr-4 font-body text-sm text-saan-ink/70">
                        {row.waist}
                      </td>
                      <td className="py-3 font-body text-sm text-saan-ink/70">
                        {row.hip}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-6 font-body text-xs leading-relaxed text-saan-ink/55">
              {SIZE_GUIDE_COPY.footer}
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
