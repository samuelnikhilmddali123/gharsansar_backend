import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, MessageCircle, Package, X, ExternalLink, ArrowRight } from 'lucide-react';
import { openWhatsAppOrderUrl } from '../utils/whatsappOrder';

// Helper to normalize image paths matching Cart & Wishlist
const fixImageUrl = (url?: string) => {
  if (!url) return '';
  let fixed = url
    .replace(/^https?:\/\/https?:\/\//, 'https://')
    .replace(/\s/g, '%20')
    .replace(/([^:]\/)\/+/g, '$1');
  fixed = fixed.replace(/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?/, '');
  if (fixed.startsWith('http://backend.gharsansar.website') || fixed.startsWith('http://lx70r6zsef')) {
    fixed = fixed.replace(/^http:/, 'https:');
  }
  return fixed;
};

export interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  grandTotal?: number;
  items?: Array<{
    id?: string | number;
    name?: string;
    title?: string;
    price?: number;
    quantity: number;
    image?: string;
    selectedSize?: string;
    selectedColor?: string;
  }>;
  whatsappMessage?: string;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  customerName,
  customerPhone,
  grandTotal,
  items = [],
  whatsappMessage
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleOpenWhatsApp = () => {
    if (whatsappMessage) {
      openWhatsAppOrderUrl(whatsappMessage);
    }
  };

  const handleViewOrders = () => {
    onClose();
    navigate('/profile');
  };

  const handleContinueShopping = () => {
    onClose();
    navigate('/products');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-poppins selection:bg-[#F7EBE4] selection:text-[#7D3219] antialiased">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-lg border border-[#E8E2D8] text-gray-900 relative z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="bg-[#FAF7F2] border-b border-[#E8E2D8] pt-6 pb-5 px-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#736B63] hover:text-gray-950 rounded-md hover:bg-black/5 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Minimalist Check Icon */}
          <div className="w-12 h-12 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center mx-auto mb-3 text-[#16A34A]">
            <CheckCircle2 className="w-6 h-6 stroke-[2]" />
          </div>

          <span className="text-[10px] font-medium uppercase tracking-wider text-[#15803D] bg-[#DCFCE7] border border-[#BBF7D0] px-2.5 py-0.5 rounded-md inline-block mb-1.5">
            Order Confirmed & Accepted
          </span>

          <h2 className="text-xl sm:text-2xl font-poppins font-normal text-gray-950">
            Order Accepted!
          </h2>

          <div className="mt-1.5 inline-block px-3 py-1 bg-white border border-[#E8E2D8] rounded-md text-xs font-mono font-normal text-gray-800">
            Order Ref: #{orderNumber}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          {/* Status and Details Box */}
          <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E2D8] rounded-lg space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#736B63] font-normal">Order Status:</span>
              <span className="bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] px-2.5 py-0.5 rounded-md font-medium text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                <span>Accepted & Queued</span>
              </span>
            </div>

            {customerPhone && (
              <div className="flex justify-between items-center border-t border-[#E8E2D8] pt-2">
                <span className="text-[#736B63] font-normal">Contact Number:</span>
                <span className="text-gray-950 font-normal">{customerPhone}</span>
              </div>
            )}

            {customerName && customerName.trim() && customerName !== 'Valued Customer' && (
              <div className="flex justify-between items-center border-t border-[#E8E2D8] pt-2">
                <span className="text-[#736B63] font-normal">Customer:</span>
                <span className="text-gray-950 font-normal">{customerName}</span>
              </div>
            )}

            {grandTotal !== undefined && (
              <div className="flex justify-between items-center border-t border-[#E8E2D8] pt-2">
                <span className="text-[#736B63] font-normal">Total Amount:</span>
                <span className="font-poppins font-normal text-sm text-[#7D3219]">
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          {/* Ordered Items Summary */}
          {items.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-normal uppercase tracking-wider text-[#736B63]">
                Ordered Items ({items.reduce((s, it) => s + (it.quantity || 1), 0)} Total)
              </h4>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                {items.map((it, idx) => {
                  const title = (it.name || it.title || 'Product').replace(/_/g, ' ');
                  const price = it.price || 0;
                  const qty = it.quantity || 1;

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 bg-[#FAF7F2]/50 rounded-lg border border-[#E8E2D8] text-xs"
                    >
                      {it.image ? (
                        <img
                          src={fixImageUrl(it.image) || '/images/festive_gifts_banner.jpg'}
                          alt={title}
                          className="w-10 h-10 object-cover rounded-md bg-[#FBF9F6] border border-[#E8E2D8] shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[#FAF7F2] rounded-md border border-[#E8E2D8] flex items-center justify-center text-[#736B63] shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-normal text-gray-950 truncate text-xs">{title}</p>
                        <p className="text-[11px] text-[#736B63] mt-0.5">
                          Qty: {qty} {it.selectedSize ? `• ${it.selectedSize}` : ''}
                        </p>
                      </div>
                      <span className="font-normal text-gray-950 text-xs shrink-0">
                        ₹{(price * qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* WhatsApp Direct Notification Box */}
          {whatsappMessage && (
            <div className="p-3.5 bg-[#F0FDF4] rounded-lg border border-[#BBF7D0] text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-[#14532D] font-medium text-xs">
                <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
                <span>WhatsApp Pre-filled Order Receipt</span>
              </div>
              <p className="text-[11px] text-[#166534] leading-relaxed">
                Click below to open WhatsApp with your receipt pre-formatted for instant dispatch confirmation.
              </p>
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white py-2.5 px-4 rounded-md font-medium text-xs tracking-wide shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Open on WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#FAF7F2] border-t border-[#E8E2D8] flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleViewOrders}
            className="flex-1 bg-[#C26847] hover:bg-[#B05B3C] text-white py-2.5 px-4 rounded-md text-xs font-medium transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Package className="w-3.5 h-3.5" />
            <span>View My Orders</span>
          </button>

          <button
            onClick={handleContinueShopping}
            className="flex-1 bg-white hover:bg-[#FAF7F2] text-gray-900 border border-[#E8E2D8] hover:border-[#D9B4A4] py-2.5 px-4 rounded-md text-xs font-normal transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;