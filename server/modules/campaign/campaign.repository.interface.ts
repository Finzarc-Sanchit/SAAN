import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
} from './campaign.types';

export interface ICampaignRepository {
  findById(id: string): Promise<Campaign | null>;
  findMany(): Promise<Campaign[]>;
  findActive(now: Date): Promise<Campaign[]>;
  create(data: CreateCampaignInput): Promise<Campaign>;
  update(id: string, data: UpdateCampaignInput): Promise<Campaign>;
  delete(id: string): Promise<void>;
}
