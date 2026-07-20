'use client';

import Image from 'next/image';
import Link from 'next/link';
import { WHATSAPP_SUPPORT_URL } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

export function WhatsAppFloatingButton() {
  return (
    <Link
      href={WHATSAPP_SUPPORT_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with SAAN on WhatsApp"
      className={cn(
        'fixed right-5 z-[45] block h-12 w-12 overflow-hidden rounded-full bg-[#25D366] shadow-[0_10px_28px_-10px_rgb(11_10_9_/_0.45)]',
        'bottom-[max(1.25rem,env(safe-area-inset-bottom))] md:right-6 md:bottom-6 md:h-14 md:w-14',
        'transition-transform duration-300 ease-[var(--ease-luxury)] hover:scale-[1.04]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
        'motion-reduce:transition-none motion-reduce:hover:scale-100',
      )}
    >
      <Image
        src="/images/whatsApp-logo.png"
        alt=""
        fill
        sizes="(max-width: 768px) 48px, 56px"
        className="scale-[1.22] object-cover"
        priority={false}
      />
    </Link>
  );
}
