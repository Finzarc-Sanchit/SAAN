export const COLLECTION_STATUSES = ['draft', 'published'] as const;

export type CollectionStatus = (typeof COLLECTION_STATUSES)[number];

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string;
  tagline: string;
  imageUrl: string;
  imageAlt: string;
  status: CollectionStatus;
  sortOrder: number;
  featured: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCollectionInput = {
  title: string;
  description: string;
  tagline: string;
  imageUrl: string;
  imageAlt: string;
  status?: CollectionStatus;
  sortOrder: number;
  featured?: boolean;
};

export type UpdateCollectionInput = Partial<CreateCollectionInput>;

export type CollectionRepositoryCreateInput = CreateCollectionInput & {
  slug: string;
};

export type CollectionRepositoryUpdateInput = UpdateCollectionInput & {
  slug?: string;
};
