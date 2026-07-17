'use client';

import { GripVertical, ImagePlus, Trash2, Upload } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminFieldError } from '@/components/admin/ui/AdminFormField';
import { AdminProductThumb } from '@/components/admin/ui/AdminProductThumb';
import { uploadImageWithProgress } from '@/lib/api/uploads';
import { ApiError, getApiErrorMessage, getUploadFieldError } from '@/lib/api/errors';
import type { ProductImageInput } from '@/lib/types/product';
import { cn } from '@/lib/utils';

type UploadSlot = {
  id: string;
  fileName: string;
  progress: number;
  phase: 'sending' | 'processing' | 'complete';
  error?: string;
};

function uploadStatusLabel(phase: UploadSlot['phase'], progress: number): string {
  if (phase === 'complete') return 'Done';
  if (phase === 'processing') return `Uploading… ${progress}%`;
  return `Sending… ${progress}%`;
}

type ProductImageUploaderProps = {
  value: ProductImageInput[];
  onChange: (value: ProductImageInput[]) => void;
  error?: string;
  disabled?: boolean;
  /** When set, caps how many images can be stored (e.g. `1` for campaign hero). */
  maxImages?: number;
  title?: string;
  description?: string;
};

function reorderWithSortOrder(images: ProductImageInput[]): ProductImageInput[] {
  return images.map((image, index) => ({ ...image, sortOrder: index }));
}

