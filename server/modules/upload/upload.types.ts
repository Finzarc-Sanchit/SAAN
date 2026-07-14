import type { StoredObject } from '../../infrastructure/storage/storage.interface';

export type UploadedImage = {
  url: string;
  publicId: string;
  mimeType: string;
  bytes: number;
  width?: number;
  height?: number;
};

export type UploadImagesResult = {
  images: UploadedImage[];
};

export function toUploadedImage(stored: StoredObject): UploadedImage {
  return {
    url: stored.url,
    publicId: stored.publicId,
    mimeType: stored.mimeType,
    bytes: stored.bytes,
    width: stored.width,
    height: stored.height,
  };
}
