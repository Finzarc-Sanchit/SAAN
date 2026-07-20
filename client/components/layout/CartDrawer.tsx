'use client';

import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useCart } from '@/components/providers/CartProvider';
import { formatPrice } from '@/lib/site-content';

export function CartDrawer() {
  const { isOpen, closeCart, items, count, removeItem, updateQuantity } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, closeCart]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close cart overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-saan-charcoal/40"
            onClick={closeCart}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-paper shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-saan-champagne/60 px-6 py-5">
              <h2 className="text-label-caps text-saan-charcoal">
                Cart ({count})
              </h2>
              <button
                type="button"
                aria-label="Close cart"
                onClick={closeCart}
                className="text-saan-charcoal transition-opacity hover:opacity-60"
              >
                <X className="h-5 w-5" strokeWidth={1.25} />
              </button>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto px-6 py-8">
              {items.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <ShoppingBag
                    className="mb-4 h-10 w-10 text-saan-charcoal/40"
                    strokeWidth={1.25}
                  />
                  <p className="text-sm text-saan-ink/60">Your cart is empty</p>
                </div>
              ) : (
                <ul className="space-y-6">
                  {items.map((item) => (
                    <li
                      key={`${item.productId}-${item.size ?? 'default'}`}
                      className="flex gap-4 border-b border-saan-champagne/40 pb-6"
                    >
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-saan-champagne/20">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover object-center"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="text-sm leading-snug text-saan-ink">{item.name}</p>
                        {item.size && (
                          <p className="mt-0.5 font-body text-xs text-saan-ink/50">
                            Size: {item.size}
                          </p>
                        )}
                        <p className="mt-1 font-display text-sm text-ink">
                          {formatPrice(item.price, item.currency)}
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex items-center border border-saan-champagne/60">
                            <button
                              type="button"
                              aria-label={`Decrease quantity of ${item.name}`}
                              onClick={() => updateQuantity(item.productId, -1, item.size)}
                              className="flex h-8 w-8 items-center justify-center text-saan-ink transition-colors hover:bg-saan-champagne/30"
                            >
                              <Minus className="h-3.5 w-3.5" strokeWidth={1.25} />
                            </button>
                            <span className="min-w-[2rem] text-center text-sm text-saan-ink">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label={`Increase quantity of ${item.name}`}
                              onClick={() => updateQuantity(item.productId, 1, item.size)}
                              className="flex h-8 w-8 items-center justify-center text-saan-ink transition-colors hover:bg-saan-champagne/30"
                            >
                              <Plus className="h-3.5 w-3.5" strokeWidth={1.25} />
                            </button>
                          </div>
                          <span className="font-display text-sm text-ink">
                            {formatPrice(item.price * item.quantity, item.currency)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.size)}
                          className="mt-2 w-fit text-xs uppercase tracking-wider text-saan-ink/50 underline hover:text-ink"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-saan-champagne/60 px-6 py-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-saan-ink/70">Subtotal</span>
                  <span className="font-display text-ink">
                    {formatPrice(subtotal, items[0]?.currency ?? 'INR')}
                  </span>
                </div>
                <p className="mb-4 text-xs text-saan-ink/50">
                  Shipping calculated at checkout
                </p>
                <button
                  type="button"
                  className="text-label-caps w-full bg-ink py-3.5 text-paper transition-colors hover:bg-saan-charcoal"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
