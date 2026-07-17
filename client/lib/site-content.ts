import {
  SAANLABEL_COLLECTIONS,
  SAANLABEL_INSTAGRAM,
  SAANLABEL_PRODUCTS,
  SAANLABEL_SECTIONS,
} from '@/lib/saanlabel-images';
import { PRODUCT_OCCASIONS, type ProductOccasion } from '@/lib/product-occasion';

export const ANNOUNCEMENTS = [
  'COMPLIMENTARY SHIPPING ACROSS INDIA',
  'EK SUNHERI DOPAHAR · NOW LIVE',
  'MADE-TO-MEASURE AVAILABLE',
  'VISIT OUR BANDRA ATELIER · BY APPOINTMENT',
  'RESORT 2026 · SHELLS COMING SOON',
] as const;

export const NAV_LINKS = [
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
    image: SAANLABEL_COLLECTIONS.coordSets,
  },
  {
    id: 'ek-sunheri-dopahar',
    title: 'Ek Sunheri Dopahar',
    description: 'A golden afternoon.',
    tagline: 'Captured in threads of light.',
    href: '/collections/ek-sunheri-dopahar',
    image: SAANLABEL_COLLECTIONS.ethnicWear,
  },
  {
    id: 'jhalak',
    title: 'Jhalak',
    description: 'A glimpse, dressed in shadow.',
    tagline: 'Where light meets the unseen.',
    href: '/collections/jhalak',
    image: SAANLABEL_COLLECTIONS.westernWear,
  },
  {
    id: 'shells',
    title: 'Shells',
    description: 'Found ornament.',
    tagline: "The ocean's quiet geometry.",
    href: '/collections/shells',
    image: SAANLABEL_PRODUCTS.pastelMaxiDress,
  },
  {
    id: 'effortless',
    title: 'Effortless',
    description: 'Everyday, intentional.',
    tagline: 'Design for a simpler pace.',
    href: '/collections/effortless',
    image: SAANLABEL_COLLECTIONS.luxeEditBanner,
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
    image: SAANLABEL_PRODUCTS.kaliWhiteBoneGown,
    isNew: false,
  },
  {
    id: 'silk-chanderi-kurta-set',
    name: 'Silk Chanderi Kurta Set',
    price: 42000,
    mrp: 54900,
    currency: 'INR',
    category: 'new-arrivals' as const,
    image: SAANLABEL_PRODUCTS.whiteCottonCoord,
    isNew: true,
  },
  {
    id: 'velvet-anarkali-suit',
    name: 'Velvet Anarkali Suit',
    price: 68000,
    mrp: 89900,
    currency: 'INR',
    category: 'luxury-pret' as const,
    image: SAANLABEL_PRODUCTS.whitePersianAnarkali,
    isNew: true,
  },
  {
    id: 'organza-saree-pearls',
    name: 'Organza Saree with Pearls',
    price: 55000,
    mrp: 72500,
    currency: 'INR',
    category: 'new-arrivals' as const,
    image: SAANLABEL_PRODUCTS.inkBlueSaree,
    isNew: false,
  },
  {
    id: 'embroidered-paper-silk-suit',
    name: '3 Piece Embroidered Paper Silk Suit',
    price: 29900,
    mrp: 42900,
    currency: 'INR',
    category: 'new-arrivals' as const,
    image: SAANLABEL_PRODUCTS.noirGraceSuit,
    isNew: true,
  },
  {
    id: 'cotton-lawn-kurta',
    name: 'Printed Cotton Lawn Kurta',
    price: 18500,
    mrp: 24900,
    currency: 'INR',
    category: 'luxury-lawn' as const,
    image: SAANLABEL_PRODUCTS.greenBoneDress,
    isNew: false,
  },
  {
    id: 'linen-coord-set',
    name: 'Minimal Linen Co-ord Set',
    price: 24000,
    mrp: 31900,
    currency: 'INR',
    category: 'luxury-basics' as const,
    image: SAANLABEL_PRODUCTS.electricBlueCoord,
    isNew: false,
  },
  {
    id: 'zari-clutch',
    name: 'Hand-Embroidered Zari Clutch',
    price: 8900,
    mrp: 12900,
    currency: 'INR',
    category: 'accessories' as const,
    image: SAANLABEL_PRODUCTS.saanPrintMiniDress,
    isNew: true,
  },
] as const;

