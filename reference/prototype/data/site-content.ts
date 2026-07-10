export const ANNOUNCEMENTS = [
  'COMPLIMENTARY SHIPPING ACROSS INDIA',
  'EK SUNHERI DOPAHAR · NOW LIVE',
  'MADE-TO-MEASURE AVAILABLE',
  'VISIT OUR BANDRA ATELIER · BY APPOINTMENT',
  'RESORT 2026 · SHELLS COMING SOON',
] as const;

export const NAV_LINKS = [
  { label: 'Collections', href: '/collections' },
  { label: 'New Arrivals', href: '/shop/new-arrivals' },
  { label: 'Best Sellers', href: '/shop/best-sellers' },
  { label: 'About Us', href: '/about' },
] as const;

export const CATEGORIES = [
  {
    id: 'bridal-exclusive',
    title: 'BRIDAL EXCLUSIVE',
    subtitle: 'Explore the Collection',
    image:
      'https://lh3.googleusercontent.com/aida/AP1WRLutlq9B7jbK8xaOM1Y6KXsC5yqI0VjsPXA6qrv6XuHRYaivjzopOb5Geofd8VR60viZRVujkP_dT3fQ9Bct_J2A9AgoRu5BfdablfKEafZWYWicegtuUJXLB6_GJIdF_rdP_yMFuBjxSncQ2bEHHzdRdyrXvX1jd7m4-P1wNWc75nWL6mC-pgsd8t5CHV7x7wf3cWYkO0UpW2rg0Vv2q0E_uLqSy8VrRMkKi4AdsFTT748GxCPbOkc0x6_p',
    featured: true,
  },
  {
    id: 'sets',
    title: 'SETS',
    image:
      'https://lh3.googleusercontent.com/aida/AP1WRLvTwGGOeFz9ygHnUIU9uYOJkKQ_u2JwQqLfGMG4BNr9Hb-4rDzgAgJ3C3rSjFjIBIwk7jxLtfVO9kXgYbqAdIoKC0Ui4NQZ3zoebrXZI-pjbc00ljEgtWlzaE3jDXf0Z0a_BvNK7zsI0NThEE90AL15JwoI7KoTYmnmj84Ql5GXCITVvYw0Pkha6JFgpiSBTytl-j8JsIzL5Kk_bWCLHoICuPjv28-FYxRHvFUYucXaBvDeHYINst-sBEk',
  },
  {
    id: 'suit-sets',
    title: 'SUIT SETS',
    image:
      'https://lh3.googleusercontent.com/aida/AP1WRLtpL7cJJWpwBvYshT4vae7Z-ey6HYZq7ALcwE6niKkTx6jIZMSzKOVkPA8eFD_fWaAIOnZ4n9ScoKX1KXBkVPaYsPmLtLt4f3oMjK4ScWiQi88Bhqi_kjTvhzFGqoyRVgklEyxMfnW77v_7XEKZkxmLSHP0TPGQL7K2-Dj9Cmhr8-Z_9Sis9yAjO_gFr-osKvzgyQBvVwAxHscohl_lH_uL-sC4UaeMmDDDQJNxKxu2W4pf5FPSNFxVh0CY',
  },
  {
    id: 'kurtas-kurtis',
    title: 'KURTAS & KURTIS',
    image:
      'https://lh3.googleusercontent.com/aida/AP1WRLslz93g_x2OyHpOLRKKwTYQb9lgLLd9pzBMD-hz3PaYOcL3pSfhMcjGCzfFvg6TxhmjCgFP3dELKTYkzBTNbrm5pC7IgCobXfq4zIZofgTOY5D8Fz53VlzaI1WkIZNZtkgldXjl82CYB4JLBDzDGXx4LE6W-e2vn4n834EFOAOTDxDpxEVpflDU3vbzH7uyjOju2WsBbPyw8I3Wmuij_lhDCYxMnPe1Lp-16pY9Q9xAGVTdg7xBQGgahGW7',
  },
  {
    id: 'summer-styles',
    title: 'SUMMER STYLES',
    image:
      'https://lh3.googleusercontent.com/aida/AP1WRLvKYrLQJS0tj5uxvdy2urfImp5EDpxWxOn8t3lZtA5n588Gc9coq3MmMAqP6dTDmbCcwk6UCG-s39YJAq1L-nOSNZih0gw0DALLLgEKMm0tg0dpjamyjQ-FyR0AGElVc3FP5SKmag3XtUw2xyDR3CzBRKlYeWFgaRGp_jLMSQpZ_BY9JNeOSC1ZpBQnUntEPqst7-FQzAtXJy-S65AtPZC6UYdE6L2pJK0UenU3BrjdYVK7Wd3zEQqSvqc',
  },
] as const;

