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

function toActiveCampaign(campaign: Campaign, productId: string): ActiveCampaign {
  return {
    id: campaign.id,
    tag: campaign.tag,
    title: campaign.title,
    description: campaign.description,
    productId,
    image: {
      url: campaign.imageUrl,
      alt: campaign.imageAlt,
    },
    discountPercent: campaign.discountPercent,
    cta: {
      label: campaign.ctaText,
      href: `/shop/${productId}`,
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

    return campaigns
      .filter((campaign) => activeProductIds.has(campaign.productId))
      .map((campaign) => toActiveCampaign(campaign, campaign.productId));
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
      discountPercent: input.discountPercent ?? null,
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
      throw new ValidationError('Campaign product must be an active product', [
        { field: 'productId', message: 'Product must have status "active"' },
      ]);
    }
  }

  private assertDateRange(startDate: Date, endDate: Date): void {
    if (endDate <= startDate) {
      throw new ValidationError('endDate must be after startDate', [
        { field: 'endDate', message: 'endDate must be after startDate' },
      ]);
    }
  }
}
