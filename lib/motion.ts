export const LUXURY_EASE = [0.25, 1, 0.5, 1] as const;
export const FADE_EASE = [0.16, 1, 0.3, 1] as const;
export const HERO_SCROLL_DISTANCE_VH = 100;

export const luxuryTransition = {
  duration: 0.6,
  ease: LUXURY_EASE,
} as const;

export const fadeTransition = {
  duration: 0.8,
  ease: FADE_EASE,
} as const;

export const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
} as const;

export const imageRevealVariants = {
  hidden: { opacity: 0, clipPath: 'inset(100% 0 0 0)' },
  visible: { opacity: 1, clipPath: 'inset(0% 0 0 0)' },
} as const;

export const collectionSlideLeft = {
  hidden: { opacity: 0, x: -48, scale: 1.08 },
  visible: { opacity: 1, x: 0, scale: 1 },
} as const;

export const collectionSlideRight = {
  hidden: { opacity: 0, x: 48, scale: 1.08 },
  visible: { opacity: 1, x: 0, scale: 1 },
} as const;

export const statSlideUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
} as const;
