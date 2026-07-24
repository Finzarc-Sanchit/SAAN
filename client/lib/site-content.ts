import {
  SAANLABEL_COLLECTIONS,
  SAANLABEL_INSTAGRAM,
  SAANLABEL_PRODUCTS,
  SAANLABEL_SECTIONS,
} from '@/lib/saanlabel-images';
import { PRODUCT_OCCASIONS, type ProductOccasion } from '@/lib/product-occasion';
import {
  STATIC_JOURNALS,
} from '@/lib/static-journals';
import type { Journal } from '@/lib/types/journal';

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

export {
  STATIC_JOURNALS as JOURNAL_POSTS,
  getStaticJournalBySlug,
} from '@/lib/static-journals';
export type { Journal as JournalPost } from '@/lib/types/journal';

export const JOURNAL_CATEGORIES = [
  { id: 'all', label: 'All Stories' },
  { id: 'Style Guide', label: 'Style Guide' },
  { id: "Editor's Picks", label: "Editor's Picks" },
  { id: 'Behind the Seams', label: 'Behind the Seams' },
  { id: 'Lookbook', label: 'Lookbook' },
] as const;

export function getJournalPostById(id: string): Journal | undefined {
  return STATIC_JOURNALS.find((post) => post.id === id || post.slug === id);
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

export const FOOTER_APPOINTMENT_COPY = {
  title: 'Visit the Atelier',
  description:
    'Book a private consultation in Bandra — fittings, fabric, and made-to-measure guidance.',
  ctaLabel: 'Book Appointment',
  href: '/appointment',
} as const;

export const FOOTER_LINKS = {
  shop: [
    { label: 'Shop All', href: '/shop' },
    { label: 'Collections', href: '/collections' },
    { label: 'Journal', href: '/journal' },
  ],
  discover: [
    { label: 'Our Story', href: '/atelier' },
    { label: 'Contact', href: '/contact' },
  ],
  information: [
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'Return & Exchange Policy', href: '/return-exchange' },
    { label: 'Shipping Policy', href: '/shipping' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ],
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
      src: "/images/jueata-kaur.webp",
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
      src: "/images/visit-section.webp",
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
      label: 'Book Appointment',
      href: '/appointment',
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
    title: 'Journal',
    description:
      'Stories of craft, heritage, and modern living — curated to inspire every wardrobe and every season.',
    image: {
      src: '/images/journal-hero.webp',
      alt: 'Editorial lifestyle photograph for the SAAN Journal',
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

export const APPOINTMENT_COPY = {
  hero: {
    title: 'Book an Appointment',
    description:
      'Visit the Bandra atelier for a private consultation — fittings, fabric, and made-to-measure guidance.',
    image: {
      src: '/images/visit-section.webp',
      alt: 'SAAN atelier editorial featuring a hand-finished ivory ensemble',
    },
  },
  intro: {
    title: 'The atelier, by appointment',
    description:
      'Share a few details and choose a time that suits you. We will confirm your visit by email.',
  },
  form: {
    title: 'Request a visit',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    phone: 'Phone',
    appointmentDate: 'Preferred date',
    timeSlot: 'Preferred time',
    appointmentType: 'Appointment type',
    notes: 'Notes (optional)',
    submitLabel: 'Request Appointment',
    selectingSlot: 'Choose a date to see available times',
    closedDay: 'The atelier is closed on this date. Please choose another day.',
    loadingSlots: 'Loading times…',
    slotsUnavailable: 'No times are open for this date.',
  },
  success: {
    title: 'Request received',
    body: 'Thank you. We have your appointment request and will confirm by email shortly.',
    referenceLabel: 'Reference',
    summaryLabel: 'Your visit',
    ctaLabel: 'Return to the Atelier',
    ctaHref: '/atelier',
  },
  info: {
    addressLabel: 'Atelier',
    hoursLabel: 'Hours',
    contactLabel: 'Contact',
    durationLabel: 'Session length',
    durationNote: 'Each visit is reserved for the full slot duration shown when you book.',
    guidelinesTitle: 'Before you arrive',
    cancellationTitle: 'Cancellation',
    image: {
      src: '/images/visit-section.webp',
      alt: 'Quiet light in the SAAN Bandra atelier',
    },
  },
} as const;

export const CONTACT_COPY = {
  hero: {
    title: 'Got Any Questions?',
    description:
      'Reach the atelier for styling advice, order care, or a quiet conversation about made-to-measure.',
    image: {
      src: '/images/contact-hero.webp',
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
      src: "/images/support-section-image.webp",
      alt: 'Editorial product photography from SAAN',
    },
    items: [
      {
        title: 'General Enquiries',
        description:
          'Brand questions, collection guidance, fabric notes, and anything that does not fit a form field. We reply within one to two business days.',
        detail: 'Email or WhatsApp · Mon–Sat',
      },
      {
        title: 'Order Support',
        description:
          'Track an order, change a delivery address before dispatch, or ask about sizing once your piece is on its way.',
        detail: 'Include your order number',
      },
      {
        title: 'Shipping & Delivery',
        description:
          'Complimentary shipping across India. Most ready-to-wear pieces leave the atelier within 3–5 working days; made-to-measure follows its own timeline.',
        detail: 'India-wide · tracked',
      },
      {
        title: 'Made-to-Measure',
        description:
          'Nearly every piece can be cut to your measurements. Share your brief and we will send a measurement guide within 24 hours.',
        detail: '18–25 working days typical',
      },
      {
        title: 'Atelier Visits',
        description:
          'Visit Pearl Heights on Linking Road by appointment — fittings, fabric swatches, and a quieter look at the season.',
        detail: 'Tue–Sat · 11AM–7PM',
      },
      {
        title: 'Returns & Exchanges',
        description:
          'Ready-to-wear may be exchanged within 7 days if unworn with tags. Made-to-measure is final once cutting begins.',
        detail: 'See shipping policy for steps',
      },
    ],
  },
  closing: {
    statement: ATELIER_COPY.closing.paragraphs[1],
    image: {
      src: "/images/closing-section-image.webp",
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

export const BRAND = {
  name: 'SAAN',
  tagline: 'Atmospheric Couture',
  logo: '/images/saan.jpg',
  logoOnLight: '/images/saan-transparent.png',
  description:
    'Redefining heritage for the modern muse. Ethical craftsmanship meets timeless design.',
  social: {
    instagram: 'https://www.instagram.com/saan.label',
    facebook: 'https://www.facebook.com/saan.label',
  },
} as const;

export { WHATSAPP_SUPPORT_URL } from '@/lib/whatsapp';

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
  slug?: string;
};

export function getCollectionById(id: string) {
  return COLLECTIONS.find((c) => c.id === id);
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
    campaign: {
      eyebrow: 'New Season',
      headline: ['Designed for', 'Everyday Rituals'],
      body: ['Crafted with intention.', 'Made to be worn every day.'],
    },
    campaignImage: {
      src: SAANLABEL_SECTIONS.newArrivalsCampaign,
      alt: 'Kali White Bone Gown from the SAAN new arrivals edit',
    },
    cta: { label: 'Discover Collection', href: '/shop?sort=newest' },
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
    subtitle:
      'Occasion wear and evening silhouettes — a quiet curation for the moments that ask for more.',
    image: SAANLABEL_SECTIONS.editorialCampaign,
    desktopImage: '/images/luxe-edit.webp',
    imagePrompt:
      'Full-bleed luxury fashion editorial for an Indian occasion-wear brand. A woman in a refined evening kurta set — deep wine or midnight tones with subtle metallic threadwork — standing in a dim atelier with soft window light from camera-left. Muted palette: charcoal, ivory, and a single signature burgundy accent. Composition: subject slightly off-centre, generous negative space above for headline overlay, calm confident posture, no smile. Shot on medium format, shallow depth of field, film grain, quiet luxury aesthetic like The Row or Toteme. No logos, no text, no busy patterns. Aspect ratio 16:9 landscape, suitable for full-width homepage hero with bottom gradient.',
    cta: { label: 'Shop the Edit', href: '/shop' },
    featuredCollectionTitle: 'Featured Collection',
  },
  shopByOccasion: {
    title: 'Shop by Occasion',
    subtitle: 'Curated for the way you live — not how categories are filed.',
  },
  bestSellers: {
    title: FEATURED_COLLECTION.title,
    description: FEATURED_COLLECTION.tagline,
    campaignImage: {
      src: '/images/best-seller.webp',
      alt: 'Purple Glass Organza Luxe Kurta Set editorial',
    },
    cta: { label: 'Shop Best Sellers', href: '/shop/best-sellers' },
  },
  craftsmanship: {
    title: 'Fourteen hands. One piece.',
    body: ATELIER_LANDING_COPY.body[0],
    detailImage: {
      src: '/images/craft-story.webp',
      alt: 'Hand-finished embroidery in the SAAN atelier',
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

export const OCCASION_TILE_COPY: Record<
  ProductOccasion,
  { description: string; image: string; }
> = {
  Festive: {
    description: 'Ceremonial depth, reimagined.',
    image: SAANLABEL_PRODUCTS.purpleGlassKurta,
  },
  Wedding: {
    description: 'Presence without performance.',
    image: SAANLABEL_PRODUCTS.whitePersianAnarkali,
  },
  Daily: {
    description: 'Intentional design for a simpler pace.',
    image: SAANLABEL_PRODUCTS.whiteCottonCoord,
  },
  Cocktail: {
    description: 'Where light meets the unseen.',
    image: SAANLABEL_PRODUCTS.noirGraceSuit,
  },
  Resort: {
    description: 'Resort ease, editorial ease.',
    image: SAANLABEL_PRODUCTS.pastelMaxiDress,
  },
};

/** Homepage occasion tiles — mirrors `SHOP_OCCASION_FILTERS` (excludes "All"). */
export const OCCASION_TILES = PRODUCT_OCCASIONS.map((occasion) => ({
  id: occasion.toLowerCase(),
  label: occasion,
  description: OCCASION_TILE_COPY[occasion].description,
  href: `/shop?occasion=${encodeURIComponent(occasion)}`,
  image: OCCASION_TILE_COPY[occasion].image,
}));

export const COMMUNITY_IMAGES = SAANLABEL_INSTAGRAM;
