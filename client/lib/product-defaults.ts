import type { ShopProduct } from '@/lib/site-content';
import { getCollectionById } from '@/lib/site-content';
import type { Product } from '@/lib/types/product';
import { computeEffectivePrice } from '@/lib/product-pricing';
import { SAANLABEL_HOVER_POOL } from '@/lib/saanlabel-images';

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

const GALLERY_POOL = [...SAANLABEL_HOVER_POOL];

const COLLECTION_COLOURS: Record<string, { label: string; swatch: string }> = {
  'bloody-maroon': { label: 'Bloody Maroon', swatch: '#4b0006' },
  'ek-sunheri-dopahar': { label: 'Sunheri Gold', swatch: '#c9a227' },
  jhalak: { label: 'Midnight Blue', swatch: '#1e3a5f' },
  shaila: { label: 'Shell Pink', swatch: '#dcc0be' },
  effortless: { label: 'Effortless White', swatch: '#f5f0eb' },
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

function buildGallery(mainImage: string): string[] {
  const others = GALLERY_POOL.filter((img) => img !== mainImage).slice(0, 5);
  return [mainImage, ...others, mainImage].slice(0, 6);
}

function normalizeOccasions(
  occasion: ShopProduct['occasion'] | string | undefined,
): ShopProduct['occasion'] {
  if (Array.isArray(occasion)) {
    return occasion;
  }
  if (typeof occasion === 'string' && occasion.length > 0) {
    return [occasion as ShopProduct['occasion'][number]];
  }
  return ['Daily'];
}

function formatOccasionLabel(product: ShopProduct): string {
  return normalizeOccasions(product.occasion).join(', ');
}

function buildHighlights(product: ShopProduct): string[] {
  return [
    `Flattering ${product.name} silhouette`,
    'Soft, flowy fabric for all-day comfort',
    `Perfect for ${formatOccasionLabel(product).toLowerCase()} and special occasions`,
  ];
}

function buildFitNotes(product: ShopProduct): string {
  return `Model is 5'6" wearing S. Fit relaxed. ${product.subtitle}.`;
}

function buildDescription(product: ShopProduct): string {
  return `${product.name} from the ${product.collection.replace(/-/g, ' ')} line. ${product.subtitle}. Crafted with intention for ${formatOccasionLabel(product).toLowerCase()} wear — a piece that balances heritage craft with modern ease. Each garment is finished by hand in our atelier, with careful attention to drape, proportion, and lasting comfort.`;
}

function buildSizeStock(sizes: string[]): Record<string, number> {
  const stock: Record<string, number> = {};
  sizes.forEach((size, index) => {
    if (size === 'CUSTOM') {
      stock[size] = 99;
    } else {
      stock[size] = 3 + (index % 5);
    }
  });
  return stock;
}

function buildFabric(product: ShopProduct): string {
  const fabrics: Record<string, string> = {
    Anarkalis: 'Pure Modal Silk · 90 GSM',
    Sarees: 'Organza with pearl finish · 80 GSM',
    'Kurta Sets': 'Chanderi silk blend · 85 GSM',
    'Dhoti Sets': 'Cotton silk · 100 GSM',
    'Sharara Sets': 'Paper silk with zari weave · 95 GSM',
    Lehengas: 'Velvet with zari embroidery · 120 GSM',
    'Co-ords': 'Linen blend · 75 GSM',
    Dresses: 'Georgette with satin lining · 70 GSM',
  };
  return fabrics[product.category] ?? 'Premium natural fabric · 90 GSM';
}

function buildEmbellishment(product: ShopProduct): string {
  const occasions = normalizeOccasions(product.occasion);
  if (occasions.includes('Wedding') || occasions.includes('Festive')) {
    return 'Hand-finished gota patti at cuffs and neckline';
  }
  if (product.category === 'Lehengas') {
    return 'Zari embroidery with hand-stitched sequin detail';
  }
  return 'Subtle hand embroidery at borders and neckline';
}

/** Default care copy used when enriching mock catalog products. */
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

function buildMaking(product: ShopProduct): string {
  return `Each ${product.name} is cut and finished in our Bandra atelier. Our artisans spend up to 14 hours on a single piece — from pattern drafting to the final press. The ${product.collection.replace(/-/g, ' ')} line reflects SAAN's belief that luxury lives in the quiet details: aligned seams, weighted hems, and dyes that age with grace rather than fade.`;
}

function buildReviews(product: ShopProduct): ProductReview[] {
  return [
    {
      id: `${product.id}-r1`,
      author: 'Ananya M.',
      rating: 5,
      text: `The drape of this ${product.subtitle.toLowerCase()} is exceptional. Wore it for a family celebration and felt effortlessly elegant all evening.`,
      date: 'March 2026',
    },
    {
      id: `${product.id}-r2`,
      author: 'Priya S.',
      rating: 5,
      text: 'True to size with a relaxed fit. The fabric feels luxurious and photographs beautifully.',
      date: 'February 2026',
    },
    {
      id: `${product.id}-r3`,
      author: 'Meera K.',
      rating: 4,
      text: 'Beautiful craftsmanship. Delivery was prompt and the packaging felt premium.',
      date: 'January 2026',
    },
  ];
}

function buildGstNote(price: number): string {
  const gst = Math.round(price * 0.12);
  return `Inclusive of all taxes · GST ₹${gst.toLocaleString('en-IN')} included`;
}

export function enrichShopProduct(product: ShopProduct): ProductDetail {
  const collection = getCollectionById(product.collection);
  const collectionLabel = collection?.title ?? product.collection.replace(/-/g, ' ');
  const reviews = buildReviews(product);
  const rating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length) * 10,
        ) / 10
      : 0;
  const colour = COLLECTION_COLOURS[product.collection] ?? {
    label: collectionLabel,
    swatch: '#4b0006',
  };
  const sizes = [...DEFAULT_SIZES];

  return {
    ...product,
    slug: product.id,
    collectionLabel,
    images: buildGallery(product.image),
    highlights: buildHighlights(product),
    sizes,
    fitNotes: buildFitNotes(product),
    description: buildDescription(product),
    features: DEFAULT_FEATURES,
    offers: DEFAULT_OFFERS,
    whyLove: DEFAULT_WHY_LOVE,
    trustBadges: DEFAULT_TRUST_BADGES,
    rating,
    reviewCount: reviews.length,
    colourLabel: colour.label,
    colourSwatch: colour.swatch,
    sizeStock: buildSizeStock(sizes),
    fabric: buildFabric(product),
    embellishment: buildEmbellishment(product),
    occasionDetail: formatOccasionLabel(product),
    care: buildCare(),
    making: buildMaking(product),
    reviews,
    gstNote: buildGstNote(product.price),
  };
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