export const JOURNAL_POSTS = [
  {
    id: 'ethnic-vs-traditional',
    category: 'Style Guide',
    title: 'Ethnic vs Traditional Wear: Decoding the Differences',
    excerpt:
      'How heritage silhouettes and contemporary ethnic dressing meet — and where they quietly diverge.',
    date: '12 March 2026',
    readingTime: '6 min read',
    image: SAANLABEL_COLLECTIONS.ethnicWear,
  },
  {
    id: 'summer-dressing-guide',
    category: "Editor's Picks",
    title: 'Summer Dressing Guide: Staying Cool & Chic',
    excerpt:
      'Light fabrics, considered layers, and pieces made for heat without losing presence.',
    date: '28 February 2026',
    readingTime: '5 min read',
    image: SAANLABEL_PRODUCTS.pastelMaxiDress,
  },
  {
    id: 'art-of-zardozi',
    category: 'Behind the Seams',
    title: 'The Art of Zardozi: Preserving Ancient Crafts',
    excerpt:
      'Inside the embroidery clusters and atelier hands that finish every SAAN piece, stitch by stitch.',
    date: '14 February 2026',
    readingTime: '7 min read',
    image: SAANLABEL_PRODUCTS.inkBlueSareeAlt,
  },
  {
    id: 'resort-2026',
    category: 'Lookbook',
    title: 'Resort 2026: An Exclusive First Look',
    excerpt:
      'An early glimpse of the season ahead — soft geometry, sunlit cloth, and unhurried ease.',
    date: '2 February 2026',
    readingTime: '4 min read',
    image: SAANLABEL_COLLECTIONS.luxeEditBanner,
  },
] as const;

export type JournalPost = (typeof JOURNAL_POSTS)[number];

export const JOURNAL_CATEGORIES = [
  { id: 'all', label: 'All Stories' },
  { id: 'Style Guide', label: 'Style Guide' },
  { id: "Editor's Picks", label: "Editor's Picks" },
  { id: 'Behind the Seams', label: 'Behind the Seams' },
  { id: 'Lookbook', label: 'Lookbook' },
] as const;

export function getJournalPostById(id: string): JournalPost | undefined {
  return JOURNAL_POSTS.find((post) => post.id === id);
}

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
    { value: 0, suffix: '', label: 'Fast fashion' },
  ],
  heroImage: {
    src: SAANLABEL_PRODUCTS.regalMaroonKurta,
    alt: 'SAAN artisan portrait from the Bandra atelier',
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
  image: SAANLABEL_SECTIONS.bestSellersCampaign,
  href: '/shop/best-sellers',
} as const;

