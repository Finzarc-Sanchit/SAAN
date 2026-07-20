const WHATSAPP_PHONE = '919920613132';

const WHATSAPP_DEFAULT_MESSAGE =
  "Hi SAAN, I'd love to connect about your collections.";

export function buildWhatsAppUrl(message = WHATSAPP_DEFAULT_MESSAGE): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_SUPPORT_URL = buildWhatsAppUrl();
