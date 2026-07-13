export interface GarmentSize {
  id: string;
  sizeId: string;
  label: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSizeInput {
  label: string;
  sortOrder?: number;
}

export interface UpdateSizeInput {
  label?: string;
  sortOrder?: number;
}
