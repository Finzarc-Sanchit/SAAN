'use client';

import { Eye, EyeOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormEvent, useEffect, useState } from 'react';
import { useAuthPanel } from '@/components/providers/AuthPanelProvider';
import { cn } from '@/lib/utils';

export function AuthModal() {
  const { isOpen, closeAuth, tab, setTab } = useAuthPanel();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuth();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, closeAuth]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    closeAuth();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close sign in overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-saan-charcoal/40"
            onClick={closeAuth}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 bg-saan-bone px-8 py-10 shadow-xl"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={closeAuth}
              className="absolute right-4 top-4 text-saan-charcoal transition-opacity hover:opacity-60"
            >
              <X className="h-5 w-5" strokeWidth={1.25} />
            </button>

            <h2
              id="auth-modal-title"
              className="mb-8 text-center font-display text-2xl text-saan-charcoal"
            >
              {tab === 'sign-in' ? 'Sign In' : 'Register'}
            </h2>

            <div className="mb-8 flex border-b border-saan-champagne/60">
              {(['sign-in', 'register'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTab(option)}
                  className={cn(
                    'text-label-caps flex-1 pb-3 transition-colors',
                    tab === option
                      ? 'border-b-2 border-saan-maroon text-saan-maroon'
                      : 'text-saan-ink/40 hover:text-saan-ink'
                  )}
                >
                  {option === 'sign-in' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="auth-email" className="text-label-caps mb-2 block text-saan-ink">
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="w-full border border-saan-champagne/80 bg-transparent px-3 py-3 text-sm text-saan-ink placeholder:text-saan-ink/40 focus:border-saan-maroon focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  className="text-label-caps mb-2 block text-saan-ink"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full border border-saan-champagne/80 bg-transparent px-3 py-3 pr-10 text-sm text-saan-ink focus:border-saan-maroon focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-saan-ink/50 hover:text-saan-maroon"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" strokeWidth={1.25} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={1.25} />
                    )}
                  </button>
                </div>
              </div>

              {tab === 'register' && (
                <div>
                  <label
                    htmlFor="auth-confirm"
                    className="text-label-caps mb-2 block text-saan-ink"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="auth-confirm"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full border border-saan-champagne/80 bg-transparent px-3 py-3 text-sm text-saan-ink focus:border-saan-maroon focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="text-label-caps w-full bg-saan-maroon py-3.5 text-saan-bone transition-colors hover:bg-saan-gold"
              >
                {tab === 'sign-in' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
