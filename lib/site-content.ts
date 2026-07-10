export const ANNOUNCEMENTS = [
  'COMPLIMENTARY SHIPPING ACROSS INDIA',
  'EK SUNHERI DOPAHAR · NOW LIVE',
  'MADE-TO-MEASURE AVAILABLE',
  'VISIT OUR BANDRA ATELIER · BY APPOINTMENT',
  'RESORT 2026 · SHELLS COMING SOON',
] as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Collections', href: '/collections' },
  { label: 'Journal', href: '/journal' },
  { label: 'Atelier', href: '/atelier' },
  { label: 'Contact', href: '/contact' },
] as const;

export const CART_ITEM_COUNT = 0;

export const SECTION_COPY = {
  collections: {
    title: 'Our ',
    titleAccent: 'Collections',
    subtitle: 'Five lines, one philosophy.',
  },
  trending: {
    eyebrow: 'Shop the Edit',
    title: 'Most ',
    titleAccent: 'Trending',
    subtitle: 'Curated for the moment.',
  },
} as const;

export const COLLECTIONS = [
  {
    id: 'bloody-maroon',
    title: 'Bloody Maroon',
    description: 'A study in depth.',
    tagline: 'The red that commands a room.',
    href: '/collections/bloody-maroon',
    image: '/images/collections/bloody-maroon.jpg',
  },
  {
    id: 'ek-sunheri-dopahar',
    title: 'Ek Sunheri Dopahar',
    description: 'A golden afternoon.',
    tagline: 'Captured in threads of light.',
    href: '/collections/ek-sunheri-dopahar',
    image: '/images/collections/ek-sunheri-dopahar.jpg',
  },
  {
    id: 'jhalak',
    title: 'Jhalak',
    description: 'A glimpse, dressed in shadow.',
    tagline: 'Where light meets the unseen.',
    href: '/collections/jhalak',
    image: '/images/collections/jhalak.jpg',
  },
  {
    id: 'shells',
    title: 'Shells',
    description: 'Found ornament.',
    tagline: "The ocean's quiet geometry.",
    href: '/collections/shells',
    image: '/images/collections/shells.jpg',
  },
  {
    id: 'effortless',
    title: 'Effortless',
    description: 'Everyday, intentional.',
    tagline: 'Design for a simpler pace.',
    href: '/collections/effortless',
    image: '/images/collections/effortless.jpg',
  },
] as const;

export type Collection = (typeof COLLECTIONS)[number];

export const TRENDING_FILTERS = [
  { id: 'new-arrivals', label: 'New Arrivals' },
  { id: 'luxury-pret', label: 'Luxury Pret' },
  { id: 'luxury-formals', label: 'Luxury Formals' },
  { id: 'luxury-lawn', label: 'Luxury Lawn' },
  { id: 'luxury-basics', label: 'Luxury Basics' },
  { id: 'accessories', label: 'Accessories' },
] as const;

export type TrendingCategory = (typeof TRENDING_FILTERS)[number]['id'];

export const PRODUCTS = [
  {
    id: 'zari-embroidered-lehenga',
    name: 'Zari Embroidered Lehenga',
    price: 125000,
    mrp: 165000,
    currency: 'INR',
    category: 'luxury-formals' as const,
    image: '/images/products/zari-lehenga.jpg',
    isNew: false,
  },
  {
    id: 'silk-chanderi-kurta-set',
    name: 'Silk Chanderi Kurta Set',
    price: 42000,
    mrp: 54900,
    currency: 'INR',
    category: 'new-arrivals' as const,
    image: '/images/products/chanderi-kurta.jpg',
    isNew: true,
  },
  {
    id: 'velvet-anarkali-suit',
    name: 'Velvet Anarkali Suit',
    price: 68000,
    mrp: 89900,
    currency: 'INR',
    category: 'luxury-pret' as const,
    image: '/images/products/velvet-anarkali.jpg',
    isNew: true,
  },
  {
    id: 'organza-saree-pearls',
    name: 'Organza Saree with Pearls',
    price: 55000,
    mrp: 72500,
    currency: 'INR',
    category: 'new-arrivals' as const,
    image: '/images/products/organza-saree.jpg',
    isNew: false,
  },
  {
    id: 'embroidered-paper-silk-suit',
    name: '3 Piece Embroidered Paper Silk Suit',
    price: 29900,
    mrp: 42900,
    currency: 'INR',
    category: 'new-arrivals' as const,
    image: '/images/products/paper-silk-suit.jpg',
    isNew: true,
  },
  {
    id: 'cotton-lawn-kurta',
    name: 'Printed Cotton Lawn Kurta',
    price: 18500,
    mrp: 24900,
    currency: 'INR',
    category: 'luxury-lawn' as const,
    image: '/images/products/cotton-lawn.jpg',
    isNew: false,
  },
  {
    id: 'linen-coord-set',
    name: 'Minimal Linen Co-ord Set',
    price: 24000,
    mrp: 31900,
    currency: 'INR',
    category: 'luxury-basics' as const,
    image: '/images/products/linen-coord.jpg',
    isNew: false,
  },
  {
    id: 'zari-clutch',
    name: 'Hand-Embroidered Zari Clutch',
    price: 8900,
    mrp: 12900,
    currency: 'INR',
    category: 'accessories' as const,
    image: '/images/products/zari-clutch.jpg',
    isNew: true,
  },
] as const;

