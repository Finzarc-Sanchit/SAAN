import type { ShopProduct } from '@/lib/site-content';
import type { Product } from '@/lib/types/product';
import { computeEffectivePrice } from '@/lib/product-pricing';

export const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'CUSTOM'] as const;

export type ProductFeature = {
  title: string;
  description: string;
  icon: 'shipping' | 'exchange' | 'camera' | 'comfort';
};

export type ProductOffer = {
  label: string;
  detail: string;
};

export type ProductWhyLove = {
  text: string;
  icon: 'fabric' | 'comfort' | 'silhouette' | 'versatile';
};

export type ProductTrustBadge = {
  label: string;
  icon: 'satisfaction' | 'cod' | 'quality' | 'shipping';
};

export type ProductReview = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
};

export type ProductDetail = ShopProduct & {
  slug: string;
  collectionLabel: string;
  images: string[];
  highlights: string[];
  sizes: string[];
  /** Maps size label → catalog sizeId when loaded from the API. */
  sizeIdByLabel?: Record<string, string>;
  fitNotes: string;
  description: string;
  features: ProductFeature[];
  offers: ProductOffer[];
  whyLove: ProductWhyLove[];
  trustBadges: ProductTrustBadge[];
  rating: number;
  reviewCount: number;
  colourLabel: string;
  colourSwatch: string;
  sizeStock: Record<string, number>;
  fabric: string;
  embellishment: string;
  occasionDetail: string;
  care: string[];
  making: string;
  reviews: ProductReview[];
  gstNote: string;
};

export const DEFAULT_FEATURES: ProductFeature[] = [
  {
    title: 'Complimentary Shipping',
    description: 'Extra 5% off on all prepaid orders. Complimentary shipping across India.',
    icon: 'shipping',
  },
  {
    title: 'Hassle-Free Size Exchange',
    description:
      'Easy size exchanges — because finding your perfect fit should feel effortless.',
    icon: 'exchange',
  },
  {
    title: 'Camera-Ready Finish',
    description: 'Designed to photograph beautifully in every light, on and off camera.',
    icon: 'camera',
  },
  {
    title: 'Skin-Friendly Comfort',
    description:
      'Made with natural, non-irritating dyes for all-day comfort and confidence.',
    icon: 'comfort',
  },
];

export const DEFAULT_OFFERS: ProductOffer[] = [
  {
    label: 'Special Offer',
    detail: '10% off on prepaid orders above ₹15,000',
  },
];

export const DEFAULT_WHY_LOVE: ProductWhyLove[] = [
  { text: 'Premium-quality fabric with a rich ethnic finish.', icon: 'fabric' },
  { text: 'Perfect balance of comfort and festive elegance.', icon: 'comfort' },
  { text: 'Flattering silhouette crafted for Indian body types.', icon: 'silhouette' },
  { text: 'Versatile design for daily, festive & occasion wear.', icon: 'versatile' },
];

export const DEFAULT_TRUST_BADGES: ProductTrustBadge[] = [
  { label: '100% Satisfaction', icon: 'satisfaction' },
  { label: 'COD Available', icon: 'cod' },
  { label: 'Premium Quality', icon: 'quality' },
  { label: 'Free Shipping', icon: 'shipping' },
];

/** Default care copy used when API products omit care instructions. */
export const PRODUCT_CARE_INSTRUCTIONS = [
  'Dry Clean Only',
  'Do not Wash',
  'Do not Wring',
  'Iron at low temperature',
  'Tumble dry on Low Heat',
] as const;

function buildCare(): string[] {
  return [...PRODUCT_CARE_INSTRUCTIONS];
}

function buildGstNote(price: number): string {
  const gst = Math.round(price * 0.12);
  return `Inclusive of all taxes · GST ₹${gst.toLocaleString('en-IN')} included`;
}

/** Sorted image URLs for an API product, with a safe placeholder fallback. */
function sortedImageUrls(product: Product): string[] {
  return [...product.images]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => image.imageUrl);
}

/**
 * Maps an API product into the storefront card (grid) shape.
 * Preserves the real `slug` so links resolve to the buyable PDP.
 */
export function mapApiProductToShopProduct(
  product: Product,
  categoryName?: string,
): ShopProduct {
  const images = sortedImageUrls(product);
  const price = computeEffectivePrice(product);

  return {
    id: product.id,
    sku: product.slug.toUpperCase(),
    name: product.name,
    subtitle: product.shortDescription,
    price,
    mrp: product.basePrice,
    currency: 'INR',
    collection: product.categoryId,
    category: categoryName ?? product.categoryId,
    occasion: product.occasion,
    image: images[0] ?? '/images/placeholder-product.jpg',
    images,
    isNew: product.isNewArrival,
    slug: product.slug,
  };
}

/**
 * Maps an API product into the storefront PDP shape.
 * Disclaimer remains a frontend constant.
 */
export function mapApiProductToDetail(product: Product): ProductDetail {
  const sizes = product.sizes.map((size) => size.size);
  const images = [...product.images]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => image.imageUrl);
  const price = computeEffectivePrice(product);
  const sizeStock = Object.fromEntries(
    product.sizes.map((size) => [size.size, size.quantity]),
  );
  const occasionLabel = product.occasion.join(', ');

  return {
    id: product.id,
    sku: product.slug.toUpperCase(),
    name: product.name,
    subtitle: product.shortDescription,
    price,
    mrp: product.basePrice,
    currency: 'INR',
    collection: product.categoryId,
    category: product.shortDescription,
    occasion: product.occasion,
    image: images[0] ?? '',
    isNew: product.isNewArrival,
    slug: product.slug,
    collectionLabel: product.shortDescription,
    images: images.length > 0 ? images : ['/images/placeholder-product.jpg'],
    highlights: [
      `Flattering ${product.name} silhouette`,
      'Soft, flowy fabric for all-day comfort',
      `Perfect for ${occasionLabel.toLowerCase()} and special occasions`,
    ],
    sizes: sizes.length > 0 ? sizes : [...DEFAULT_SIZES],
    sizeIdByLabel: Object.fromEntries(
      product.sizes.map((size) => [size.size, size.sizeId]),
    ),
    fitNotes: product.fitNotes,
    description: product.description,
    features: DEFAULT_FEATURES,
    offers: DEFAULT_OFFERS,
    whyLove: DEFAULT_WHY_LOVE,
    trustBadges: DEFAULT_TRUST_BADGES,
    rating: product.ratingsAverage,
    reviewCount: product.ratingsCount,
    colourLabel: product.color,
    colourSwatch: '#4b0006',
    sizeStock,
    fabric: product.fabric,
    embellishment: '',
    occasionDetail: occasionLabel,
    care: product.care.length > 0 ? product.care : buildCare(),
    making: '',
    reviews: [],
    gstNote: buildGstNote(price),
  };
}

