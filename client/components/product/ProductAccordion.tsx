'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type ProductAccordionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
};

export function ProductAccordion({
  title,
  children,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  className,
}: ProductAccordionProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isOpen = controlledIsOpen ?? internalIsOpen;

  function handleToggle() {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen((previous) => !previous);
    }
    onToggle?.();
  }

  return (
    <div className={cn('border-b border-neutral-300', className)}>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={handleToggle}
        className="group flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-body-medium text-ink transition-transform duration-300 ease-[var(--ease-luxury)] group-hover:translate-x-1 motion-reduce:transform-none">
          {title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          className="text-neutral-500"
        >
          <Plus className="h-4 w-4" strokeWidth={1.25} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="overflow-hidden motion-reduce:transition-none"
          >
            <div className="pb-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