export const JOURNAL_POSTS = [
  {
    id: 'ethnic-vs-traditional',
    category: 'Style Guide',
    title: 'Ethnic vs Traditional Wear: Decoding the Differences',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA7KD6FLVgyseKj6RedXoGS_YJdS-gKgYTSuEl7W32TEOK9g_bwx_4BSZFkpXkSOyWsC5JRfKyp1fbgMTrbSE55nysXkUOmdvMtSNhBQVxSBVfYRlT-4PKvtz57Fayhq3OhpOsDDCvH0jTx8UV9FaeK0IWyo1J7lnkiSOv5sSK97s5BxyhjTY237hZYr-hgtLQ45ARwUX2ySJwJbI3Q51_ANXiSRLNg8uYY-__r0lPNrW8AVztbI_c-Uxx2lsC3vxy2f9m96S9Gf5ye',
  },
  {
    id: 'summer-dressing-guide',
    category: "Editor's Picks",
    title: 'Summer Dressing Guide: Staying Cool & Chic',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDwQ-Ui5CrqgZW3E7W_ARk0GMvcLIWaGI9nAzoNG-j51kM4OrjdYsE6IjPaS-Ev0V5p6HUqG0opakNnacq6TJhUbZDHMS3KvqUGVWLHFMAB0ekYT7MPkY0JgECoyLmsCRG9vAGNmj9p9pdxZzN8yKJgzgHvPRHYV_rDw7bEuYUhHNKD_wZrYTRwi_paRyfZAE3Lv7Ad6xcXv9YYN-UoG3K5-5R4TqdCipitTzn7ZFO1iNJ84KELoKVXFZ-0Ho3j0-XRrGWzd3sqW7bK',
  },
  {
    id: 'art-of-zardozi',
    category: 'Behind the Seams',
    title: 'The Art of Zardozi: Preserving Ancient Crafts',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCzX_milgk66WVOusJUj1QcPzBymDqV1J8WtYj2xZSEO39UYUlEmVT0Q9l_FBbCUOTD1bHJKjEHYFAFEoOrmdcwA8Xb_4y_CbVIAp_Y-nk97X2WeXGBrhigVF-x9ISOsP3bqw39L84fDJ3Rm__DJdymjiHvMq3Cb79k4H1zRE1TpUcM8kPqrUyCWYPaFvdK1c6TzdjPegZSZ2L1njNhmsoq8Em75DPOp5UIERJCVxplUPo_-M9vQJ2hhtiArxNPB6IZ8QhxyfXdrv5c',
  },
  {
    id: 'resort-2026',
    category: 'Lookbook',
    title: 'Resort 2026: An Exclusive First Look',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDdM-ReYMWCNMpadhsOwukkdkAmkr2blNLMn9-TWLdFE8xqaF1OPRJJhtkcZ_Q5PpPpb5s9Tuwlf3rzENBAl3p7GjGDMWPh412qIrZ80I9nF3DmZynHwcX2ktQG0LT44H3uW9IGTReqyYnzNAh85CUM9iUC-3lnYS9X7igg8sEVzHIXrdNU8Ivb1y5DSqmJHffLc_mANsx7on0p23O2dfcKC2Tum6zIfI_5_m05172D5Huu9RA69cVXQ2ea2oBAIXtilz6Lt3_Dyoee',
  },
] as const;