export const PRODUCTS = [
  {
    id: 'zari-embroidered-lehenga',
    name: 'Zari Embroidered Lehenga',
    price: 125000,
    currency: 'INR',
    image:
      'https://lh3.googleusercontent.com/aida/AP1WRLslz93g_x2OyHpOLRKKwTYQb9lgLLd9pzBMD-hz3PaYOcL3pSfhMcjGCzfFvg6TxhmjCgFP3dELKTYkzBTNbrm5pC7IgCobXfq4zIZofgTOY5D8Fz53VlzaI1WkIZNZtkgldXjl82CYB4JLBDzDGXx4LE6W-e2vn4n834EFOAOTDxDpxEVpflDU3vbzH7uyjOju2WsBbPyw8I3Wmuij_lhDCYxMnPe1Lp-16pY9Q9xAGVTdg7xBQGgahGW7',
    isNew: false,
  },
  {
    id: 'silk-chanderi-kurta-set',
    name: 'Silk Chanderi Kurta Set',
    price: 42000,
    currency: 'INR',
    image:
      'https://lh3.googleusercontent.com/aida/AP1WRLtpL7cJJWpwBvYshT4vae7Z-ey6HYZq7ALcwE6niKkTx6jIZMSzKOVkPA8eFD_fWaAIOnZ4n9ScoKX1KXBkVPaYsPmLtLt4f3oMjK4ScWiQi88Bhqi_kjTvhzFGqoyRVgklEyxMfnW77v_7XEKZkxmLSHP0TPGQL7K2-Dj9Cmhr8-Z_9Sis9yAjO_gFr-osKvzgyQBvVwAxHscohl_lH_uL-sC4UaeMmDDDQJNxKxu2W4pf5FPSNFxVh0CY',
    isNew: true,
  },
  {
    id: 'velvet-anarkali-suit',
    name: 'Velvet Anarkali Suit',
    price: 68000,
    currency: 'INR',
    image:
      'https://lh3.googleusercontent.com/aida/AP1WRLvTwGGOeFz9ygHnUIU9uYOJkKQ_u2JwQqLfGMG4BNr9Hb-4rDzgAgJ3C3rSjFjIBIwk7jxLtfVO9kXgYbqAdIoKC0Ui4NQZ3zoebrXZI-pjbc00ljEgtWlzaE3jDXf0Z0a_BvNK7zsI0NThEE90AL15JwoI7KoTYmnmj84Ql5GXCITVvYw0Pkha6JFgpiSBTytl-j8JsIzL5Kk_bWCLHoICuPjv28-FYxRHvFUYucXaBvDeHYINst-sBEk',
    isNew: false,
  },
  {
    id: 'organza-saree-pearls',
    name: 'Organza Saree with Pearls',
    price: 55000,
    currency: 'INR',
    image:
      'https://lh3.googleusercontent.com/aida/AP1WRLvKYrLQJS0tj5uxvdy2urfImp5EDpxWxOn8t3lZtA5n588Gc9coq3MmMAqP6dTDmbCcwk6UCG-s39YJAq1L-nOSNZih0gw0DALLLgEKMm0tg0dpjamyjQ-FyR0AGElVc3FP5SKmag3XtUw2xyDR3CzBRKlYeWFgaRGp_jLMSQpZ_BY9JNeOSC1ZpBQnUntEPqst7-FQzAtXJy-S65AtPZC6UYdE6L2pJK0UenU3BrjdYVK7Wd3zEQqSvqc',
    isNew: false,
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

export const BRAND = {
  name: 'SAAN',
  tagline: 'Atmospheric Couture',
  logo:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAjPXk_P_f2H3IaLAgb8EeVjUQQQRSB-zwZFInKOkdanT1bpMP9gf6vEVmqJU3twbg62TlUeSsYlqfG9Czb-1bcKtESRjN7A67EpECgNeUKnfKGn6qwsOhnBC0xmoE6xrqcEcd4BrKsACED9G2sU0G6w9yMX9npPr57TI4cTnnpNyqabTm7dVzpMxPkcOYh_qniyq-kMZb7EEnMj9jnxOVHJiY0h6eiuS5ZwuxmdQpMkQr3pv-LaUpMoMC3GrKRG9Mojr5LpZteYGrb',
  heroImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCZ3T4FlcuEXuzIg31QvDCCN8VEKg2ugfXZxa37edfb2dQ6pG4J_pYenRmztPVoXKe0fEbiZblswEs6MfiQyXgXvzup3dUC4A3n-j4JyeWZLQXhvRA9kGhTx_OOQ7PDmC-g7GggHt1_2A1fnhNaSYtFlFFqxaM8U2Lr8ju_G7VM3DB6bh0zVKsaPH33O6-AHAcP48HijWas5lszvJ9XDZjbSg2lT9YjJpL5ToLgFgcHUc2HNNY832UIcq8IicF9ubHqrpUk6dqz7D8n',
  description:
    'Redefining heritage for the modern muse. Ethical craftsmanship meets timeless design.',
} as const;
