import { ANNOUNCEMENTS } from '@/lib/site-content';

function MarqueeItems() {
  return ANNOUNCEMENTS.flatMap((item) => [
    <span key={item} className="mx-8">
      {item}
    </span>,
    <span key={`${item}-sep`} className="mx-8 opacity-50">
      ·
    </span>,
  ]);
}

export function MarqueeBar() {
  return (
    <div
      aria-hidden
      className="fixed top-0 z-50 w-full border-b border-saan-charcoal/30 bg-saan-charcoal/90 py-2 backdrop-blur-sm"
    >
      <div className="marquee-container text-[10px] font-light uppercase tracking-[0.2em] text-saan-champagne sm:text-xs">
        <div className="marquee-content animate-marquee">
          <MarqueeItems />
          <MarqueeItems />
        </div>
      </div>
    </div>
  );
}
