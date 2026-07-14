export type UploadFileInput = {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
};

export type StoredObject = {
  url: string;
  publicId: string;
  mimeType: string;
  bytes: number;
  width?: number;
  height?: number;
};

export type StorageUploadOptions = {
  folder?: string;
};

export interface IStorageService {
  upload(file: UploadFileInput, options?: StorageUploadOptions): Promise<StoredObject>;
  uploadMany(files: UploadFileInput[], options?: StorageUploadOptions): Promise<StoredObject[]>;
  delete(publicId: string): Promise<void>;
}
