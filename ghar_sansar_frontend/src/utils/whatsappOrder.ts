import { getAdminWhatsAppNumber } from '../config/whatsappConfig';

export interface CustomerDetails {
  name?: string;
  mobile: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  notes?: string;
}

export interface OrderItemDetail {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedSize?: string;
  selectedColor?: string;
}

export interface FullCartOrder {
  items: OrderItemDetail[];
  totalQuantity: number;
  subtotal: number;
  tax: number;
  shipping: number;
  grandTotal: number;
}

export interface SingleProductOrder {
  product: {
    id: string | number;
    title?: string;
    name?: string;
    price: number;
    image?: string;
    category?: string;
    subCategory?: string;
    sku?: string;
  };
  quantity: number;
  unitPrice: number;
  selectedSize?: string;
  selectedColor?: string;
}

/**
 * Build absolute clickable image URL for WhatsApp
 */
export const getFullImageUrl = (imagePath?: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const backendBase = 'https://backend.gharsansar.website';
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${backendBase}${cleanPath}`;
};

/**
 * Generate a unique, professional order reference (e.g. GS-20261105-4819)
 */
export const generateOrderId = (): string => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `GS-${dateStr}-${random}`;
};

/**
 * Format date nicely for order message
 */
const getFormattedDate = (): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(new Date());
};

/**
 * Generate formatted WhatsApp message for CART order
 */
export const generateFullCartWhatsAppMessage = (
  orderId: string,
  customer: CustomerDetails,
  cartOrder: FullCartOrder
): string => {
  const { items, totalQuantity, subtotal, shipping, grandTotal } = cartOrder;

  let msg = `🛍️ *NEW ORDER BOOKING - GHAR SANSAR*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📋 *Order ID:* ${orderId}\n`;
  msg += `📅 *Date:* ${getFormattedDate()}\n`;
  msg += `⚡ *Status:* Order Accepted\n\n`;

  msg += `📍 *DELIVERY DETAILS*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `• *Delivery Address:* ${customer.address || 'Address provided at delivery'}\n`;
  if (customer.city || customer.pincode) {
    msg += `• *Location:* ${[customer.city, customer.state, customer.pincode].filter(Boolean).join(', ')}\n`;
  }
  msg += `• *Mobile / WhatsApp:* ${customer.mobile || 'Not provided'}\n`;
  if (customer.name && customer.name.trim() && customer.name !== 'Valued Customer') {
    msg += `• *Contact Person:* ${customer.name.trim()}\n`;
  }
  if (customer.notes) msg += `• *Special Notes:* ${customer.notes}\n`;

  msg += `\n📦 *ORDER ITEMS (${totalQuantity} Total)*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  items.forEach((item, index) => {
    const lineTotal = item.price * item.quantity;
    msg += `${index + 1}. *${item.name}*\n`;
    if (item.selectedSize) msg += `   • Size: ${item.selectedSize}\n`;
    if (item.selectedColor) msg += `   • Color: ${item.selectedColor}\n`;
    msg += `   • Qty: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')}\n`;
    msg += `   • Item Total: ₹${lineTotal.toLocaleString('en-IN')}\n`;

    if (item.image) {
      msg += `   • Image: ${getFullImageUrl(item.image)}\n`;
    }
    msg += `\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💵 *BILLING SUMMARY*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `• Items Subtotal: ₹${subtotal.toLocaleString('en-IN')}\n`;
  msg += `• Delivery Charges: ${shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}\n`;
  msg += `• Taxes (GST): Included\n\n`;
  msg += `⭐ *GRAND TOTAL: ₹${grandTotal.toLocaleString('en-IN')}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `*Order Accepted!* Please share tracking and dispatch timeline.\n`;
  msg += `Thank you for choosing *Ghar Sansar*!`;

  return msg;
};

/**
 * Generate formatted WhatsApp message for SINGLE PRODUCT buy now
 */
export const generateSingleProductWhatsAppMessage = (
  orderId: string,
  customer: CustomerDetails,
  singleOrder: SingleProductOrder
): string => {
  const { product, quantity, unitPrice, selectedSize, selectedColor } = singleOrder;
  const lineTotal = unitPrice * quantity;
  const grandTotal = lineTotal;
  const productName = product.name || product.title || 'Product';

  let msg = `🛍️ *NEW DIRECT ORDER - GHAR SANSAR*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📋 *Order ID:* ${orderId}\n`;
  msg += `📅 *Date:* ${getFormattedDate()}\n`;
  msg += `⚡ *Status:* Order Accepted\n\n`;

  msg += `📍 *DELIVERY DETAILS*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `• *Delivery Address:* ${customer.address || 'Address provided at delivery'}\n`;
  if (customer.city || customer.pincode) {
    msg += `• *Location:* ${[customer.city, customer.state, customer.pincode].filter(Boolean).join(', ')}\n`;
  }
  msg += `• *Mobile / WhatsApp:* ${customer.mobile || 'Not provided'}\n`;
  if (customer.name && customer.name.trim() && customer.name !== 'Valued Customer') {
    msg += `• *Contact Person:* ${customer.name.trim()}\n`;
  }
  if (customer.notes) msg += `• *Special Notes:* ${customer.notes}\n`;

  msg += `\n📦 *ORDERED ITEM*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `*${productName}*\n`;
  if (product.category) msg += `• Category: ${product.category}\n`;
  if (selectedSize) msg += `• Size: ${selectedSize}\n`;
  if (selectedColor) msg += `• Color: ${selectedColor}\n`;
  msg += `• Quantity: ${quantity}\n`;
  msg += `• Unit Price: ₹${unitPrice.toLocaleString('en-IN')}\n`;
  msg += `• Total: ₹${lineTotal.toLocaleString('en-IN')}\n`;
  if (product.image) {
    msg += `• Image: ${getFullImageUrl(product.image)}\n`;
  }

  msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `⭐ *GRAND TOTAL: ₹${grandTotal.toLocaleString('en-IN')}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `*Order Accepted!* Please share tracking and dispatch timeline.\n`;
  msg += `Thank you for choosing *Ghar Sansar*!`;

  return msg;
};

/**
 * Open WhatsApp Click-to-Chat in a new tab or trigger the WhatsApp app
 */
export const openWhatsAppOrderUrl = (rawMessage: string, customPhone?: string): void => {
  if (!rawMessage) return;
  const encodedText = encodeURIComponent(rawMessage);
  const adminNum = customPhone || getAdminWhatsAppNumber();
  const whatsappUrl = `https://wa.me/${adminNum}?text=${encodedText}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
};
