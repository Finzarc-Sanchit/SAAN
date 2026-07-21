import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NotFoundError } from '../../shared/errors/not-found-error';
import type { IJournalRepository } from './journal.repository.interface';
import { JournalService } from './journal.service';
import type { CreateJournalInput, Journal } from './journal.types';

const baseJournal: Journal = {
  id: 'journal-1',
  slug: 'ethnic-vs-traditional',
  title: 'Ethnic vs Traditional Wear: Decoding the Differences',
  excerpt:
    'How heritage silhouettes and contemporary ethnic dressing meet — and where they quietly diverge.',
  category: 'Style Guide',
  imageUrl: 'https://example.com/journal-cover.jpg',
  imageAlt: 'Editorial portrait in ethnic wear',
  blocks: [
    { type: 'paragraph', value: 'Heritage and contemporary dressing share more than they first appear.' },
  ],
  status: 'published',
  featured: false,
  readMinutes: 2,
  publishedAt: new Date('2026-03-12'),
  createdAt: new Date('2026-03-01'),
  updatedAt: new Date('2026-03-12'),
};

const createInput: CreateJournalInput = {
  title: baseJournal.title,
  excerpt: baseJournal.excerpt,
  category: baseJournal.category,
  imageUrl: baseJournal.imageUrl,
  imageAlt: baseJournal.imageAlt,
  blocks: baseJournal.blocks,
};

function createJournalRepositoryMock(): jest.Mocked<IJournalRepository> {
  return {
    findById: jest.fn(),
    findPublishedBySlug: jest.fn(),
    findPublished: jest.fn(),
    findMany: jest.fn(),
    slugExists: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    clearFeaturedExcept: jest.fn(),
    delete: jest.fn(),
  };
}

describe('JournalService', () => {
  let journalRepository: jest.Mocked<IJournalRepository>;
  let service: JournalService;

  beforeEach(() => {
    journalRepository = createJournalRepositoryMock();
    service = new JournalService(journalRepository);
  });

  it('returns published journals from the repository', async () => {
    journalRepository.findPublished.mockResolvedValue({
      items: [baseJournal],
      page: 1,
      limit: 20,
      total: 1,
    });

    await expect(
      service.listPublished({}, { page: 1, limit: 20 }),
    ).resolves.toEqual({
      items: [baseJournal],
      page: 1,
      limit: 20,
      total: 1,
    });
  });

  it('returns a published journal by slug', async () => {
    journalRepository.findPublishedBySlug.mockResolvedValue(baseJournal);

    await expect(service.getPublishedBySlug(baseJournal.slug)).resolves.toEqual(baseJournal);
  });

  it('hides missing or unpublished slugs behind a not-found error', async () => {
    journalRepository.findPublishedBySlug.mockResolvedValue(null);

    await expect(service.getPublishedBySlug('draft-story')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('creates a draft, non-featured journal by default with derived slug and read time', async () => {
    journalRepository.slugExists.mockResolvedValue(false);
    journalRepository.create.mockResolvedValue({
      ...baseJournal,
      status: 'draft',
      featured: false,
      publishedAt: null,
    });

    await service.createJournal(createInput);

    expect(journalRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: createInput.title,
        slug: 'ethnic-vs-traditional-wear-decoding-the-differences',
        status: 'draft',
        featured: false,
        publishedAt: null,
        readMinutes: expect.any(Number),
      }),
    );
    expect(journalRepository.clearFeaturedExcept).not.toHaveBeenCalled();
  });

  it('sets publishedAt and clears other featured posts when publishing as featured', async () => {
    journalRepository.slugExists.mockResolvedValue(false);
    journalRepository.create.mockResolvedValue({
      ...baseJournal,
      featured: true,
    });
    journalRepository.clearFeaturedExcept.mockResolvedValue();

    await service.createJournal({
      ...createInput,
      status: 'published',
      featured: true,
    });

    expect(journalRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'published',
        featured: true,
        publishedAt: expect.any(Date),
      }),
    );
    expect(journalRepository.clearFeaturedExcept).toHaveBeenCalledWith(baseJournal.id);
  });

  it('forces featured off when moving a journal out of published', async () => {
    journalRepository.findById.mockResolvedValue({
      ...baseJournal,
      featured: true,
    });
    journalRepository.update.mockResolvedValue({
      ...baseJournal,
      status: 'draft',
      featured: false,
      publishedAt: null,
    });

    await service.updateJournal(baseJournal.id, { status: 'draft' });

    expect(journalRepository.update).toHaveBeenCalledWith(
      baseJournal.id,
      expect.objectContaining({
        status: 'draft',
        featured: false,
        publishedAt: null,
      }),
    );
  });

  it('generates unique slugs when creating journals', async () => {
    journalRepository.slugExists
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    journalRepository.create.mockResolvedValue({
      ...baseJournal,
      slug: 'ethnic-vs-traditional-wear-decoding-the-differences-2',
    });

    await service.createJournal(createInput);

    expect(journalRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'ethnic-vs-traditional-wear-decoding-the-differences-2',
      }),
    );
  });

  it('deletes an existing journal', async () => {
    journalRepository.findById.mockResolvedValue(baseJournal);
    journalRepository.delete.mockResolvedValue();

    await service.deleteJournal(baseJournal.id);

    expect(journalRepository.delete).toHaveBeenCalledWith(baseJournal.id);
  });

  it('throws when deleting a missing journal', async () => {
    journalRepository.findById.mockResolvedValue(null);

    await expect(service.deleteJournal('missing')).rejects.toBeInstanceOf(NotFoundError);
    expect(journalRepository.delete).not.toHaveBeenCalled();
  });
});
