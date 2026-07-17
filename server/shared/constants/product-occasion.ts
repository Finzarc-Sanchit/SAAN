export const PRODUCT_OCCASIONS = [
  'Festive',
  'Wedding',
  'Daily',
  'Cocktail',
  'Resort',
] as const;

export type ProductOccasion = (typeof PRODUCT_OCCASIONS)[number];
