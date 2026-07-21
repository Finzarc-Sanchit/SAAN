export type SizeChartColumn = { key: string; label: string };
export type SizeChartRow = Record<string, string>;

export type SizeChart = {
  title: string;
  columns: SizeChartColumn[];
  rows: SizeChartRow[];
};

/** Canonical SAAN size charts — matches saanlabel.com / product size guide. */
export const SIZE_GUIDE_CHARTS: SizeChart[] = [
  {
    title: 'TOP SIZE CHART',
    columns: [
      { key: 'size', label: 'SIZE' },
      { key: 'chest', label: 'CHEST' },
      { key: 'choliRound', label: 'CHOLI ROUND' },
      { key: 'shoulder', label: 'SHOULDER' },
      { key: 'armhole', label: 'ARMHOLE' },
    ],
    rows: [
      { size: 'XS', chest: '34', choliRound: '28', shoulder: '14', armhole: '16' },
      { size: 'S', chest: '36', choliRound: '30', shoulder: '14.5', armhole: '17' },
      { size: 'M', chest: '38', choliRound: '32', shoulder: '15', armhole: '18' },
      { size: 'L', chest: '40', choliRound: '34', shoulder: '16', armhole: '19' },
      { size: 'XL', chest: '42', choliRound: '36', shoulder: '16.5', armhole: '20' },
      { size: 'XXL', chest: '44', choliRound: '38', shoulder: '17', armhole: '21' },
      { size: 'XXXL', chest: '46', choliRound: '40', shoulder: '17.5', armhole: '22' },
    ],
  },
  {
    title: 'BOTTOM SIZE CHART',
    columns: [
      { key: 'waist', label: 'WAIST' },
      { key: 'hips', label: 'HIPS' },
      { key: 'waistToFloor', label: 'WAIST TO FLOOR' },
    ],
    rows: [
      { waist: '28', hips: '38', waistToFloor: '41' },
      { waist: '30', hips: '40', waistToFloor: '41' },
      { waist: '32', hips: '42', waistToFloor: '41' },
      { waist: '34', hips: '44', waistToFloor: '41' },
      { waist: '36', hips: '46', waistToFloor: '41' },
      { waist: '38', hips: '48', waistToFloor: '41' },
      { waist: '40', hips: '50', waistToFloor: '41' },
    ],
  },
];

export const SIZE_GUIDE_COPY = {
  title: 'Size Guide',
  intro:
    'All measurements in inches. For made-to-measure, we will share a tailored guide after your order.',
  footer:
    'Between two sizes? We recommend the larger one for comfort. For made-to-measure, choose Made-to-measure at checkout.',
} as const;

export const SIZE_GUIDE_PAGE = {
  title: 'Size Guide',
  description: 'Reference measurements for SAAN tops and bottoms. All values are in inches.',
  charts: SIZE_GUIDE_CHARTS,
  note: SIZE_GUIDE_COPY.footer,
} as const;
