'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard } from '@/components/admin/ui/AdminCard';
import { adminInputClassName } from '@/components/admin/ui/AdminFormField';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import { ModalShell } from '@/components/ui/ModalShell';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import {
  newsletterQueryKeys,
  sendAdminNewsletterCampaign,
} from '@/lib/api/newsletter';
import {
  newsletterCampaignSchema,
  type SendNewsletterCampaignInput,
} from '@/lib/types/newsletter.schemas';

const EMPTY_CAMPAIGN: SendNewsletterCampaignInput = {
  subject: '',
  preheader: '',
  content: '',
};

export function NewsletterComposer() {
  const queryClient = useQueryClient();
  const { toast } = useAdminToast();
  const [form, setForm] =
    useState<SendNewsletterCampaignInput>(EMPTY_CAMPAIGN);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const sendMutation = useMutation({
    mutationFn: sendAdminNewsletterCampaign,
    onSuccess: async (campaign) => {
      setForm(EMPTY_CAMPAIGN);
      setIsConfirming(false);
      await queryClient.invalidateQueries({
        queryKey: newsletterQueryKeys.all,
      });
      toast(
        `Newsletter queued for ${campaign.queuedCount} subscriber${campaign.queuedCount === 1 ? '' : 's'}`,
      );
    },
    onError: (mutationError: unknown) => {
      setIsConfirming(false);
      toast(
        mutationError instanceof ApiError
          ? getApiErrorMessage(mutationError)
          : 'Could not send newsletter',
        'error',
      );
    },
  });

  function prepareSend() {
    const parsed = newsletterCampaignSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the newsletter fields');
      return;
    }
    setError(null);
    setForm(parsed.data);
    setIsConfirming(true);
  }

  return (
    <>
      <AdminCard>
        <div className="mb-5">
          <h2 className="font-display text-xl text-saan-charcoal dark:text-paper">
            Send newsletter
          </h2>
          <p className="mt-1 text-sm text-saan-ink/60 dark:text-paper/60">
            The message is delivered individually to every active subscriber.
          </p>
        </div>

        <div className="grid gap-4">
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
              Subject
            </span>
            <input
              value={form.subject}
              maxLength={200}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  subject: event.target.value,
                }))
              }
              className={adminInputClassName}
              placeholder="A quiet new chapter"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
              Preheader <span className="font-normal">(optional)</span>
            </span>
            <input
              value={form.preheader ?? ''}
              maxLength={200}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  preheader: event.target.value,
                }))
              }
              className={adminInputClassName}
              placeholder="A short preview shown beside the subject"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
              Message
            </span>
            <textarea
              value={form.content}
              maxLength={20_000}
              rows={9}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  content: event.target.value,
                }))
              }
              className={adminInputClassName}
              placeholder="Write the newsletter message…"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          )}

          <div>
            <AdminButton onClick={prepareSend}>
              <Send className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              Review and send
            </AdminButton>
          </div>
        </div>
      </AdminCard>

      <ModalShell
        isOpen={isConfirming}
        onClose={() => {
          if (!sendMutation.isPending) setIsConfirming(false);
        }}
        title="Send newsletter?"
      >
        <div className="space-y-5 text-left">
          <p className="text-sm leading-relaxed text-saan-ink/70">
            This will queue “{form.subject}” for every currently active
            subscriber. This action cannot be recalled after delivery begins.
          </p>
          <div className="flex justify-end gap-2">
            <AdminButton
              variant="secondary"
              disabled={sendMutation.isPending}
              onClick={() => setIsConfirming(false)}
            >
              Cancel
            </AdminButton>
            <AdminButton
              isLoading={sendMutation.isPending}
              onClick={() => sendMutation.mutate(form)}
            >
              Send to subscribers
            </AdminButton>
          </div>
        </div>
      </ModalShell>
    </>
  );
}
