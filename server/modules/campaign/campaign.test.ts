import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NotFoundError } from '../../shared/errors/not-found-error';
import { ValidationError } from '../../shared/errors/validation-error';
import type { IProductRepository } from '../product/product.repository.interface';
import type { Product } from '../product/product.types';
import type { ICampaignRepository } from './campaign.repository.interface';
import { CampaignService } from './campaign.service';
import type { Campaign } from './campaign.types';

const baseProduct: Product = {
  id: 'product-1',
  categoryId: 'cat-1',
  discountId: null,
  name: 'Linen Shirt',
  slug: 'linen-shirt',
  description: 'A linen shirt',
  shortDescription: 'Linen shirt',
  fabric: 'Linen',
  basePrice: 5000,
  ratingsAverage: 0,
  ratingsCount: 0,
  stock: 10,
  status: 'active',
  isFeatured: false,
  isNewArrival: true,
  isBestSeller: false,
  sizes: [],
  images: [
    {
      imageId: 'image-1',
      imageUrl: 'https://example.com/shirt.jpg',
      sortOrder: 0,
    },
  ],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const baseCampaign: Campaign = {
  id: 'campaign-1',
  tag: 'NEW ARRIVAL',
  title: 'Quiet Luxury Edit',
  description: 'A seasonal story',
  productId: 'product-1',
  imageUrl: 'https://res.cloudinary.com/demo/image/upload/c.jpg',
  imageAlt: 'Model in SAAN linen',
  discountPercent: 20,
  ctaText: 'Shop now',
  startDate: new Date('2020-01-01'),
  endDate: new Date('2030-01-01'),
  priority: 0,
  active: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function createCampaignRepositoryMock(): jest.Mocked<ICampaignRepository> {
  return {
    findById: jest.fn(),
    findMany: jest.fn(),
    findActive: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

function createProductRepositoryMock(): jest.Mocked<IProductRepository> {
  return {
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    adjustSizeStock: jest.fn(),
    findByIds: jest.fn(),
    slugExists: jest.fn(),
    updateRatings: jest.fn(),
  };
}

describe('CampaignService', () => {
  let campaignRepository: jest.Mocked<ICampaignRepository>;
  let productRepository: jest.Mocked<IProductRepository>;
  let service: CampaignService;

  beforeEach(() => {
    campaignRepository = createCampaignRepositoryMock();
    productRepository = createProductRepositoryMock();
    service = new CampaignService(campaignRepository, productRepository);
  });

  describe('listActiveCampaigns', () => {
    it('returns storefront campaigns for active products only', async () => {
      campaignRepository.findActive.mockResolvedValue([
        baseCampaign,
        { ...baseCampaign, id: 'campaign-2', productId: 'product-archived' },
      ]);
      productRepository.findByIds.mockResolvedValue([
        baseProduct,
        { ...baseProduct, id: 'product-archived', status: 'archived' },
      ]);

      const result = await service.listActiveCampaigns(new Date('2026-06-01'));

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'campaign-1',
        productId: 'product-1',
        cta: { label: 'Shop now', href: '/shop/product-1' },
        image: {
          url: baseCampaign.imageUrl,
          alt: baseCampaign.imageAlt,
        },
      });
    });
  });

  describe('createCampaign', () => {
    it('creates when product is active', async () => {
      productRepository.findById.mockResolvedValue(baseProduct);
      campaignRepository.create.mockResolvedValue(baseCampaign);

      const result = await service.createCampaign({
        tag: baseCampaign.tag,
        title: baseCampaign.title,
        description: baseCampaign.description,
        productId: 'product-1',
        imageUrl: baseCampaign.imageUrl,
        imageAlt: baseCampaign.imageAlt,
        discountPercent: 20,
        ctaText: 'Shop now',
        startDate: baseCampaign.startDate,
        endDate: baseCampaign.endDate,
        priority: 0,
      });

      expect(result.id).toBe('campaign-1');
      expect(campaignRepository.create).toHaveBeenCalled();
    });

    it('rejects missing product', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(
        service.createCampaign({
          tag: 'X',
          title: 'Y',
          description: 'Z',
          productId: 'missing',
          imageUrl: 'https://example.com/a.jpg',
          imageAlt: 'alt',
          ctaText: 'Go',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-01'),
          priority: 0,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it('rejects inactive product', async () => {
      productRepository.findById.mockResolvedValue({ ...baseProduct, status: 'draft' });

      await expect(
        service.createCampaign({
          tag: 'X',
          title: 'Y',
          description: 'Z',
          productId: 'product-1',
          imageUrl: 'https://example.com/a.jpg',
          imageAlt: 'alt',
          ctaText: 'Go',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-01'),
          priority: 0,
        }),
      ).rejects.toThrow(ValidationError);
    });
  });
});
