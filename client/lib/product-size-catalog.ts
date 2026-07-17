import type { GarmentSize } from '@/lib/types/size';

export function findSizeIdByLabel(
  catalog: GarmentSize[],
  label: string,
): string | undefined {
  return catalog.find((entry) => entry.label === label)?.sizeId;
}

export function findSizeLabelById(
  catalog: GarmentSize[],
  sizeId: string,
): string | undefined {
  return catalog.find((entry) => entry.sizeId === sizeId)?.label;
}
