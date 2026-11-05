import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, MessageCircle, Package, X, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { openWhatsAppOrderUrl } from '../utils/whatsappOrder';

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
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; bg: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      const colors = ['#004e38', '#25D366', '#d4af37', '#1A1918', '#f59e0b', '#3b82f6'];
      const p = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        left: Math.random() * 95,
        delay: Math.random() * 0.7,
        bg: colors[Math.floor(Math.random() * colors.length)]
      }));
      setParticles(p);
    }
  }, [isOpen]);

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Confetti Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        {particles.map((pt) => (
          <div
            key={pt.id}
            className="absolute w-2.5 h-2.5 rounded-full animate-bounce opacity-75"
            style={{
              left: `${pt.left}%`,
              top: `${12 + Math.random() * 40}%`,
              backgroundColor: pt.bg,
              animationDelay: `${pt.delay}s`,
              animationDuration: '2.2s'
            }}
          />
        ))}
      </div>

      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl text-gray-900 relative z-20 overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#004e38] via-[#003828] to-[#1A1918] text-white pt-6 pb-5 px-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Glowing Check Icon */}
          <div className="relative w-14 h-14 mx-auto mb-3 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 animate-ping absolute inset-0" />
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#25D366] to-emerald-400 flex items-center justify-center text-white shadow-lg">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ORDER ACCEPTED</span>
            <Sparkles className="w-3.5 h-3.5" />
          </span>

          <h2 className="text-2xl font-serif font-bold mt-1 text-white">
            Order Accepted!
          </h2>

          <div className="mt-2 inline-block px-3.5 py-1 bg-white/15 border border-white/20 rounded-full text-xs font-mono font-bold text-emerald-100">
            Order Ref: #{orderNumber}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Status and Customer Details */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/70 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Order Status:</span>
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Order Accepted</span>
              </span>
            </div>

            {customerPhone && (
              <div className="flex justify-between items-center border-t border-emerald-100 pt-2">
                <span className="text-gray-600 font-medium">Contact Number:</span>
                <span className="font-semibold text-gray-800">{customerPhone}</span>
              </div>
            )}

            {customerName && customerName.trim() && customerName !== 'Valued Customer' && (
              <div className="flex justify-between items-center border-t border-emerald-100 pt-2">
                <span className="text-gray-600 font-medium">Customer:</span>
                <span className="font-bold text-gray-900">{customerName}</span>
              </div>
            )}

            {grandTotal !== undefined && (
              <div className="flex justify-between items-center border-t border-emerald-100 pt-2">
                <span className="text-gray-600 font-medium">Total Amount:</span>
                <span className="font-serif font-bold text-base text-[#004e38]">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          {/* Items Summary */}
          {items.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Ordered Items ({items.reduce((s, it) => s + (it.quantity || 1), 0)} Total)
              </h4>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {items.map((it, idx) => {
                  const title = it.name || it.title || 'Product';
                  const price = it.price || 0;
                  const qty = it.quantity || 1;

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs"
                    >
                      {it.image ? (
                        <img
                          src={it.image}
                          alt={title}
                          className="w-10 h-10 object-cover rounded-lg bg-gray-200 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate text-[11px]">{title}</p>
                        <p className="text-[10px] text-gray-500">
                          Qty: {qty} {it.selectedSize ? `• Size: ${it.selectedSize}` : ''}
                        </p>
                      </div>
                      <span className="font-bold text-gray-900 text-xs">
                        ₹{(price * qty).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* WhatsApp Direct Notification Box */}
          {whatsappMessage && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-center space-y-2.5">
              <div className="flex items-center justify-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
                <span>WhatsApp Order Receipt</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Your order is accepted. Click below to view or send your pre-filled receipt on WhatsApp.
              </p>
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>OPEN ON WHATSAPP</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleViewOrders}
            className="flex-1 bg-[#1A1918] hover:bg-[#004e38] text-white py-3 rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>View My Orders</span>
          </button>

          <button
            onClick={handleContinueShopping}
            className="flex-1 bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
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
