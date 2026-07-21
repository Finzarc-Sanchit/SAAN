import type { Request, Response } from 'express';
import { successResponse } from '../../shared/utils/response';
import type { JournalService } from './journal.service';
import type {
  AdminJournalListQueryDto,
  PublicJournalListQueryDto,
} from './journal.dto';

export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  listPublished = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as PublicJournalListQueryDto;
    const result = await this.journalService.listPublished(
      {
        category: query.category,
        featured: query.featured,
      },
      { page: query.page, limit: query.limit },
    );
    res.status(200).json(
      successResponse(result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      }),
    );
  };

  getPublishedBySlug = async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params as { slug: string };
    const journal = await this.journalService.getPublishedBySlug(slug);
    res.status(200).json(successResponse(journal));
  };

  listJournals = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as AdminJournalListQueryDto;
    const result = await this.journalService.listJournals(
      {
        status: query.status,
        category: query.category,
        featured: query.featured,
        search: query.search,
      },
      { page: query.page, limit: query.limit },
    );
    res.status(200).json(
      successResponse(result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      }),
    );
  };

  getJournal = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const journal = await this.journalService.getJournalById(id);
    res.status(200).json(successResponse(journal));
  };

  createJournal = async (req: Request, res: Response): Promise<void> => {
    const journal = await this.journalService.createJournal(req.body);
    res.status(201).json(successResponse(journal));
  };

  updateJournal = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const journal = await this.journalService.updateJournal(id, req.body);
    res.status(200).json(successResponse(journal));
  };

  deleteJournal = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    await this.journalService.deleteJournal(id);
    res.status(200).json(successResponse({ message: 'Journal article deleted' }));
  };
}
