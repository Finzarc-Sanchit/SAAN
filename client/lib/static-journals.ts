import {
  SAANLABEL_COLLECTIONS,
  SAANLABEL_PRODUCTS,
} from '@/lib/saanlabel-images';
import type { Journal } from '@/lib/types/journal';

/** Static journal seed data — same shape as the API `Journal` model. */
export const STATIC_JOURNALS: Journal[] = [
  {
    id: 'static-ethnic-vs-traditional',
    slug: 'ethnic-vs-traditional',
    title: 'Ethnic vs Traditional Wear: Decoding the Differences',
    excerpt:
      'How heritage silhouettes and contemporary ethnic dressing meet — and where they quietly diverge.',
    category: 'Style Guide',
    imageUrl: SAANLABEL_COLLECTIONS.ethnicWear,
    imageAlt: 'Ethnic wear editorial for the SAAN Journal',
    blocks: [
      {
        type: 'paragraph',
        value:
          'How heritage silhouettes and contemporary ethnic dressing meet — and where they quietly diverge.',
      },
    ],
    status: 'published',
    featured: true,
    readMinutes: 6,
    publishedAt: '2026-03-12T00:00:00.000Z',
    createdAt: '2026-03-12T00:00:00.000Z',
    updatedAt: '2026-03-12T00:00:00.000Z',
  },
  {
    id: 'static-summer-dressing-guide',
    slug: 'summer-dressing-guide',
    title: 'Summer Dressing Guide: Staying Cool & Chic',
    excerpt:
      'Light fabrics, considered layers, and pieces made for heat without losing presence.',
    category: "Editor's Picks",
    imageUrl: SAANLABEL_PRODUCTS.pastelMaxiDress,
    imageAlt: 'Summer dressing in a light SAAN silhouette',
    blocks: [
      {
        type: 'paragraph',
        value:
          'Light fabrics, considered layers, and pieces made for heat without losing presence.',
      },
    ],
    status: 'published',
    featured: false,
    readMinutes: 5,
    publishedAt: '2026-02-28T00:00:00.000Z',
    createdAt: '2026-02-28T00:00:00.000Z',
    updatedAt: '2026-02-28T00:00:00.000Z',
  },
  {
    id: 'static-art-of-zardozi',
    slug: 'art-of-zardozi',
    title: 'The Art of Zardozi: Preserving Ancient Crafts',
    excerpt:
      'Inside the embroidery clusters and atelier hands that finish every SAAN piece, stitch by stitch.',
    category: 'Behind the Seams',
    imageUrl: SAANLABEL_PRODUCTS.inkBlueSareeAlt,
    imageAlt: 'Close detail of embroidery craft for SAAN',
    blocks: [
      {
        type: 'paragraph',
        value:
          'Inside the embroidery clusters and atelier hands that finish every SAAN piece, stitch by stitch.',
      },
    ],
    status: 'published',
    featured: false,
    readMinutes: 7,
    publishedAt: '2026-02-14T00:00:00.000Z',
    createdAt: '2026-02-14T00:00:00.000Z',
    updatedAt: '2026-02-14T00:00:00.000Z',
  },
  {
    id: 'static-resort-2026',
    slug: 'resort-2026',
    title: 'Resort 2026: An Exclusive First Look',
    excerpt:
      'An early glimpse of the season ahead — soft geometry, sunlit cloth, and unhurried ease.',
    category: 'Lookbook',
    imageUrl: SAANLABEL_COLLECTIONS.luxeEditBanner,
    imageAlt: 'Resort 2026 editorial first look',
    blocks: [
      {
        type: 'paragraph',
        value:
          'An early glimpse of the season ahead — soft geometry, sunlit cloth, and unhurried ease.',
      },
    ],
    status: 'published',
    featured: false,
    readMinutes: 4,
    publishedAt: '2026-02-02T00:00:00.000Z',
    createdAt: '2026-02-02T00:00:00.000Z',
    updatedAt: '2026-02-02T00:00:00.000Z',
  },
  {
    id: 'static-quiet-luxury-kurta',
    slug: 'quiet-luxury-kurta',
    title: 'The Quiet Luxury of a Well-Cut Kurta',
    excerpt:
      'Why proportion, fabric hand, and restraint matter more than ornament when dressing with intention.',
    category: 'Style Guide',
    imageUrl: SAANLABEL_PRODUCTS.purpleGlassKurta,
    imageAlt: 'A well-cut SAAN kurta in quiet light',
    blocks: [
      {
        type: 'paragraph',
        value:
          'Why proportion, fabric hand, and restraint matter more than ornament when dressing with intention.',
      },
    ],
    status: 'published',
    featured: false,
    readMinutes: 5,
    publishedAt: '2026-01-18T00:00:00.000Z',
    createdAt: '2026-01-18T00:00:00.000Z',
    updatedAt: '2026-01-18T00:00:00.000Z',
  },
  {
    id: 'static-notes-from-the-bandra-atelier',
    slug: 'notes-from-the-bandra-atelier',
    title: 'Notes from the Bandra Atelier',
    excerpt:
      'A day in the studio — fittings, chalk marks, and the slow rhythm of pieces made by hand.',
    category: 'Behind the Seams',
    imageUrl: SAANLABEL_PRODUCTS.regalMaroonKurta,
    imageAlt: 'Tailoring work on a SAAN garment in the Bandra atelier',
    blocks: [
      {
        type: 'paragraph',
        value:
          'A day in the studio — fittings, chalk marks, and the slow rhythm of pieces made by hand.',
      },
    ],
    status: 'published',
    featured: false,
    readMinutes: 6,
    publishedAt: '2026-01-05T00:00:00.000Z',
    createdAt: '2026-01-05T00:00:00.000Z',
    updatedAt: '2026-01-05T00:00:00.000Z',
  },
  {
    id: 'static-coord-set-edit',
    slug: 'coord-set-edit',
    title: 'The Coord Set Edit: Ease Without Compromise',
    excerpt:
      'Matched sets that travel from morning to evening — considered colour, clean lines, quiet confidence.',
    category: "Editor's Picks",
    imageUrl: SAANLABEL_COLLECTIONS.coordSets,
    imageAlt: 'SAAN coord set styling edit',
    blocks: [
      {
        type: 'paragraph',
        value:
          'Matched sets that travel from morning to evening — considered colour, clean lines, quiet confidence.',
      },
    ],
    status: 'published',
    featured: false,
    readMinutes: 4,
    publishedAt: '2025-12-20T00:00:00.000Z',
    createdAt: '2025-12-20T00:00:00.000Z',
    updatedAt: '2025-12-20T00:00:00.000Z',
  },
  {
    id: 'static-wedding-guest-dressing',
    slug: 'wedding-guest-dressing',
    title: 'Wedding Guest Dressing, Refined',
    excerpt:
      'How to arrive polished without overshadowing the occasion — tone, texture, and timeless silhouettes.',
    category: 'Style Guide',
    imageUrl: SAANLABEL_PRODUCTS.whitePersianAnarkali,
    imageAlt: 'Refined wedding guest dressing by SAAN',
    blocks: [
      {
        type: 'paragraph',
        value:
          'How to arrive polished without overshadowing the occasion — tone, texture, and timeless silhouettes.',
      },
    ],
    status: 'published',
    featured: false,
    readMinutes: 5,
    publishedAt: '2025-12-08T00:00:00.000Z',
    createdAt: '2025-12-08T00:00:00.000Z',
    updatedAt: '2025-12-08T00:00:00.000Z',
  },
  {
    id: 'static-fabric-stories-silk',
    slug: 'fabric-stories-silk',
    title: 'Fabric Stories: Silk, Organza & Handloom',
    excerpt:
      'Where SAAN cloth comes from — West Bengal, Bhagalpur, and the weavers behind each season.',
    category: 'Behind the Seams',
    imageUrl: SAANLABEL_PRODUCTS.purpleGlassKurtaAlt,
    imageAlt: 'Handloom and silk fabric stories from SAAN',
    blocks: [
      {
        type: 'paragraph',
        value:
          'Where SAAN cloth comes from — West Bengal, Bhagalpur, and the weavers behind each season.',
      },
    ],
    status: 'published',
    featured: false,
    readMinutes: 7,
    publishedAt: '2025-11-22T00:00:00.000Z',
    createdAt: '2025-11-22T00:00:00.000Z',
    updatedAt: '2025-11-22T00:00:00.000Z',
  },
  {
    id: 'static-noir-evening-edit',
    slug: 'noir-evening-edit',
    title: 'The Noir Evening Edit',
    excerpt:
      'Deep tones, soft structure, and pieces meant for night — photographed in muted light.',
    category: 'Lookbook',
    imageUrl: SAANLABEL_PRODUCTS.noirGraceSuit,
    imageAlt: 'Noir evening edit lookbook for SAAN',
    blocks: [
      {
        type: 'paragraph',
        value:
          'Deep tones, soft structure, and pieces meant for night — photographed in muted light.',
      },
    ],
    status: 'published',
    featured: false,
    readMinutes: 4,
    publishedAt: '2025-11-10T00:00:00.000Z',
    createdAt: '2025-11-10T00:00:00.000Z',
    updatedAt: '2025-11-10T00:00:00.000Z',
  },
  {
    id: 'static-made-to-measure',
    slug: 'made-to-measure',
    title: 'Made to Measure: Stitched for You',
    excerpt:
      'How a SAAN piece is cut to your proportions — measurements, fittings, and the wait worth taking.',
    category: "Editor's Picks",
    imageUrl: SAANLABEL_PRODUCTS.coralPinkDhoti,
    imageAlt: 'Made-to-measure fittings at the SAAN atelier',
    blocks: [
      {
        type: 'paragraph',
        value:
          'How a SAAN piece is cut to your proportions — measurements, fittings, and the wait worth taking.',
      },
    ],
    status: 'published',
    featured: false,
    readMinutes: 5,
    publishedAt: '2025-10-28T00:00:00.000Z',
    createdAt: '2025-10-28T00:00:00.000Z',
    updatedAt: '2025-10-28T00:00:00.000Z',
  },
  {
    id: 'static-western-wear-reimagined',
    slug: 'western-wear-reimagined',
    title: 'Western Wear, Reimagined for India',
    excerpt:
      'Clean modern silhouettes shaped by local craft — where contemporary dressing meets Indian ease.',
    category: 'Lookbook',
    imageUrl: SAANLABEL_COLLECTIONS.westernWear,
    imageAlt: 'Western wear reimagined for India by SAAN',
    blocks: [
      {
        type: 'paragraph',
        value:
          'Clean modern silhouettes shaped by local craft — where contemporary dressing meets Indian ease.',
      },
    ],
    status: 'published',
    featured: false,
    readMinutes: 4,
    publishedAt: '2025-10-12T00:00:00.000Z',
    createdAt: '2025-10-12T00:00:00.000Z',
    updatedAt: '2025-10-12T00:00:00.000Z',
  },
];

export function getStaticJournalBySlug(slug: string): Journal | undefined {
  return STATIC_JOURNALS.find((post) => post.slug === slug);
}
