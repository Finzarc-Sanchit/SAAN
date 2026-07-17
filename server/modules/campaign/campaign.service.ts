import type { IProductRepository } from '../product/product.repository.interface';
import { NotFoundError } from '../../shared/errors/not-found-error';
import { ValidationError } from '../../shared/errors/validation-error';
import type { ICampaignRepository } from './campaign.repository.interface';
import type {
  ActiveCampaign,
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
} from './campaign.types';

import type { Product } from '../product/product.types';

function toActiveCampaign(campaign: Campaign, product: Pick<Product, 'slug'>): ActiveCampaign {
  return {
    id: campaign.id,
    productId: campaign.productId,
    productSlug: product.slug,
    desktopImage: {
      url: campaign.desktopImageUrl,
      alt: campaign.desktopImageAlt,
    },
    mobileImage: {
      url: campaign.mobileImageUrl,
      alt: campaign.mobileImageAlt,
    },
    startDate: campaign.startDate.toISOString(),
    endDate: campaign.endDate.toISOString(),
    priority: campaign.priority,
  };
}

export class CampaignService {
  constructor(
    private readonly campaignRepository: ICampaignRepository,
    private readonly productRepository: IProductRepository,
  ) {}

  async listCampaigns(): Promise<Campaign[]> {
    return this.campaignRepository.findMany();
  }

  async listActiveCampaigns(now = new Date()): Promise<ActiveCampaign[]> {
    const campaigns = await this.campaignRepository.findActive(now);
    if (campaigns.length === 0) {
      return [];
    }

    const productIds = [...new Set(campaigns.map((campaign) => campaign.productId))];
    const products = await this.productRepository.findByIds(productIds);
    const activeProductIds = new Set(
      products.filter((product) => product.status === 'active').map((product) => product.id),
    );

    const productById = new Map(products.map((product) => [product.id, product]));

    return campaigns
      .filter((campaign) => activeProductIds.has(campaign.productId))
      .map((campaign) => {
        const product = productById.get(campaign.productId);
        if (!product) {
          return null;
        }
        return toActiveCampaign(campaign, product);
      })
      .filter((campaign): campaign is ActiveCampaign => campaign !== null);
  }

  async getCampaignById(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }
    return campaign;
  }

  async createCampaign(input: CreateCampaignInput): Promise<Campaign> {
    await this.assertActiveProduct(input.productId);
    this.assertDateRange(input.startDate, input.endDate);

    return this.campaignRepository.create({
      ...input,
      active: input.active ?? true,
    });
  }

  async updateCampaign(id: string, input: UpdateCampaignInput): Promise<Campaign> {
    const existing = await this.getCampaignById(id);

    if (input.productId) {
      await this.assertActiveProduct(input.productId);
    }

    const startDate = input.startDate ?? existing.startDate;
    const endDate = input.endDate ?? existing.endDate;
    this.assertDateRange(startDate, endDate);

    return this.campaignRepository.update(id, input);
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.getCampaignById(id);
    await this.campaignRepository.delete(id);
  }

  private async assertActiveProduct(productId: string): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    if (product.status !== 'active') {
      throw new ValidationError('Campaign must link to an active product');
    }
  }

  private assertDateRange(startDate: Date, endDate: Date): void {
    if (endDate <= startDate) {
      throw new ValidationError('endDate must be after startDate');
    }
  }
}