export function ProductImageUploader({
  value,
  onChange,
  error,
  disabled,
  maxImages,
  title = 'Images',
  description = 'JPEG, PNG, or WebP up to 5MB. Drag to reorder. At least one required.',
}: ProductImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggingOver, setDraggingOver] = useState(false);
  const [uploads, setUploads] = useState<UploadSlot[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const atMaxImages = maxImages !== undefined && maxImages > 1 && value.length >= maxImages;

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0 || disabled) return;

    const remainingSlots =
      maxImages === undefined ? files.length : Math.max(0, maxImages - value.length);
    const filesToUpload =
      maxImages === 1 ? files.slice(0, 1) : files.slice(0, remainingSlots || files.length);

    if (filesToUpload.length === 0) return;

    for (const file of filesToUpload) {
      const slotId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      setUploads((prev) => [
        ...prev,
        { id: slotId, fileName: file.name, progress: 0, phase: 'sending' },
      ]);

      try {
        const uploaded = await uploadImageWithProgress(file, (update) => {
          setUploads((prev) =>
            prev.map((slot) =>
              slot.id === slotId
                ? { ...slot, progress: update.percent, phase: update.phase, error: undefined }
                : slot,
            ),
          );
        });

        onChange(
          reorderWithSortOrder(
            maxImages === 1
              ? [{ imageUrl: uploaded.url, sortOrder: 0 }]
              : [...value, { imageUrl: uploaded.url, sortOrder: value.length }],
          ),
        );

        setUploads((prev) => prev.filter((slot) => slot.id !== slotId));
      } catch (err) {
        const message =
          err instanceof ApiError
            ? getUploadFieldError(err) ?? getApiErrorMessage(err)
            : 'Could not upload this image. Try again.';
        setUploads((prev) =>
          prev.map((slot) =>
            slot.id === slotId
              ? { ...slot, progress: 0, phase: 'sending', error: message }
              : slot,
          ),
        );
      }
    }
  }

  function removeImage(index: number) {
    onChange(reorderWithSortOrder(value.filter((_, i) => i !== index)));
  }

  function onDropReorder(toIndex: number) {
    if (dragIndex === null || dragIndex === toIndex) {
      setDragIndex(null);
      return;
    }
    const next = [...value];
    const [moved] = next.splice(dragIndex, 1);
    if (!moved) {
      setDragIndex(null);
      return;
    }
    next.splice(toIndex, 0, moved);
    onChange(reorderWithSortOrder(next));
    setDragIndex(null);
  }

  return (
    <div
      className={cn(
        'space-y-3',
        error && 'rounded-xl border border-red-200 bg-red-50/40 p-3 dark:border-red-500/25 dark:bg-red-950/15',
      )}
    >
      <div>
        <h3
          className={cn(
            'font-display text-lg text-saan-charcoal dark:text-paper',
            error && 'text-red-700 dark:text-red-300',
          )}
        >
          {title}
        </h3>
        <p className="mt-1 font-body text-xs text-saan-ink/50 dark:text-paper/50">
          {description}
        </p>
      </div>

      {!atMaxImages ? (
        <label
          htmlFor={inputId}
          onDragEnter={(e) => {
            e.preventDefault();
            setDraggingOver(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setDraggingOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDraggingOver(false);
            void handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 transition-colors',
            draggingOver
              ? 'border-saan-maroon bg-saan-maroon/5 dark:border-ink dark:bg-ink/10'
              : error
                ? 'border-red-500 bg-red-50/60 dark:border-red-400 dark:bg-red-950/20'
                : 'border-saan-champagne/70 bg-paper/40 dark:border-white/15 dark:bg-white/5',
            disabled && 'pointer-events-none opacity-50',
          )}
        >
          <Upload className="h-5 w-5 text-ink dark:text-ink" strokeWidth={1.5} />
          <span className="font-body text-sm text-saan-charcoal dark:text-paper">
            {maxImages === 1 ? 'Drop an image here or click to browse' : 'Drop images here or click to browse'}
          </span>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={maxImages === undefined || maxImages > 1}
            className="sr-only"
            disabled={disabled}
            onChange={(e) => {
              if (e.target.files) void handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
      ) : null}

      {uploads.length > 0 ? (
        <ul className="space-y-2">
          {uploads.map((slot) => (
            <li
              key={slot.id}
              className={cn(
                'rounded-lg border px-3 py-2',
                slot.error
                  ? 'border-red-300 bg-red-50/60 dark:border-red-500/30 dark:bg-red-950/20'
                  : 'border-saan-champagne/50 dark:border-white/10',
              )}
            >
              <div className="flex items-center justify-between gap-2 font-body text-xs">
                <span className="truncate">{slot.fileName}</span>
                {slot.error ? (
                  <button
                    type="button"
                    className="font-medium text-red-700 underline dark:text-red-300"
                    onClick={() =>
                      setUploads((prev) => prev.filter((item) => item.id !== slot.id))
                    }
                  >
                    Dismiss
                  </button>
                ) : (
                  <span className="tabular-nums">{uploadStatusLabel(slot.phase, slot.progress)}</span>
                )}
              </div>
              {!slot.error ? (
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-saan-champagne/40 dark:bg-white/10">
                  <div
                    className="h-full bg-saan-maroon motion-reduce:transition-none dark:bg-ink"
                    style={{
                      width: `${slot.progress}%`,
                      transition: 'width 320ms cubic-bezier(0.25, 1, 0.5, 1)',
                    }}
                  />
                </div>
              ) : (
                <p className="mt-1 text-xs font-medium text-red-700 dark:text-red-300" role="alert">
                  {slot.error}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {value.length > 0 ? (
        <ul
          className={cn(
            'grid gap-3',
            maxImages === 1 ? 'max-w-xs' : 'sm:grid-cols-2 lg:grid-cols-3',
          )}
        >
          {value.map((image, index) => (
            <li
              key={`${image.imageUrl}-${index}`}
              draggable={!disabled && maxImages !== 1}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDropReorder(index)}
              className="group relative overflow-hidden rounded-xl border border-saan-champagne/50 bg-white dark:border-white/10 dark:bg-[#121412]"
            >
              <AdminProductThumb
                src={image.imageUrl}
                alt={`Product image ${index + 1}`}
                className="aspect-[3/4] w-full"
              />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent p-2">
                {maxImages === 1 ? (
                  <span className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-white">
                    Hero
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-white">
                    <GripVertical className="h-3 w-3" />
                    {index + 1}
                  </span>
                )}
                <AdminButton
                  type="button"
                  variant="danger"
                  className="bg-white/90 px-2 py-1 text-xs dark:bg-black/50"
                  onClick={() => removeImage(index)}
                  disabled={disabled}
                  aria-label={`Remove image ${index + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </AdminButton>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center gap-2 font-body text-xs text-saan-ink/45 dark:text-paper/45">
          <ImagePlus className="h-4 w-4" />
          No images yet
        </div>
      )}

      <AdminFieldError error={error} />
    </div>
  );
}
