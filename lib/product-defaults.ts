import type { ShopProduct } from '@/lib/site-content';
import { getCollectionById } from '@/lib/site-content';

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
  collectionLabel: string;
  images: string[];
  highlights: string[];
  sizes: string[];
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

const GALLERY_POOL = [
  '/images/products/velvet-anarkali.jpg',
  '/images/products/organza-saree.jpg',
  '/images/products/chanderi-kurta.jpg',
  '/images/products/paper-silk-suit.jpg',
  '/images/products/zari-lehenga.jpg',
  '/images/products/linen-coord.jpg',
  '/images/products/cotton-lawn.jpg',
  '/images/collections/bloody-maroon.jpg',
  '/images/collections/ek-sunheri-dopahar.jpg',
  '/images/collections/jhalak.jpg',
  '/images/collections/shells.jpg',
  '/images/collections/effortless.jpg',
];

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

function buildHighlights(product: ShopProduct): string[] {
  return [
    `Flattering ${product.name} silhouette`,
    'Soft, flowy fabric for all-day comfort',
    `Perfect for ${product.occasion.toLowerCase()} and special occasions`,
  ];
}

function buildFitNotes(product: ShopProduct): string {
  return `Model is 5'6" wearing S. Fit relaxed. ${product.subtitle}.`;
}

function buildDescription(product: ShopProduct): string {
  return `${product.name} from the ${product.collection.replace(/-/g, ' ')} line. ${product.subtitle}. Crafted with intention for ${product.occasion.toLowerCase()} wear — a piece that balances heritage craft with modern ease. Each garment is finished by hand in our atelier, with careful attention to drape, proportion, and lasting comfort.`;
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
  if (product.occasion === 'Wedding' || product.occasion === 'Festive') {
    return 'Hand-finished gota patti at cuffs and neckline';
  }
  if (product.category === 'Lehengas') {
    return 'Zari embroidery with hand-stitched sequin detail';
  }
  return 'Subtle hand embroidery at borders and neckline';
}

function buildOccasionDetail(product: ShopProduct): string {
  const map: Record<string, string> = {
    Festive: 'Festive · Sangeet · Reception',
    Wedding: 'Wedding · Reception · Cocktail',
    Daily: 'Daily · Brunch · Office',
    Cocktail: 'Cocktail · Evening · Reception',
    Resort: 'Resort · Travel · Day events',
  };
  return map[product.occasion] ?? `${product.occasion} · Special occasions`;
}

function buildCare(product: ShopProduct): string[] {
  return [
    'Dry clean only for best longevity of embellishments.',
    'Store in a breathable garment bag away from direct sunlight.',
    'Steam lightly; avoid direct iron on embroidered areas.',
    `Ideal for ${product.occasion.toLowerCase()} wear with minimal wrinkling.`,
  ];
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
  const colour = COLLECTION_COLOURS[product.collection] ?? {
    label: collectionLabel,
    swatch: '#4b0006',
  };
  const sizes = [...DEFAULT_SIZES];

  return {
    ...product,
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
    rating: 4.9,
    reviewCount: 23,
    colourLabel: colour.label,
    colourSwatch: colour.swatch,
    sizeStock: buildSizeStock(sizes),
    fabric: buildFabric(product),
    embellishment: buildEmbellishment(product),
    occasionDetail: buildOccasionDetail(product),
    care: buildCare(product),
    making: buildMaking(product),
    reviews: buildReviews(product),
    gstNote: buildGstNote(product.price),
  };
}