export const ATELIER_LANDING_COPY = {
  eyebrow: 'The Atelier',
  headline: 'Made in Mumbai.',
  headlineAccent: 'One stitch at a time.',
  body: [
    'Every SAAN piece is cut, sewn and finished in our Bandra atelier. We work with a small team of pattern-makers, tailors and embroiderers — most have been doing this for two decades.',
    'Embroidery is sourced from artisan clusters in Lucknow and Banaras. Shells come from Goa. Cloth comes from West Bengal, Bhagalpur and our own weavers.',
  ],
  stats: [
    { value: 40, suffix: '+', label: 'Pieces made a year' },
    { value: 14, suffix: '', label: 'Hands per piece' },
    { value: 0, suffix: '', label: 'Fast fashion', accent: true },
  ],
  heroImage: {
    src: '/images/atelier/workshop-sewing.png',
    alt: 'Industrial sewing machine and artisan fabric work in the SAAN Bandra atelier',
  },
  cta: {
    label: 'Visit the atelier',
    href: '/atelier',
  },
  pressEyebrow: 'As Seen In',
  press: [
    { id: 'vogue', name: "Vogue India" },
    { id: 'bazaar', name: "Harper's Bazaar" },
    { id: 'tvof', name: 'The Voice of Fashion' },
    { id: 'grazia', name: 'Grazia' },
    { id: 'verve', name: 'Verve' },
  ],
} as const;

export const NEWSLETTER_COPY = {
  title: 'Join the SAAN Community',
  description:
    'Subscribe for editorial updates, atelier invitations, and early access to new collections.',
  placeholder: 'Enter your email address',
  submitLabel: 'Subscribe',
} as const;

export const FEATURED_COLLECTION = {
  title: 'Best Sellers',
  subtitle: "Own What's Always Admired",
  tagline: 'Curated pieces, always in demand',
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBdPy7cYr0PWZvju_YY7-sEr1LXrZE5ZEeXMHbN5PWFqaBQ-Ykl0tkIQpUPHi5ZxUgIFwPHCf5sQbGoxhZNW8zTMXnZhGWJyd3ixOhpiobAHozL3n3LGOJW4LdrL-G7GLBoQJMBg3_jT2LbyeQ10heJQ6hAdFcXKFQcSQ4ALk-2L0SMXLutedN34niL65A2b49abt3wBwDUCbQMnX_SNxBX8FeagweCRNhBj4ECc0WHlv-IW95Q9vao2MDZ7q8bBC-hYI4LEm4QZ8hj',
  href: '/shop/best-sellers',
} as const;

