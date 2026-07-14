export type UploadedImage = {
  url: string;
  publicId: string;
  mimeType: string;
  bytes: number;
  width?: number;
  height?: number;
};

export type UploadImagesResponse = {
  images: UploadedImage[];
};
