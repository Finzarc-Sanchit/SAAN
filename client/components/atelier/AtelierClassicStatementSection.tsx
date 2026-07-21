import Image from 'next/image';
import { ATELIER_COPY } from '@/lib/site-content';
import { cn } from '@/lib/utils';

const MARQUEE_TEXT = 'CLASSIC CLASSIC CLASSIC CLASSIC ';

type SplitWordProps = {
  word: string;
  className?: string;
};

function SplitWord({ word, className }: SplitWordProps) {
  return (
    <div
      className={cn(
        'whitespace-nowrap text-[clamp(3.5rem,11vw,8.5rem)] leading-none font-bold tracking-tight uppercase',
        className,
      )}
      aria-hidden
    >
      {word.split('').map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          className="inline-block min-w-[0.55em] text-center"
        >
          {letter}
        </span>
      ))}
    </div>
  );
}

export function AtelierClassicStatementSection() {
  const { word, tagline, ariaLabel, portrait } = ATELIER_COPY.classicStatement;

  return (
    <section
      className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
      aria-label={ariaLabel}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-10 select-none"
        aria-hidden
      >
        <div className="marquee-container flex h-full flex-col justify-center">
          <div className="animate-marquee-slow whitespace-nowrap text-[15vw] font-black text-saan-charcoal/40 uppercase">
            {MARQUEE_TEXT}
            {MARQUEE_TEXT}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
        <p className="absolute top-[18%] left-1/2 -translate-x-1/2 text-[clamp(4rem,18vw,13rem)] leading-none font-bold tracking-tight text-[#ececec] uppercase sm:top-[10%]">
          {word}
        </p>
        <p className="absolute bottom-[30%] left-1/2 -translate-x-1/2 text-[clamp(4rem,18vw,13rem)] leading-none font-bold tracking-tight text-[#ececec] uppercase sm:bottom-[10%]">
          {word}
        </p>
      </div>

      <div className="relative z-10 flex min-h-[340px] items-center justify-center sm:min-h-[420px] lg:min-h-[480px]">
        <div className="relative z-0 h-[min(52vw,420px)] w-[min(38vw,300px)] sm:h-[420px] sm:w-[300px]">
          <Image
            src={portrait.src}
            alt={portrait.alt}
            fill
            sizes="(max-width: 640px) 38vw, 300px"
            className="object-cover"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex w-full justify-center">
            <SplitWord word={word} className="text-[#1a1a1a]" />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-[min(52vw,420px)] w-[min(38vw,300px)] overflow-hidden sm:h-[420px] sm:w-[300px]">
            <div className="absolute top-1/2 left-1/2 flex w-screen -translate-x-1/2 -translate-y-1/2 justify-center">
              <SplitWord word={word} className="text-white" />
            </div>
          </div>
        </div>

        <h2 className="sr-only">{word}</h2>
      </div>

      <div className="relative z-20 mb-10 flex flex-col items-center gap-3 sm:mb-14">
        <span className="h-px w-10 bg-[#9a9a9a]" aria-hidden />
        <p className="text-[10px] font-semibold tracking-[0.22em] text-[#7a7a7a] uppercase sm:text-[11px]">
          {tagline}
        </p>
      </div>
    </section>
  );
}