export const ATELIER_COPY = {
  hero: {
    title: 'SAAN.',
    statement: 'Redefining the Indian wardrobe, one stitch at a time.',
    signature: 'By Jueata · Mumbai · Est. 2024',
  },
  headline: 'Brand Story',
  intro: [
    'SAAN is born from the belief that true elegance lies in restraint.',
    "Rooted in Indian tradition yet shaped by modern sensibilities, SAAN celebrates the woman who doesn't need excess to be seen. Every detail is deliberate, every form thoughtful — much like the women who wear it.",
    "At the heart of the identity is a single adornment dot. Subtle yet powerful, it draws from India's timeless decorative language — embellishments, and marks of grace — reimagined for today. It represents that one defining element that completes a look, the quiet accent that elevates simplicity into sophistication.",
  ],
  founder: {
    title: 'Jueata Kaur.',
    role: 'Founder & creative director.',
    image: {
      src: SAANLABEL_COLLECTIONS.ethnicWear,
      alt: 'SAAN editorial study in contemporary Indian tailoring',
    },
    body: [
      "Jueata started SAAN in 2024 with a small team of pattern-makers in Bandra and a single brief: make Indian wear that doesn't feel like a costume — that you can wear to your own wedding and again, three months later, to dinner.",
      'Trained as a textile designer and with a background in atelier work in Mumbai, she leads the design, the colour stories and the fittings.',
    ],
    quote:
      "Restraint isn't about taking things away. It's about knowing which one thing to keep.",
  },
  visit: {
    title: 'The Bandra atelier.',
    introduction: 'By appointment, Tuesday to Saturday, 11AM to 7PM.',
    image: {
      src: SAANLABEL_COLLECTIONS.coordSets,
      alt: 'SAAN atelier editorial featuring a hand-finished ivory ensemble',
    },
    details: [
      {
        id: 'address',
        title: 'Address',
        lines: ['Pearl Heights, 1st Floor', 'Linking Road, Bandra West', 'Mumbai 400050'],
      },
      {
        id: 'hours',
        title: 'Hours',
        lines: ['Tuesday to Saturday', '11AM — 7PM', 'By appointment'],
      },
      {
        id: 'book',
        title: 'Book',
        lines: ['+91 99206 13132', 'jueatakaur@gmail.com'],
      },
    ],
    cta: {
      label: 'Book a visit on WhatsApp',
      href: 'https://wa.me/919920613132',
    },
  },
  madeToMeasure: {
    title: 'Stitched for you.',
    description:
      'Almost every piece on SAAN can be made to your exact measurements. We do this carefully, in our atelier, in 18–25 days.',
    cta: { label: 'Browse pieces', href: '/shop' },
    steps: [
      {
        number: '01',
        title: 'Pick a piece',
        description: 'On any product page, choose made-to-measure.',
      },
      {
        number: '02',
        title: 'Send measurements',
        description:
          'We reach out on WhatsApp within 24 hours with a measurement guide.',
      },
      {
        number: '03',
        title: 'We stitch',
        description:
          '18–25 working days, depending on the piece. We send updates as the work progresses.',
      },
      {
        number: '04',
        title: 'One free alteration',
        description:
          "After delivery, one alteration is on us. Most don't need it.",
      },
    ],
  },
  careers: {
    title: 'Join the atelier.',
    introduction: 'Love to work with a fashion brand.',
    email: 'jueatakaur@gmail.com',
    roles: [
      {
        title: 'Web & Performance Specialist',
        status: 'Open',
        description:
          "We're looking for a developer with a marketing brain and 1–2 years of experience to own our infrastructure, ad strategy, and daily campaigns.",
        responsibilities: [
          'Infrastructure — build, maintain, and optimise site speed',
          'Ads — own Google and Meta ad strategy and ROI',
          'Strategy — launch daily trend-based campaigns',
        ],
      },
      {
        title: 'Atelier Tailor',
        status: 'Coming soon',
        description: '',
        responsibilities: [],
      },
    ],
  },
  classicStatement: {
    word: 'CLASSIC',
    tagline: 'We Are Always',
    ariaLabel: 'We are always classic',
    portrait: {
      src: SAANLABEL_SECTIONS.brandPhilosophy,
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

export const JOURNAL_COPY = {
  hero: {
    title: 'The SAAN Journal',
    description: 'Stories of style, heritage, and modern living.',
    image: {
      src: SAANLABEL_COLLECTIONS.westernWear,
      alt: 'Editorial campaign photography for the SAAN Journal',
    },
  },
  featured: {
    ctaLabel: 'Read the Story',
  },
  quote: {
    text: ATELIER_COPY.closing.paragraphs[2],
    image: {
      src: SAANLABEL_PRODUCTS.regalMaroonKurta,
      alt: 'Immersive editorial portrait from the SAAN atelier',
    },
  },
  latest: {
    title: 'More from the Journal',
  },
} as const;

export const CONTACT_COPY = {
  hero: {
    title: 'Got Any Questions?',
    description:
      'Use the form below to get in touch with our team.',
    image: {
      src: SAANLABEL_COLLECTIONS.coordSets,
      alt: 'Lifestyle editorial imagery for contacting SAAN',
    },
  },
  info: {
    email: {
      label: 'Email',
      value: 'jueatakaur@gmail.com',
      href: 'mailto:jueatakaur@gmail.com',
    },
    phone: {
      label: 'Phone',
      value: '+91 99206 13132',
      href: 'tel:+919920613132',
    },
    hours: {
      label: 'Hours',
      value: 'Monday – Saturday',
      detail: '11AM – 7PM IST',
    },
    address: {
      label: 'Atelier',
      lines: [
        'Pearl Heights, 1st Floor',
        'Linking Road, Bandra West',
        'Mumbai 400050',
      ],
      detail: 'Visits by appointment',
    },
    social: {
      label: 'Instagram',
      value: '@saan.label',
      href: 'https://www.instagram.com/saan.label',
    },
  },
  form: {
    title: 'Send a Message',
    description: 'Use the form below to get in touch with the sales team.',
    submitLabel: 'Send Question',
    successMessage: 'Thank you. We will respond within one to two business days.',
  },
  studio: {
    title: 'The Bandra Atelier',
    body: ATELIER_LANDING_COPY.body[0],
    image: {
      src: SAANLABEL_PRODUCTS.regalMaroonKurta,
      alt: 'Inside the SAAN Bandra atelier',
    },
  },
  support: {
    title: 'How We Can Help',
    image: {
      src: SAANLABEL_PRODUCTS.whitePersianAnarkali,
      alt: 'Editorial product photography from SAAN',
    },
    items: [
      {
        title: 'General Enquiries',
        description:
          'Redefining heritage for the modern muse. Ethical craftsmanship meets timeless design.',
      },
      {
        title: 'Order Support',
        description: 'For order status, exchanges, and delivery updates.',
      },
      {
        title: 'Shipping Queries',
        description: ANNOUNCEMENTS[0],
      },
    ],
  },
  closing: {
    statement: ATELIER_COPY.closing.paragraphs[1],
    image: {
      src: SAANLABEL_COLLECTIONS.ethnicWear,
      alt: 'Editorial closing image from the SAAN collections',
    },
  },
} as const;

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

export const SHOP_OCCASIONS = PRODUCT_OCCASIONS;
export type ShopOccasion = ProductOccasion;

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
  occasion: ShopOccasion[];
  image: string;
  images?: readonly string[];
  isNew: boolean;
  /** Present for API-backed products; static catalog items fall back to `id`. */
  slug?: string;
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
    occasion: ['Festive'],
    image: SAANLABEL_PRODUCTS.regalMaroonKurta,
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
    occasion: ['Wedding'],
    image: SAANLABEL_PRODUCTS.inkBlueSaree,
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
    occasion: ['Daily'],
    image: SAANLABEL_PRODUCTS.coralPinkDhoti,
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
    occasion: ['Festive'],
    image: SAANLABEL_PRODUCTS.purpleGlassKurta,
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
    occasion: ['Cocktail'],
    image: SAANLABEL_PRODUCTS.saanPrintKurta,
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
    occasion: ['Wedding'],
    image: SAANLABEL_PRODUCTS.whitePersianAnarkali,
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
    occasion: ['Daily'],
    image: SAANLABEL_PRODUCTS.pastelMaxiDress,
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
    occasion: ['Daily'],
    image: SAANLABEL_PRODUCTS.whiteCottonCoord,
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
    occasion: ['Festive'],
    image: SAANLABEL_PRODUCTS.saanPrintKurta,
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
    occasion: ['Festive'],
    image: SAANLABEL_PRODUCTS.noirGraceSuit,
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
    occasion: ['Cocktail'],
    image: SAANLABEL_PRODUCTS.electricBlueCoord,
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
    occasion: ['Wedding'],
    image: SAANLABEL_PRODUCTS.kaliWhiteBoneGown,
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
    occasion: ['Daily'],
    image: SAANLABEL_PRODUCTS.greenBoneDress,
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

export function getShopProductBySlug(slug: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find((p) => p.id === slug);
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
  ...SHOP_OCCASIONS.map((occasion) => ({ id: occasion, label: occasion })),
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

export const HOME_COPY = {
  newArrivals: {
    title: 'New Arrivals',
    description:
      'The latest pieces from our atelier — cut, sewn and finished by hand in Bandra.',
    campaignImage: {
      src: SAANLABEL_SECTIONS.newArrivalsCampaign,
      alt: 'Kali White Bone Gown from the SAAN new arrivals edit',
    },
    cta: { label: 'View All', href: '/shop?sort=newest' },
  },
  brandPhilosophy: {
    headline: ATELIER_COPY.headline,
    body: ATELIER_COPY.intro[0],
    pullQuote: ATELIER_COPY.closing.paragraphs[2],
    image: {
      mobile: {
        src: '/images/brand-statement.webp',
        alt: 'Woman in a shimmering lilac metallic kurta and olive satin trousers, standing between tall windows in a dark charcoal interior',
      },
      desktop: {
        src: '/images/brand-statement-desktop.webp',
        alt: 'Full-length editorial of a woman in a lilac metallic kurta and olive trousers, centered in a wide dark atelier between two sunlit windows',
      },
    },
  },
  signatureCollections: {
    title: `${SECTION_COPY.collections.title}${SECTION_COPY.collections.titleAccent}`,
    subtitle: SECTION_COPY.collections.subtitle,
  },
  editorialCampaign: {
    title: 'The Luxe Edit',
    image: SAANLABEL_SECTIONS.editorialCampaign,
    href: '/shop',
    cta: { label: 'Shop the Edit', href: '/shop' },
  },
  shopByOccasion: {
    title: 'Shop by Occasion',
    subtitle: 'Curated for the way you live — not how categories are filed.',
  },
  bestSellers: {
    title: FEATURED_COLLECTION.title,
    description: FEATURED_COLLECTION.tagline,
    campaignImage: {
      src: SAANLABEL_SECTIONS.bestSellersCampaign,
      alt: 'Purple Glass Organza Luxe Kurta Set editorial',
    },
    cta: { label: 'Shop Best Sellers', href: '/shop/best-sellers' },
  },
  craftsmanship: {
    title: 'Fourteen hands. One piece.',
    body: ATELIER_LANDING_COPY.body[0],
    detailImage: {
      src: SAANLABEL_SECTIONS.craftsmanship,
      alt: 'Ink Blue Glossy Tissue Draped Saree fabric detail',
    },
    cta: ATELIER_LANDING_COPY.cta,
  },
  community: {
    title: 'Follow the Journey',
    description:
      'Behind the seams, on the streets, in the atelier — a quiet record of SAAN in the world.',
    cta: {
      label: 'Follow the Journey',
      href: BRAND.social.instagram,
    },
  },
} as const;

export const SIGNATURE_COLLECTIONS = COLLECTIONS.slice(0, 4);

export const OCCASION_TILES = [
  {
    id: 'wedding-guest',
    label: 'Wedding Guest',
    description: 'Presence without performance.',
    href: '/shop?occasion=Wedding',
    image: SAANLABEL_PRODUCTS.whitePersianAnarkali,
  },
  {
    id: 'festive',
    label: 'Festive',
    description: 'Ceremonial depth, reimagined.',
    href: '/shop?occasion=Festive',
    image: SAANLABEL_PRODUCTS.purpleGlassKurta,
  },
  {
    id: 'everyday-luxury',
    label: 'Everyday Luxury',
    description: 'Intentional design for a simpler pace.',
    href: '/shop?occasion=Daily',
    image: SAANLABEL_PRODUCTS.whiteCottonCoord,
  },
  {
    id: 'vacation',
    label: 'Vacation',
    description: 'Resort ease, editorial ease.',
    href: '/shop?occasion=Resort',
    image: SAANLABEL_PRODUCTS.pastelMaxiDress,
  },
  {
    id: 'evening',
    label: 'Evening',
    description: 'Where light meets the unseen.',
    href: '/shop?occasion=Cocktail',
    image: SAANLABEL_PRODUCTS.noirGraceSuit,
  },
  {
    id: 'workwear',
    label: 'Workwear',
    description: 'Quiet confidence, every day.',
    href: '/shop?category=Kurta%20Sets',
    image: SAANLABEL_PRODUCTS.regalMaroonKurta,
  },
] as const;

export const COMMUNITY_IMAGES = SAANLABEL_INSTAGRAM;

const BEST_SELLER_IDS = [
  'bloody-maroon-saree-set',
  'the-jhalak-dress',
  'shaila-lehenga',
  'sunheri-sharara-set',
  'effortless-pink-anarkali',
  'the-maroon-dhoti-set',
] as const;

export function getNewArrivalProducts(limit = 8): ShopProduct[] {
  const arrivals = SHOP_PRODUCTS.filter((product) => product.isNew);
  return arrivals.length >= limit
    ? arrivals.slice(0, limit)
    : [...arrivals, ...SHOP_PRODUCTS.filter((p) => !p.isNew)].slice(0, limit);
}

export function getBestSellerProducts(): ShopProduct[] {
  return BEST_SELLER_IDS.map((id) => SHOP_PRODUCTS.find((p) => p.id === id)).filter(
    (product): product is ShopProduct => product !== undefined
  );
}

