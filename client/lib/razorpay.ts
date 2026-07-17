import type { InitiatePaymentResult } from '@/lib/types/checkout';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  /** Prefer domestic methods so test checkout is easier on Indian accounts. */
  config?: {
    display?: {
      blocks?: Record<
        string,
        {
          name: string;
          instruments: Array<{ method: string }>;
        }
      >;
      sequence?: string[];
      preferences?: {
        show_default_blocks?: boolean;
      };
    };
  };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (
    event: 'payment.failed',
    handler: (response: { error: { description?: string } }) => void,
  ) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay can only run in the browser'));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${RAZORPAY_SCRIPT_URL}"]`,
      );
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () =>
          reject(new Error('Failed to load Razorpay checkout')),
        );
        return;
      }

      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
      document.body.appendChild(script);
    });
  }

  return scriptPromise;
}

/** Razorpay domestic checkout expects a 10-digit Indian mobile number. */
export function normalizeRazorpayContact(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  if (digits.length > 10) return digits.slice(-10);
  return undefined;
}

export type OpenRazorpayCheckoutInput = {
  payment: InitiatePaymentResult;
  name: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
};

export type OpenRazorpayCheckoutResult =
  | { status: 'paid'; response: RazorpaySuccessResponse }
  | { status: 'dismissed' }
  | { status: 'failed'; message: string };

function mapPaymentFailureMessage(description?: string): string {
  const text = description?.trim() || 'Payment failed. Please try again.';
  if (/international cards? are not supported/i.test(text)) {
    return 'Card payments are restricted on this Razorpay account. In test mode, pay with UPI using success@razorpay, or enable Cards in the Razorpay Dashboard.';
  }
  if (/incorrect otp|invalid otp|authentication failed/i.test(text)) {
    return 'Card authentication failed. In test mode use OTP 1234, or click Success on the bank page if shown. Prefer UPI success@razorpay if cards keep failing.';
  }
  return text;
}

/**
 * Opens Razorpay Checkout and waits for a terminal outcome.
 * Ignores modal `ondismiss` after success/failure — Razorpay often fires
 * dismiss after a successful payment, which would otherwise cancel verify.
 */
export async function openRazorpayCheckout(
  input: OpenRazorpayCheckoutInput,
): Promise<OpenRazorpayCheckoutResult> {
  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error('Razorpay checkout is unavailable');
  }

  const contact = normalizeRazorpayContact(input.prefill?.contact);

  return new Promise((resolve) => {
    let settled = false;

    const finish = (result: OpenRazorpayCheckoutResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const checkout = new window.Razorpay!({
      key: input.payment.keyId,
      amount: input.payment.amount,
      currency: input.payment.currency,
      name: input.name,
      description: input.description,
      order_id: input.payment.gatewayOrderId,
      prefill: {
        name: input.prefill?.name,
        email: input.prefill?.email,
        ...(contact ? { contact } : {}),
      },
      theme: {
        color: '#0B0A09',
      },
      config: {
        display: {
          blocks: {
            upi: {
              name: 'UPI',
              instruments: [{ method: 'upi' }],
            },
            cards_and_netbanking: {
              name: 'Cards & Netbanking',
              instruments: [{ method: 'card' }, { method: 'netbanking' }],
            },
          },
          sequence: ['block.upi', 'block.cards_and_netbanking'],
          preferences: {
            show_default_blocks: false,
          },
        },
      },
      handler: (response) => {
        finish({ status: 'paid', response });
      },
      modal: {
        ondismiss: () => {
          // Delay slightly so a successful `handler` can win the race.
          window.setTimeout(() => {
            finish({ status: 'dismissed' });
          }, 300);
        },
      },
    });

    checkout.on('payment.failed', (response) => {
      finish({
        status: 'failed',
        message: mapPaymentFailureMessage(response.error?.description),
      });
    });

    checkout.open();
  });
}
