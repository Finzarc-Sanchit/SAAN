const SHOPIFY_FILES = 'https://saanlabel.com/cdn/shop/files';
const SHOPIFY_S_FILES =
  'https://cdn.shopify.com/s/files/1/0994/5795/8201/files';

/** Builds a SAAN Label Shopify CDN URL with an optional width transform. */
export function saanShopImage(path: string, width = 1200): string {
  return `${SHOPIFY_FILES}/${path}?width=${width}`;
}

export function saanShopifyFile(path: string, width = 1200): string {
  return `${SHOPIFY_S_FILES}/${path}?width=${width}`;
}

export const SAANLABEL_PRODUCTS = {
  electricBlueCoord: saanShopImage('10001_1R.jpg', 800),
  whiteCottonCoord: saanShopImage('2_01a5631f-9ed3-454d-807a-0340db9d5509.jpg', 800),
  pastelMaxiDress: saanShopImage('2_a6ac4a17-31d9-4ce1-bb19-e11eacbd2a4b.jpg', 800),
  saanPrintMiniDress: saanShopImage('1_21f66bcf-53f1-47c4-a5a1-28c6acf93a38.jpg', 800),
  kaliWhiteBoneGown: saanShopImage('1_787c478a-b3b2-4d4a-9074-0d0a00ea89c2.jpg', 800),
  greenBoneDress: saanShopImage('1_9a1268dc-e0bb-4e8c-9b8d-9b63ea1142f8.jpg', 800),
  purpleGlassKurta: saanShopImage('100.jpg', 1200),
  purpleGlassKurtaAlt: saanShopImage('100-2.jpg', 1200),
  saanPrintKurta: saanShopImage('511_R.jpg', 1200),
  saanPrintKurtaAlt: saanShopImage('511-1.png', 1200),
  noirGraceSuit: saanShopImage('43_R.jpg', 1200),
  noirGraceSuitAlt: saanShopImage('43-2_R.jpg', 1200),
  inkBlueSaree: saanShopImage('41_1_r.jpg', 1200),
  inkBlueSareeAlt: saanShopImage('42-1.jpg', 1200),
  whitePersianAnarkali: saanShopImage('40_R.jpg', 1200),
  whitePersianAnarkaliAlt: saanShopImage('40-2_R.jpg', 1200),
  coralPinkDhoti: saanShopImage('29_R.jpg', 1200),
  coralPinkDhotiAlt: saanShopImage('29-1_R.jpg', 1200),
  regalMaroonKurta: saanShopifyFile(
    '6-1_R_7f20da03-2f92-45f9-9818-97827e6ea2df.jpg',
    1600
  ),
} as const;

export const SAANLABEL_COLLECTIONS = {
  coordSets: saanShopImage('19_R_9677c92a-8ca8-4b39-b4e8-6e836ed93c71.jpg', 1600),
  ethnicWear: saanShopImage('02.jpg', 1600),
  westernWear: saanShopImage('3_925dc4ea-9e16-4897-82ea-de87552d9bb6.jpg', 1600),
  luxeEditBanner: saanShopImage('5_R.jpg', 3840),
} as const;

const COMMUNITY_ALTS = [
  'Wrapped in grace — festive SAAN styling',
  'A silhouette that speaks before words do',
  'Where elegance meets tradition',
  'Why dress basic when you can wear art',
  'Timeless elegance for every occasion',
  'Light as air, structured as a statement',
  "The season's silhouette, refined",
  'A new chapter is live',
  'The countdown is officially on',
  'The vision is visioning — new drop preview',
  'Drop 02 coming soon',
  'Behind the scenes at SAAN',
  'Every silhouette has a story to tell',
  'Tradition reimagined',
  'Glass organza phase editorial',
  'The story behind the SAAN name',
] as const;

/** Locally hosted community feed — avoids Instagram CDN hotlink blocks in Next Image. */
export const SAANLABEL_INSTAGRAM = COMMUNITY_ALTS.map((alt, index) => ({
  src: `/images/community/community-${String(index + 1).padStart(2, '0')}.jpg`,
  alt,
}));

/** Editorial / section imagery sourced from saanlabel.com homepage. */
export const SAANLABEL_SECTIONS = {
  newArrivalsCampaign: SAANLABEL_PRODUCTS.kaliWhiteBoneGown,
  brandPhilosophy: SAANLABEL_PRODUCTS.regalMaroonKurta,
  editorialCampaign: SAANLABEL_COLLECTIONS.luxeEditBanner,
  bestSellersCampaign: SAANLABEL_PRODUCTS.purpleGlassKurtaAlt,
  craftsmanship: SAANLABEL_PRODUCTS.inkBlueSareeAlt,
  shopHero: SAANLABEL_COLLECTIONS.luxeEditBanner,
} as const;

/** Product-card hover pool using SAAN Label CDN assets. */
export const SAANLABEL_HOVER_POOL = [
  SAANLABEL_PRODUCTS.purpleGlassKurtaAlt,
  SAANLABEL_PRODUCTS.saanPrintKurtaAlt,
  SAANLABEL_PRODUCTS.noirGraceSuitAlt,
  SAANLABEL_PRODUCTS.inkBlueSareeAlt,
  SAANLABEL_PRODUCTS.whitePersianAnarkaliAlt,
  SAANLABEL_PRODUCTS.coralPinkDhotiAlt,
  SAANLABEL_PRODUCTS.electricBlueCoord,
  SAANLABEL_PRODUCTS.pastelMaxiDress,
  SAANLABEL_COLLECTIONS.coordSets,
  SAANLABEL_COLLECTIONS.ethnicWear,
  SAANLABEL_COLLECTIONS.westernWear,
] as const;
