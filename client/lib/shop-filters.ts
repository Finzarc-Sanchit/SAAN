import { PRODUCT_OCCASIONS, type ProductOccasion } from '@/lib/product-occasion';

export type ShopFilterState = {
  category: string;
  occasion: string;
  maxPrice: number;
};

export function parseShopOccasionFilter(value: string | null | undefined): string {
  if (!value || value === 'all') return 'all';
  return (PRODUCT_OCCASIONS as readonly string[]).includes(value) ? value : 'all';
}
