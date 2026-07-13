import type { CreateSizeInput, GarmentSize, UpdateSizeInput } from './size.types';

export interface ISizeRepository {
  findById(id: string): Promise<GarmentSize | null>;
  findBySizeId(sizeId: string): Promise<GarmentSize | null>;
  findByLabel(label: string): Promise<GarmentSize | null>;
  findMany(): Promise<GarmentSize[]>;
  findBySizeIds(sizeIds: string[]): Promise<GarmentSize[]>;
  create(data: CreateSizeInput & { sizeId: string }): Promise<GarmentSize>;
  update(id: string, data: UpdateSizeInput): Promise<GarmentSize>;
  delete(id: string): Promise<void>;
  sizeIdExists(sizeId: string): Promise<boolean>;
  labelExists(label: string, excludeId?: string): Promise<boolean>;
  isSizeInUse(sizeId: string): Promise<boolean>;
}
