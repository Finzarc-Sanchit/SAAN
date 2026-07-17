import type { Request, Response } from 'express';
import { successResponse } from '../../shared/utils/response';
import type { ContactListQueryDto, CreateContactDto, UpdateContactStatusDto } from './contact.dto';
import type { ContactService } from './contact.service';

/** HTTP adapter for public and administrative contact operations. */
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const contact = await this.contactService.createContact(req.body as CreateContactDto);
    res.status(201).json(successResponse(contact));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const { page, limit, status, search } = req.query as unknown as ContactListQueryDto;
    const result = await this.contactService.listContacts({ status, search }, { page, limit });

    res.status(200).json(
      successResponse(result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      }),
    );
  };

  get = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const contact = await this.contactService.getContact(id);
    res.status(200).json(successResponse(contact));
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const { status } = req.body as UpdateContactStatusDto;
    const contact = await this.contactService.updateStatus(id, status);
    res.status(200).json(successResponse(contact));
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    await this.contactService.deleteContact(id);
    res.status(200).json(successResponse({ message: 'Contact submission deleted' }));
  };
}