export const ATELIER_COPY = {
  eyebrow: 'Brand Story',
  headline: 'One philosophy, many expressions.',
  intro: [
    'SAAN is born from the belief that true elegance lies in restraint.',
    "Rooted in Indian tradition yet shaped by modern sensibilities, SAAN celebrates the woman who doesn't need excess to be seen. Every detail is deliberate, every form thoughtful — much like the women who wear it.",
    "At the heart of the identity is a single adornment dot. Subtle yet powerful, it draws from India's timeless decorative language — embellishments, and marks of grace — reimagined for today. It represents that one defining element that completes a look, the quiet accent that elevates simplicity into sophistication.",
  ],
  cta: { label: 'Explore Collections', href: '/collections' },
  inViewLabel: 'In view: 01/04',
  pillars: [
    {
      id: 'craft',
      title: 'The Craft',
      description:
        'Every garment is finished by hand in our Bandra atelier — pattern, drape, and proportion considered with unhurried precision.',
      image: '/images/collections/bloody-maroon.jpg',
      href: '/collections/bloody-maroon',
      meta: [
        { label: 'Focus', value: 'Hand finishing' },
        { label: 'Location', value: 'Bandra, Mumbai' },
      ],
      featured: true,
    },
    {
      id: 'heritage',
      title: 'Heritage Reimagined',
      description:
        'Traditional embellishment and decorative language, distilled into a single defining accent.',
      image: '/images/collections/jhalak.jpg',
      href: '/collections/jhalak',
      meta: [
        { label: 'Focus', value: 'Embellishment' },
        { label: 'Approach', value: 'Restraint' },
      ],
      featured: false,
    },
    {
      id: 'silhouette',
      title: 'Modern Silhouette',
      description:
        'Clean lines and thoughtful forms designed for the woman who values presence over performance.',
      image: '/images/collections/effortless.jpg',
      href: '/collections/effortless',
      meta: [
        { label: 'Focus', value: 'Silhouette' },
        { label: 'Approach', value: 'Contemporary' },
      ],
      featured: false,
    },
    {
      id: 'collections',
      title: 'Five Lines',
      description:
        'Distinct expressions of one philosophy — from ceremonial depth to everyday ease.',
      image: '/images/collections/ek-sunheri-dopahar.jpg',
      href: '/collections',
      meta: [
        { label: 'Focus', value: 'Collections' },
        { label: 'Count', value: 'Five lines' },
      ],
      featured: false,
    },
  ],
  classic: {
    word: 'CLASSIC',
    tagline: 'We Are Always',
    ariaLabel: 'We are always classic',
    portrait: {
      src: '/images/atelier/classic-portrait.png',
      alt: 'Editorial portrait of a woman in maroon SAAN couture with gold adornment',
    },
  },
  closing: {
    paragraphs: [
      'SAAN bridges heritage and contemporary fashion through clean silhouettes, refined craftsmanship, and mindful design. It honors tradition without nostalgia and embraces modernity without losing warmth.',
      'Designed for the modern Indian woman — confident, grounded, and effortlessly elegant — SAAN is not about standing out loudly, but about leaving a lasting impression.',
      'Because beauty, when intentional, needs only one perfect detail.',
    ],
    cta: { label: 'Book an Appointment', href: '/contact' },
  },
} as const;

export type AtelierPillar = (typeof ATELIER_COPY.pillars)[number];

export const TESTIMONIALS_COPY = {
  eyebrow: 'Testimonials',
  title: 'Trusted by ',
  titleAccent: 'Our Clients',
  description:
    'From bridal couture to everyday elegance, SAAN has dressed women who value craft, comfort, and quiet confidence.',
  cta: { label: 'Explore the Atelier', href: '/atelier' },
} as const;

export const TESTIMONIALS = [
  {
    id: 'priya-sharma',
    quote:
      'The Bloody Maroon lehenga felt like it was made for me — every stitch, every drape, pure poetry.',
    name: 'Priya Sharma',
    role: 'Bride, Mumbai',
    image: '/images/testimonials/priya-sharma.jpg',
    accent: 'maroon' as const,
  },
  {
    id: 'ananya-mehta',
    quote:
      'SAAN understands that luxury is in the details. My Ek Sunheri Dopahar set turns heads without trying.',
    name: 'Ananya Mehta',
    role: 'Creative Director',
    image: '/images/testimonials/ananya-mehta.jpg',
    accent: 'champagne' as const,
  },
  {
    id: 'meera-kapoor',
    quote:
      'I have worn many labels. SAAN is the only one that feels both rooted and radically modern.',
    name: 'Meera Kapoor',
    role: 'Editor-in-Chief',
    image: '/images/testimonials/meera-kapoor.jpg',
    accent: 'gold' as const,
  },
  {
    id: 'kavya-reddy',
    quote:
      'The atelier experience was intimate and unhurried — exactly how couture should feel.',
    name: 'Kavya Reddy',
    role: 'Entrepreneur, Hyderabad',
    image: '/images/testimonials/kavya-reddy.jpg',
    accent: 'maroon' as const,
  },
  {
    id: 'ritu-singh',
    quote:
      'Effortless collection changed my everyday wardrobe. Intentional design that moves with you.',
    name: 'Ritu Singh',
    role: 'Architect, Delhi',
    image: '/images/testimonials/ritu-singh.jpg',
    accent: 'champagne' as const,
  },
] as const;

export const FOOTER_LINKS = {
  shop: [
    { label: 'New Arrivals', href: '/shop/new-arrivals' },
    { label: 'Best Sellers', href: '/shop/best-sellers' },
    { label: 'Festive Collection', href: '/collections/festive' },
    { label: 'Bridal', href: '/collections/bridal' },
  ],
  support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Shipping & Returns', href: '/shipping' },
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'FAQs', href: '/faqs' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
} as const;

