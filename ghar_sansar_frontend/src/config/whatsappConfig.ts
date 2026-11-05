// Central Configuration for Ghar Sansar Admin WhatsApp Number
// Number format: International format without '+', spaces, hyphens, or brackets.
const DEFAULT_NUMBER = "919492664870";

export let ADMIN_WHATSAPP_NUMBER = DEFAULT_NUMBER;

export const getAdminWhatsAppNumber = (): string => {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('gs_admin_whatsapp_number') : null;
  if (stored && stored !== '918121135980') {
    return stored;
  }
  return DEFAULT_NUMBER;
};

export const setAdminWhatsAppNumber = (num: string) => {
  const clean = num.replace(/\D/g, '');
  if (clean) {
    ADMIN_WHATSAPP_NUMBER = clean;
    if (typeof window !== 'undefined') {
      localStorage.setItem('gs_admin_whatsapp_number', clean);
    }
  }
};
