export type SizeGuideRow = {
  size: string;
  bust: string;
  waist: string;
  hip: string;
};

export const SIZE_GUIDE_ROWS: SizeGuideRow[] = [
  { size: 'XS', bust: '32"', waist: '26"', hip: '35"' },
  { size: 'S', bust: '34"', waist: '28"', hip: '37"' },
  { size: 'M', bust: '36"', waist: '30"', hip: '39"' },
  { size: 'L', bust: '38"', waist: '32"', hip: '41"' },
  { size: 'XL', bust: '40"', waist: '34"', hip: '43"' },
  { size: 'XXL', bust: '42"', waist: '36"', hip: '45"' },
];

export const SIZE_GUIDE_COPY = {
  title: 'Size guide',
  intro:
    'All measurements in inches. For made-to-measure, we\'ll send a tailored guide on WhatsApp.',
  footer:
    'Between two sizes? We recommend the larger one for comfort. If you\'d like to alter the fit, choose Made-to-measure at checkout.',
} as const;