export const BRAND = {
  name: 'SAAN',
  tagline: 'Atmospheric Couture',
  logo: '/images/saan-logo.png',
  description:
    'Redefining heritage for the modern muse. Ethical craftsmanship meets timeless design.',
  social: {
    instagram: 'https://www.instagram.com/saan.label',
  },
} as const;

export const WHATSAPP_SUPPORT_URL =
  'https://wa.me/919876543210?text=Hi%20SAAN%2C%20I%20need%20help%20with%20a%20product';

export function formatPrice(price: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getDiscountPercent(price: number, mrp: number): number {
  if (mrp <= price) return 0;
  return Math.round((1 - price / mrp) * 100);
}

export type ShopProduct = {
  id: string;
  sku: string;
  name: string;
  subtitle: string;
  price: number;
  mrp: number;
  currency: string;
  collection: string;
  category: string;
  occasion: string;
  image: string;
  isNew: boolean;
};

export const SHOP_PRODUCTS: readonly ShopProduct[] = [
  {
    id: 'the-maroon-anarkali',
    sku: 'SS-001',
    name: 'The Maroon Anarkali',
    subtitle: 'Anarkali set',
    price: 10500,
    mrp: 12500,
    currency: 'INR',
    collection: 'bloody-maroon',
    category: 'Anarkalis',
    occasion: 'Festive',
    image: '/images/products/velvet-anarkali.jpg',
    isNew: true,
  },
  {
    id: 'bloody-maroon-saree-set',
    sku: 'SS-002',
    name: 'Bloody Maroon Saree Set',
    subtitle: 'Saree + Blouse',
    price: 22400,
    mrp: 29900,
    currency: 'INR',
    collection: 'bloody-maroon',
    category: 'Sarees',
    occasion: 'Wedding',
    image: '/images/products/organza-saree.jpg',
    isNew: false,
  },
  {
    id: 'the-maroon-dhoti-set',
    sku: 'SS-003',
    name: 'The Maroon Dhoti Set',
    subtitle: 'Kurta + Dhoti Pants',
    price: 16800,
    mrp: 21900,
    currency: 'INR',
    collection: 'bloody-maroon',
    category: 'Dhoti Sets',
    occasion: 'Daily',
    image: '/images/products/chanderi-kurta.jpg',
    isNew: false,
  },
  {
    id: 'sunheri-anarkali',
    sku: 'SS-004',
    name: 'Sunheri Anarkali',
    subtitle: 'Anarkali set',
    price: 26500,
    mrp: 34900,
    currency: 'INR',
    collection: 'ek-sunheri-dopahar',
    category: 'Anarkalis',
    occasion: 'Festive',
    image: '/images/collections/ek-sunheri-dopahar.jpg',
    isNew: true,
  },
  {
    id: 'the-jhalak-dress',
    sku: 'SS-005',
    name: 'The Jhalak Dress',
    subtitle: 'Draped Dress',
    price: 18200,
    mrp: 24500,
    currency: 'INR',
    collection: 'jhalak',
    category: 'Dresses',
    occasion: 'Cocktail',
    image: '/images/collections/jhalak.jpg',
    isNew: false,
  },
  {
    id: 'the-shaila-anarkali',
    sku: 'SS-006',
    name: 'The Shaila Anarkali',
    subtitle: 'Anarkali set',
    price: 28500,
    mrp: 37900,
    currency: 'INR',
    collection: 'shaila',
    category: 'Anarkalis',
    occasion: 'Wedding',
    image: '/images/collections/shells.jpg',
    isNew: true,
  },
  {
    id: 'effortless-pink-anarkali',
    sku: 'SS-007',
    name: 'Effortless Pink Anarkali',
    subtitle: 'Anarkali set',
    price: 16800,
    mrp: 22500,
    currency: 'INR',
    collection: 'effortless',
    category: 'Anarkalis',
    occasion: 'Daily',
    image: '/images/collections/effortless.jpg',
    isNew: false,
  },
  {
    id: 'effortless-maroon-kurta',
    sku: 'SS-008',
    name: 'Effortless Maroon Kurta',
    subtitle: 'Kurta set',
    price: 9800,
    mrp: 12900,
    currency: 'INR',
    collection: 'effortless',
    category: 'Kurta Sets',
    occasion: 'Daily',
    image: '/images/products/velvet-anarkali.jpg',
    isNew: false,
  },
  {
    id: 'sunheri-sharara-set',
    sku: 'SS-009',
    name: 'Sunheri Sharara Set',
    subtitle: 'Kurta + Sharara',
    price: 24200,
    mrp: 32500,
    currency: 'INR',
    collection: 'ek-sunheri-dopahar',
    category: 'Sharara Sets',
    occasion: 'Festive',
    image: '/images/products/paper-silk-suit.jpg',
    isNew: false,
  },
  {
    id: 'sunheri-dupatta-set',
    sku: 'SS-010',
    name: 'Sunheri Dupatta Set',
    subtitle: 'Kurta + Dupatta',
    price: 21000,
    mrp: 27900,
    currency: 'INR',
    collection: 'ek-sunheri-dopahar',
    category: 'Kurta Sets',
    occasion: 'Festive',
    image: '/images/products/chanderi-kurta.jpg',
    isNew: false,
  },
  {
    id: 'jhalak-co-ord',
    sku: 'SS-011',
    name: 'Jhalak Co-ord',
    subtitle: 'Top + Skirt Co-ord',
    price: 15400,
    mrp: 19900,
    currency: 'INR',
    collection: 'jhalak',
    category: 'Co-ords',
    occasion: 'Cocktail',
    image: '/images/products/linen-coord.jpg',
    isNew: false,
  },
  {
    id: 'shaila-lehenga',
    sku: 'SS-012',
    name: 'Shaila Lehenga',
    subtitle: 'Lehenga Set',
    price: 35000,
    mrp: 45000,
    currency: 'INR',
    collection: 'shaila',
    category: 'Lehengas',
    occasion: 'Wedding',
    image: '/images/products/zari-lehenga.jpg',
    isNew: true,
  },
  {
    id: 'effortless-white-set',
    sku: 'SS-013',
    name: 'Effortless White Set',
    subtitle: 'Top + Skirt',
    price: 14400,
    mrp: 18900,
    currency: 'INR',
    collection: 'effortless',
    category: 'Co-ords',
    occasion: 'Daily',
    image: '/images/products/cotton-lawn.jpg',
    isNew: false,
  },
];

const COLLECTION_PRODUCT_MAP: Record<string, string> = {
  shells: 'shaila',
};

export function resolveCollectionId(id: string): string {
  return COLLECTION_PRODUCT_MAP[id] ?? id;
}

export function getCollectionById(id: string) {
  return COLLECTIONS.find((c) => c.id === id);
}

export function getProductsForCollection(collectionId: string): ShopProduct[] {
  const resolved = resolveCollectionId(collectionId);
  return SHOP_PRODUCTS.filter((p) => p.collection === resolved);
}

export function getShopProductById(id: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find((p) => p.id === id);
}

export const SHOP_COLLECTION_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'bloody-maroon', label: 'Bloody Maroon' },
  { id: 'ek-sunheri-dopahar', label: 'Ek Sunheri Dopahar' },
  { id: 'jhalak', label: 'Jhalak' },
  { id: 'shaila', label: 'Shaila' },
  { id: 'effortless', label: 'Effortless' },
] as const;

export const SHOP_CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'Anarkalis', label: 'Anarkalis' },
  { id: 'Sarees', label: 'Sarees' },
  { id: 'Kurta Sets', label: 'Kurta Sets' },
  { id: 'Dhoti Sets', label: 'Dhoti Sets' },
  { id: 'Sharara Sets', label: 'Sharara Sets' },
  { id: 'Lehengas', label: 'Lehengas' },
  { id: 'Co-ords', label: 'Co-ords' },
  { id: 'Dresses', label: 'Dresses' },
] as const;

export const SHOP_OCCASION_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'Festive', label: 'Festive' },
  { id: 'Wedding', label: 'Wedding' },
  { id: 'Daily', label: 'Daily' },
  { id: 'Cocktail', label: 'Cocktail' },
  { id: 'Resort', label: 'Resort' },
] as const;

export const SHOP_SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'newest', label: 'Newest' },
] as const;

export const SHOP_COPY = {
  title: 'The Shop',
  sortLabel: 'Sort',
  filterLabel: 'Filter',
  clearFilters: 'Clear All Filters',
  priceUpTo: 'Up to',
} as const;

