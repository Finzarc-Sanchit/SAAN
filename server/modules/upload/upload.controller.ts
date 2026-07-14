import type { Request, Response } from 'express';
import type { UploadFileInput } from '../../infrastructure/storage/storage.interface';
import { successResponse } from '../../shared/utils/response';
import type { UploadService } from './upload.service';

function toUploadInputs(files: Express.Multer.File[]): UploadFileInput[] {
  return files.map((file) => ({
    buffer: file.buffer,
    mimeType: file.mimetype,
    originalName: file.originalname,
  }));
}

export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  uploadImages = async (req: Request, res: Response): Promise<void> => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const result = await this.uploadService.uploadImages(toUploadInputs(files));
    res.status(201).json(successResponse(result));
  };
}
