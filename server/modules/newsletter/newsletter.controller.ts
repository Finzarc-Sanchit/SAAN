import type { Request, Response } from 'express';
import { successResponse } from '../../shared/utils/response';
import type {
  NewsletterCampaignListQueryDto,
  NewsletterListQueryDto,
  SendNewsletterCampaignDto,
  SubscribeNewsletterDto,
  UpdateNewsletterStatusDto,
} from './newsletter.dto';
import type { NewsletterCampaignService } from './newsletter-campaign.service';
import type { NewsletterService } from './newsletter.service';

/** HTTP adapter for public and administrative newsletter operations. */
export class NewsletterController {
  constructor(
    private readonly newsletterService: NewsletterService,
    private readonly campaignService: NewsletterCampaignService,
  ) {}

  subscribe = async (req: Request, res: Response): Promise<void> => {
    await this.newsletterService.subscribe(req.body as SubscribeNewsletterDto);
    res.status(200).json(successResponse({ message: 'Thank you for subscribing.' }));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const { page, limit, status, search } = req.query as unknown as NewsletterListQueryDto;
    const result = await this.newsletterService.listSubscriptions(
      { status, search },
      { page, limit },
    );
    res.status(200).json(
      successResponse(result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      }),
    );
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const { status } = req.body as UpdateNewsletterStatusDto;
    const subscription = await this.newsletterService.updateStatus(id, status);
    res.status(200).json(successResponse(subscription));
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    await this.newsletterService.deleteSubscription(id);
    res.status(200).json(successResponse({ message: 'Newsletter subscription deleted' }));
  };

  sendCampaign = async (req: Request, res: Response): Promise<void> => {
    const campaign = await this.campaignService.send(
      req.user!.id,
      req.body as SendNewsletterCampaignDto,
    );
    res.status(202).json(successResponse(campaign));
  };

  listCampaigns = async (req: Request, res: Response): Promise<void> => {
    const { page, limit } =
      req.query as unknown as NewsletterCampaignListQueryDto;
    const result = await this.campaignService.list({ page, limit });
    res.status(200).json(
      successResponse(result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      }),
    );
  };
}
