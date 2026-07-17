import type { Request, Response } from 'express';
import { successResponse } from '../../shared/utils/response';
import type { CollectionService } from './collection.service';

export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  listPublishedCollections = async (_req: Request, res: Response): Promise<void> => {
    const collections = await this.collectionService.listPublishedCollections();
    res.status(200).json(successResponse(collections));
  };

  getPublishedCollection = async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params as { slug: string };
    const collection = await this.collectionService.getPublishedCollectionBySlug(slug);
    res.status(200).json(successResponse(collection));
  };

  listCollections = async (_req: Request, res: Response): Promise<void> => {
    const collections = await this.collectionService.listCollections();
    res.status(200).json(successResponse(collections));
  };

  getCollection = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const collection = await this.collectionService.getCollectionById(id);
    res.status(200).json(successResponse(collection));
  };

  createCollection = async (req: Request, res: Response): Promise<void> => {
    const collection = await this.collectionService.createCollection(req.body);
    res.status(201).json(successResponse(collection));
  };

  updateCollection = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const collection = await this.collectionService.updateCollection(id, req.body);
    res.status(200).json(successResponse(collection));
  };

  deleteCollection = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    await this.collectionService.deleteCollection(id);
    res.status(200).json(successResponse({ message: 'Collection deleted' }));
  };
}
