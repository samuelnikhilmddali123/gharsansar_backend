// Central Configuration for Ghar Sansar Admin WhatsApp Number
// Number format: International format without '+', spaces, hyphens, or brackets.
const DEFAULT_NUMBER = "918121135980";

export let ADMIN_WHATSAPP_NUMBER = localStorage.getItem('gs_admin_whatsapp_number') || DEFAULT_NUMBER;

export const getAdminWhatsAppNumber = (): string => {
  return localStorage.getItem('gs_admin_whatsapp_number') || ADMIN_WHATSAPP_NUMBER || DEFAULT_NUMBER;
};

export const setAdminWhatsAppNumber = (num: string) => {
  const clean = num.replace(/\D/g, '');
  if (clean) {
    ADMIN_WHATSAPP_NUMBER = clean;
    localStorage.setItem('gs_admin_whatsapp_number', clean);
  }
};
