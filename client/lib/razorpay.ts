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

/** Razorpay domestic checkout expects +91XXXXXXXXXX or a 10-digit Indian mobile. */
export function normalizeRazorpayContact(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, '');
  let national: string | undefined;
  if (digits.length === 10) national = digits;
  else if (digits.length === 12 && digits.startsWith('91')) national = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) national = digits.slice(1);
  else if (digits.length > 10) national = digits.slice(-10);
  if (!national || national.length !== 10) return undefined;
  return `+91${national}`;
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
    return 'This Razorpay account only accepts domestic Indian cards. In test mode use Visa 4100 2800 0000 1007 (or Netbanking → Success), not 4111… which is treated as international.';
  }
  if (/incorrect otp|invalid otp|authentication failed/i.test(text)) {
    return 'Card authentication failed. In test mode enter any OTP with 4–10 digits (e.g. 123456), or click Success on the bank page. Prefer Netbanking → Success if OTP keeps failing.';
  }
  return text;
}

function assertCheckoutPayment(payment: InitiatePaymentResult): void {
  const { keyId, amount, currency, gatewayOrderId } = payment;

  if (!keyId || keyId.includes('placeholder')) {
    throw new Error(
      'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the server, then restart.',
    );
  }

  if (!gatewayOrderId || !gatewayOrderId.startsWith('order_')) {
    throw new Error('Invalid payment session. Please try again.');
  }

  if (!Number.isInteger(amount) || amount < 100) {
    throw new Error('Invalid payment amount. Please try again.');
  }

  if (!currency?.trim()) {
    throw new Error('Invalid payment currency. Please try again.');
  }
}

/**
 * Opens Razorpay Checkout and waits for a terminal outcome.
 * Prefers `handler` over `modal.ondismiss` — after Success on the test bank
 * page Razorpay often closes the modal before (or with) the success handler,
 * which would otherwise cancel a paid order and skip redirect.
 */
export async function openRazorpayCheckout(
  input: OpenRazorpayCheckoutInput,
): Promise<OpenRazorpayCheckoutResult> {
  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error('Razorpay checkout is unavailable');
  }

  assertCheckoutPayment(input.payment);

  const isTestKey = input.payment.keyId.startsWith('rzp_test_');
  // Test mode: omit contact so Checkout skips phone/saved-card OTP
  // (v2/otp/verify), which often 400s with a real mobile number.
  const contact = isTestKey ? undefined : normalizeRazorpayContact(input.prefill?.contact);

  return new Promise((resolve) => {
    let settled = false;
    let dismissTimer: number | null = null;

    const finish = (result: OpenRazorpayCheckoutResult) => {
      if (settled) return;
      settled = true;
      if (dismissTimer !== null) {
        window.clearTimeout(dismissTimer);
        dismissTimer = null;
      }
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
      handler: (response) => {
        finish({ status: 'paid', response });
      },
      modal: {
        ondismiss: () => {
          // Allow the success handler time to fire after test-bank "Success" or slow networks.
          dismissTimer = window.setTimeout(() => {
            finish({ status: 'dismissed' });
          }, 2_000);
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
