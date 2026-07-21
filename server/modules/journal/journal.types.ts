export const JOURNAL_STATUSES = ['draft', 'published', 'archived'] as const;
export type JournalStatus = (typeof JOURNAL_STATUSES)[number];

export const JOURNAL_CATEGORIES = [
  'Style Guide',
  "Editor's Picks",
  'Behind the Seams',
  'Lookbook',
] as const;
export type JournalCategory = (typeof JOURNAL_CATEGORIES)[number];

export const JOURNAL_BLOCK_TYPES = ['paragraph', 'heading', 'image', 'blockquote'] as const;
export type JournalBlockType = (typeof JOURNAL_BLOCK_TYPES)[number];

export type JournalContentBlock = {
  type: JournalBlockType;
  value?: string;
  level?: 2 | 3;
  src?: string;
  alt?: string;
  caption?: string;
};

export interface Journal {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: JournalCategory;
  imageUrl: string;
  imageAlt: string;
  blocks: JournalContentBlock[];
  status: JournalStatus;
  featured: boolean;
  readMinutes: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateJournalInput = {
  title: string;
  excerpt: string;
  category: JournalCategory;
  imageUrl: string;
  imageAlt: string;
  blocks?: JournalContentBlock[];
  status?: JournalStatus;
  featured?: boolean;
  readMinutes?: number;
  publishedAt?: Date | null;
};

export type UpdateJournalInput = Partial<CreateJournalInput>;

export type JournalRepositoryCreateInput = CreateJournalInput & {
  slug: string;
  blocks: JournalContentBlock[];
  status: JournalStatus;
  featured: boolean;
  readMinutes: number;
  publishedAt: Date | null;
};

export type JournalRepositoryUpdateInput = Partial<{
  title: string;
  slug: string;
  excerpt: string;
  category: JournalCategory;
  imageUrl: string;
  imageAlt: string;
  blocks: JournalContentBlock[];
  status: JournalStatus;
  featured: boolean;
  readMinutes: number;
  publishedAt: Date | null;
}>;

export type JournalListFilter = {
  status?: JournalStatus;
  category?: JournalCategory;
  featured?: boolean;
  search?: string;
};

export type PublicJournalListFilter = {
  category?: JournalCategory;
  featured?: boolean;
};
