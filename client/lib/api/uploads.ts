import type { ApiResponse } from '@/lib/types/api';
import type { UploadImagesResponse, UploadedImage } from '@/lib/types/upload';
import { API_BASE_PATH } from '@/lib/api/config';
import { ApiError } from '@/lib/api/errors';
import { getAccessToken } from '@/lib/auth/token-store';

const UPLOADS_BASE = '/api/v1/uploads';

/** Client → API upload maps to 0–40%. */
const SEND_WEIGHT = 40;
/** Slow uploads creep toward 90% while waiting for the server. */
const PROCESSING_MAX = 90;
const PROCESSING_TICK_MS = 220;
/** Min time to animate the bar to 100% after the URL is ready. */
const COMPLETE_ANIM_MS_MIN = 280;
const COMPLETE_ANIM_MS_MAX = 520;
/** Brief pause at 100% before the caller adds the image. */
const COMPLETE_HOLD_MS = 320;

export type UploadProgressUpdate = {
  percent: number;
  phase: 'sending' | 'processing' | 'complete';
};

/**
 * Uploads one or more images (admin). Returns Cloudinary URLs for product.images[].
 * Multipart field name must be `files`.
 */
export async function uploadImages(files: File[]): Promise<UploadImagesResponse> {
  if (files.length === 0) {
    throw new ApiError('VALIDATION_ERROR', 'At least one image file is required', []);
  }

  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  const headers = new Headers();
  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_PATH}${UPLOADS_BASE}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers,
    body: formData,
  });

  const json = (await response.json()) as ApiResponse<UploadImagesResponse>;

  if (!json.success) {
    throw new ApiError(json.error.code, json.error.message, json.error.details);
  }

  return json.data;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** Upload a single image; animates smoothly to 100% before resolving with the URL. */
export function uploadImageWithProgress(
  file: File,
  onProgress: (update: UploadProgressUpdate) => void,
): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('files', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_PATH}${UPLOADS_BASE}`);
    xhr.withCredentials = true;

    const token = getAccessToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    let displayPercent = 0;
    let processingTimer: number | null = null;
    let completeFrame: number | null = null;
    let completeHoldTimer: number | null = null;
    let settled = false;

    function cleanup() {
      if (processingTimer) {
        clearInterval(processingTimer);
        processingTimer = null;
      }
      if (completeFrame !== null) {
        cancelAnimationFrame(completeFrame);
        completeFrame = null;
      }
      if (completeHoldTimer) {
        clearTimeout(completeHoldTimer);
        completeHoldTimer = null;
      }
    }

    function emit(percent: number, phase: UploadProgressUpdate['phase']) {
      if (settled && phase !== 'complete') return;
      const next =
        phase === 'complete'
          ? 100
          : Math.min(PROCESSING_MAX, Math.max(displayPercent, Math.round(percent)));
      displayPercent = next;
      onProgress({ percent: next, phase });
    }

    function startProcessingPhase() {
      emit(Math.max(displayPercent, SEND_WEIGHT), 'processing');

      if (processingTimer) return;

      processingTimer = window.setInterval(() => {
        if (displayPercent >= PROCESSING_MAX) return;
        emit(displayPercent + 1, 'processing');
      }, PROCESSING_TICK_MS);
    }

    function finishUpload(image: UploadedImage) {
      if (settled) return;
      settled = true;
      cleanup();

      const start = displayPercent;
      const duration = Math.max(
        COMPLETE_ANIM_MS_MIN,
        Math.min(COMPLETE_ANIM_MS_MAX, (100 - start) * 7),
      );
      const animStart = performance.now();

      function animate(now: number) {
        const t = Math.min(1, (now - animStart) / duration);
        const percent = Math.round(start + (100 - start) * easeOutCubic(t));
        displayPercent = percent;
        onProgress({
          percent,
          phase: t >= 1 ? 'complete' : 'processing',
        });

        if (t < 1) {
          completeFrame = requestAnimationFrame(animate);
          return;
        }

        onProgress({ percent: 100, phase: 'complete' });
        completeHoldTimer = window.setTimeout(() => resolve(image), COMPLETE_HOLD_MS);
      }

      completeFrame = requestAnimationFrame(animate);
    }

    function fail(error: ApiError) {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    }

    xhr.upload.addEventListener('loadstart', () => {
      emit(1, 'sending');
    });

    xhr.upload.addEventListener('progress', (event) => {
      if (!event.lengthComputable || event.total <= 0) return;
      const sendRatio = event.loaded / event.total;
      const sendPercent = sendRatio * SEND_WEIGHT;
      emit(Math.min(SEND_WEIGHT, sendPercent), 'sending');

      if (sendRatio >= 1) {
        startProcessingPhase();
      }
    });

    xhr.upload.addEventListener('load', () => {
      startProcessingPhase();
    });

    xhr.addEventListener('load', () => {
      try {
        const json = JSON.parse(xhr.responseText) as ApiResponse<UploadImagesResponse>;
        if (!json.success) {
          fail(new ApiError(json.error.code, json.error.message, json.error.details));
          return;
        }
        const image = json.data.images[0];
        if (!image) {
          fail(new ApiError('INTERNAL_SERVER_ERROR', 'Upload returned no image', []));
          return;
        }
        finishUpload(image);
      } catch {
        fail(new ApiError('INTERNAL_SERVER_ERROR', 'Could not parse upload response', []));
      }
    });

    xhr.addEventListener('error', () => {
      fail(new ApiError('INTERNAL_SERVER_ERROR', 'Upload failed', []));
    });

    xhr.addEventListener('abort', () => {
      fail(new ApiError('INTERNAL_SERVER_ERROR', 'Upload cancelled', []));
    });

    xhr.send(formData);
  });
}

/** Map upload results into the product create/update images shape. */
export function toProductImageInputs(
  images: UploadImagesResponse['images'],
): Array<{ imageUrl: string; sortOrder: number }> {
  return images.map((image, index) => ({
    imageUrl: image.url,
    sortOrder: index,
  }));
}
