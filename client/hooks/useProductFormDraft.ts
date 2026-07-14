'use client';

import { useEffect, useRef, useState } from 'react';
import {
  clearProductFormDraft,
  readProductFormDraft,
  writeProductFormDraft,
  type ProductFormDraft,
} from '@/lib/admin/product-form-draft';

type UseProductFormDraftOptions<T extends Omit<ProductFormDraft, 'savedAt'>> = {
  mode: 'create' | 'edit';
  productId?: string;
  form: T;
  /** When false (e.g. edit page still loading API), skip persisting. */
  enabled: boolean;
};

export function useProductFormDraft<T extends Omit<ProductFormDraft, 'savedAt'>>({
  mode,
  productId,
  form,
  enabled,
}: UseProductFormDraftOptions<T>) {
  useEffect(() => {
    if (!enabled) return;

    const timer = window.setTimeout(() => {
      writeProductFormDraft(mode, productId, form);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [form, mode, productId, enabled]);

  useEffect(() => {
    if (!enabled) return;

    function flushDraft() {
      writeProductFormDraft(mode, productId, form);
    }

    window.addEventListener('beforeunload', flushDraft);
    return () => window.removeEventListener('beforeunload', flushDraft);
  }, [form, mode, productId, enabled]);

  return {
    clearDraft: () => clearProductFormDraft(mode, productId),
  };
}

export function readStoredProductFormDraft(
  mode: 'create' | 'edit',
  productId?: string,
): ProductFormDraft | null {
  return readProductFormDraft(mode, productId);
}

export function formStateFromDraft(draft: ProductFormDraft): Omit<ProductFormDraft, 'savedAt'> {
  const { savedAt: _savedAt, ...form } = draft;
  return form;
}
