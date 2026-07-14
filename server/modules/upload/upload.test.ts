import type { IStorageService } from '../../infrastructure/storage/storage.interface';
import { UPLOAD } from '../../shared/constants';
import { ValidationError } from '../../shared/errors/validation-error';
import { UploadService } from './upload.service';

describe('UploadService.uploadImages', () => {
  let storageService: jest.Mocked<IStorageService>;
  let service: UploadService;

  beforeEach(() => {
    storageService = {
      upload: jest.fn(),
      uploadMany: jest.fn(),
      delete: jest.fn(),
    };
    service = new UploadService(storageService);
  });

  it('uploads multiple images and returns urls', async () => {
    storageService.uploadMany.mockResolvedValue([
      {
        url: 'https://res.cloudinary.com/demo/image/upload/v1/a.jpg',
        publicId: 'saan/products/a',
        mimeType: 'image/jpeg',
        bytes: 1200,
        width: 800,
        height: 1000,
      },
      {
        url: 'https://res.cloudinary.com/demo/image/upload/v1/b.png',
        publicId: 'saan/products/b',
        mimeType: 'image/png',
        bytes: 2200,
        width: 900,
        height: 1100,
      },
    ]);

    const result = await service.uploadImages([
      {
        buffer: Buffer.from('jpeg-bytes'),
        mimeType: 'image/jpeg',
        originalName: 'a.jpg',
      },
      {
        buffer: Buffer.from('png-bytes'),
        mimeType: 'image/png',
        originalName: 'b.png',
      },
    ]);

    expect(storageService.uploadMany).toHaveBeenCalledWith(
      [
        {
          buffer: Buffer.from('jpeg-bytes'),
          mimeType: 'image/jpeg',
          originalName: 'a.jpg',
        },
        {
          buffer: Buffer.from('png-bytes'),
          mimeType: 'image/png',
          originalName: 'b.png',
        },
      ],
      { folder: UPLOAD.DEFAULT_FOLDER },
    );
    expect(result.images).toHaveLength(2);
    expect(result.images[0]?.url).toContain('cloudinary.com');
  });

  it('rejects empty file list', async () => {
    await expect(service.uploadImages([])).rejects.toThrow(ValidationError);
    expect(storageService.uploadMany).not.toHaveBeenCalled();
  });

  it('rejects unsupported mime types', async () => {
    await expect(
      service.uploadImages([
        {
          buffer: Buffer.from('gif'),
          mimeType: 'image/gif',
          originalName: 'x.gif',
        },
      ]),
    ).rejects.toThrow(ValidationError);
    expect(storageService.uploadMany).not.toHaveBeenCalled();
  });

  it('rejects too many files', async () => {
    const files = Array.from({ length: UPLOAD.MAX_FILES + 1 }, (_, index) => ({
      buffer: Buffer.from(`file-${index}`),
      mimeType: 'image/jpeg',
      originalName: `file-${index}.jpg`,
    }));

    await expect(service.uploadImages(files)).rejects.toThrow(ValidationError);
    expect(storageService.uploadMany).not.toHaveBeenCalled();
  });
});
