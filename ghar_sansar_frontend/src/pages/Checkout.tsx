import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  Lock,
  ShoppingBag,
  CheckCircle,
  Loader,
  Truck,
  MessageCircle,
  ExternalLink,
  MapPin,
  Phone,
  User,
  FileText,
  Home,
  ShieldCheck,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import {
  CustomerDetails,
  generateOrderId,
  generateFullCartWhatsAppMessage,
  openWhatsAppOrderUrl
} from '../utils/whatsappOrder';
import { OrderSuccessModal } from '../components/OrderSuccessModal';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

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

const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orderComplete, setOrderComplete] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [completedOrderDetails, setCompletedOrderDetails] = useState<{
    orderNumber: string;
    grandTotal: number;
    items: any[];
    whatsappMessage: string;
  } | null>(null);

  const API_BASE = import.meta.env.VITE_AWS_API_URL || '/api';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    notes: ''
  });

  const [serviceability, setServiceability] = useState<{
    checked: boolean;
    serviceable: boolean;
    loading: boolean;
    cod: boolean;
    prepaid: boolean;
    city?: string;
    state?: string;
    provider?: string;
  }>({
    checked: false,
    serviceable: false,
    loading: false,
    cod: false,
    prepaid: false
  });

  const checkServiceability = async (pincode: string) => {
    if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode)) {
      setServiceability({
        checked: false,
        serviceable: false,
        loading: false,
        cod: false,
        prepaid: false
      });
      return;
    }

    setServiceability(prev => ({ ...prev, loading: true, checked: false }));

    try {
      const response = await fetch(`${API_BASE}/shipping/serviceability?pincode=${pincode}`);
      if (!response.ok) throw new Error('Serviceability check failed');
      const data = await response.json();

      setServiceability({
        checked: true,
        serviceable: data.serviceable,
        loading: false,
        cod: data.cod || false,
        prepaid: data.prepaid || false,
        city: data.city,
        state: data.state,
        provider: data.provider
      });

      if (data.city) setFormData(prev => ({ ...prev, city: data.city }));
      if (data.state) setFormData(prev => ({ ...prev, state: data.state }));
    } catch (err) {
      setServiceability({
        checked: true,
        serviceable: true,
        loading: false,
        cod: true,
        prepaid: true,
        city: 'Direct Delivery',
        state: 'AP/TS',
        provider: 'Delhivery'
      });
    }
  };

  const handleZipCodeBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    checkServiceability(e.target.value.trim());
  };

  // Pre-fill address from user profile if available
  useEffect(() => {
    if (user) {
      const defaultAddr = user.addresses?.find((a: any) => a.isDefault) || user.addresses?.[0];
      setFormData(prev => ({
        ...prev,
        name: user.full_name || prev.name,
        phone: defaultAddr?.phone || user.phone || prev.phone,
        email: user.email || prev.email,
        address: defaultAddr?.address || prev.address,
        city: defaultAddr?.city || prev.city,
        state: defaultAddr?.state || prev.state,
        zipCode: defaultAddr?.zipCode || prev.zipCode
      }));
      if (defaultAddr?.zipCode) {
        checkServiceability(defaultAddr.zipCode);
      }
    }
  }, [user]);

  const calculatedShippingFee = useMemo(() => {
    if (!serviceability.checked) return 99;
    if (serviceability.serviceable) return 99;
    return 149;
  }, [serviceability]);

  const tax = 0; // All prices are inclusive of all taxes (GST)
  const grandTotal = totalPrice + calculatedShippingFee;

  if (items.length === 0 && !orderComplete) {
    return <Navigate to="/cart" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.address.trim()) {
      toast.error('Please enter your Delivery Address to place order.');
      return;
    }
    if (!formData.zipCode.trim()) {
      toast.error('Please enter your PIN Code.');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter your Mobile / WhatsApp Number.');
      return;
    }

    setProcessingPayment(true);
    try {
      const fallbackOrderId = generateOrderId();
      const orderItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      }));

      const order = await createOrder({
        customer: {
          firstName: formData.name ? formData.name.split(' ')[0] : 'Customer',
          lastName: formData.name ? formData.name.split(' ').slice(1).join(' ') : '',
          email: formData.email || user?.email || 'customer@gharsansar.website',
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          notes: formData.notes
        },
        items: orderItems,
        subtotal: totalPrice,
        shipping: calculatedShippingFee,
        tax: tax,
        total: grandTotal,
        status: 'confirmed',
        paymentStatus: 'pending',
        paymentId: `wa_${Date.now()}`,
        paymentMethod: 'whatsapp',
        notes: formData.notes
      });

      const effectiveOrderNumber = order?.orderNumber || order?.id || fallbackOrderId;

      const customerData: CustomerDetails = {
        name: formData.name,
        mobile: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.zipCode,
        notes: formData.notes
      };

      const rawMessage = generateFullCartWhatsAppMessage(effectiveOrderNumber, customerData, {
        items: orderItems,
        totalQuantity: items.reduce((s, it) => s + it.quantity, 0),
        subtotal: totalPrice,
        tax: tax,
        shipping: calculatedShippingFee,
        grandTotal: grandTotal
      });

      clearCart();
      toast.success('Order Accepted! Opening WhatsApp...');
      openWhatsAppOrderUrl(rawMessage);

      setCompletedOrderDetails({
        orderNumber: effectiveOrderNumber,
        grandTotal: grandTotal,
        items: orderItems,
        whatsappMessage: rawMessage
      });
      setIsSuccessModalOpen(true);
      setOrderComplete(true);
    } catch (err) {
      console.error('Error placing WhatsApp order:', err);
      toast.error('Could not complete order. Please try again.');
    } finally {
      setProcessingPayment(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Full Page Order Complete State (Matching Warm Ivory Luxury Theme)
  if (orderComplete) {
    return (
      <div className="bg-[#FAF7F2] min-h-[calc(100vh-48px)] font-poppins pt-6 pb-12 flex items-center justify-center px-4 selection:bg-[#F7EBE4] selection:text-[#7D3219] antialiased">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white p-6 sm:p-8 rounded-xl border border-[#E8E2D8] shadow-2xs text-center max-w-md w-full"
        >
          <div className="w-12 h-12 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center mx-auto mb-3 text-[#16A34A]">
            <CheckCircle className="w-6 h-6" />
          </div>

          <span className="inline-block bg-[#DCFCE7] text-[#15803D] text-[10px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-md mb-2 border border-[#BBF7D0]">
            Order Accepted
          </span>

          <h1 className="text-xl sm:text-2xl font-poppins font-normal text-gray-950 mb-1.5">
            Order Placed Successfully
          </h1>
          <p className="text-xs text-[#736B63] font-normal mb-5 leading-relaxed">
            Your order has been recorded. Our team will pack and dispatch your curations to your address.
          </p>

          <div className="bg-[#FAF7F2] py-2 px-3.5 rounded-md border border-[#E8E2D8] mb-5 inline-block">
            <span className="text-[10px] text-[#736B63] uppercase tracking-wider block">Order Reference</span>
            <span className="text-sm font-mono font-medium text-gray-950">
              #{completedOrderDetails?.orderNumber || `GS${Date.now().toString().slice(-8)}`}
            </span>
          </div>

          {completedOrderDetails?.whatsappMessage && (
            <button
              onClick={() => openWhatsAppOrderUrl(completedOrderDetails.whatsappMessage)}
              className="w-full mb-2.5 py-2.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-medium text-xs sm:text-sm tracking-wide rounded-md shadow-2xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Open on WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          )}

          <button
            onClick={() => navigate('/products')}
            className="w-full py-2 px-4 bg-[#FAF7F2] hover:bg-white text-gray-900 border border-[#E8E2D8] hover:border-[#D9B4A4] font-normal text-xs rounded-md shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={13} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F2] min-h-[calc(100vh-48px)] font-poppins pt-3 sm:pt-4 pb-10 sm:pb-14 flex flex-col selection:bg-[#F7EBE4] selection:text-[#7D3219] antialiased">
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb Navigation - Compact */}
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex items-center gap-1.5 text-[11px] text-[#736B63]">
            <li>
              <Link to="/" className="hover:text-gray-950 transition-colors flex items-center gap-1">
                <Home size={11} />
                <span>Home</span>
              </Link>
            </li>
            <li><ChevronRight size={10} className="text-[#A89F91]" /></li>
            <li>
              <Link to="/cart" className="hover:text-gray-950 transition-colors">
                Cart
              </Link>
            </li>
            <li><ChevronRight size={10} className="text-[#A89F91]" /></li>
            <li className="text-gray-950 font-normal">WhatsApp Order Booking</li>
          </ol>
        </nav>

        {/* Page Header - Tighter margins */}
        <div className="pb-3 border-b border-[#E8E2D8] mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3">
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-xl sm:text-2xl font-poppins font-normal text-gray-950 tracking-tight">
              WhatsApp Order Booking
            </h1>
            <span className="text-xs text-[#736B63] font-normal hidden sm:inline">
              • Direct & Instant Booking
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-[#736B63]">
            <Lock size={12} className="text-[#C26847]" />
            <span>Pre-filled WhatsApp Receipt</span>
          </div>
        </div>

        {/* 2-Column Checkout Layout - Balanced Gap */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column: Delivery Address Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-xl border border-[#E8E2D8] p-3.5 sm:p-5 shadow-2xs space-y-4"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Clean Section Title */}
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D8]">
                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="text-[#C26847]" />
                    <h2 className="text-sm sm:text-base font-poppins font-normal text-gray-950">
                      Delivery Address
                    </h2>
                  </div>
                  {user?.addresses && user.addresses.length > 0 && (
                    <span className="text-[11px] text-[#736B63]">Pre-filled from profile</span>
                  )}
                </div>

                {/* Saved Address Quick Selector (Compact Chips) */}
                {user?.addresses && user.addresses.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    <span className="text-[11px] text-[#736B63] shrink-0">Saved Addresses:</span>
                    {user.addresses.map((addr: any, idx: number) => {
                      const isSelected = formData.address === addr.address && formData.zipCode === addr.zipCode;
                      return (
                        <button
                          key={addr.id || idx}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              name: addr.firstName ? `${addr.firstName} ${addr.lastName || ''}`.trim() : prev.name,
                              phone: addr.phone || prev.phone,
                              address: addr.address,
                              city: addr.city,
                              state: addr.state,
                              zipCode: addr.zipCode,
                              country: addr.country || 'India'
                            }));
                            checkServiceability(addr.zipCode);
                          }}
                          className={`px-2.5 py-1 rounded-md text-xs border transition-colors shrink-0 cursor-pointer ${
                            isSelected
                              ? 'bg-[#F7EBE4] border-[#C26847] text-[#7D3219] font-medium'
                              : 'bg-[#FAF7F2] border-[#E8E2D8] text-gray-700 hover:border-[#D9B4A4]'
                          }`}
                        >
                          {addr.city || `Address ${idx + 1}`}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Input Fields - Clean & Balanced */}
                <div className="space-y-3">
                  
                  {/* Street Address */}
                  <div className="space-y-1">
                    <label className="block text-xs font-normal text-[#736B63]">
                      Street Address / House No. / Landmark <span className="text-[#C26847]">*</span>
                    </label>
                    <textarea
                      name="address"
                      required
                      rows={2}
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-[#FAF7F2]/40 border border-[#E8E2D8] focus:bg-white focus:border-[#C26847] focus:ring-1 focus:ring-[#C26847]/20 rounded-md text-xs sm:text-sm text-gray-950 placeholder-gray-400 outline-none transition-colors resize-none"
                      placeholder="e.g. Flat 302, Sri Sai Nivas, MG Road, Near Collector Office"
                    />
                  </div>

                  {/* PIN Code & Mobile Number in 2 columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-normal text-[#736B63]">
                        PIN Code <span className="text-[#C26847]">*</span>
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        maxLength={6}
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        onBlur={handleZipCodeBlur}
                        className="w-full px-3 py-2 bg-[#FAF7F2]/40 border border-[#E8E2D8] focus:bg-white focus:border-[#C26847] focus:ring-1 focus:ring-[#C26847]/20 rounded-md text-xs sm:text-sm text-gray-950 placeholder-gray-400 outline-none transition-colors"
                        placeholder="6-digit PIN code"
                      />
                      {serviceability.loading && (
                        <div className="text-[10px] text-[#7D3219] flex items-center gap-1 mt-0.5 font-normal">
                          <span className="w-1.5 h-1.5 bg-[#C26847] rounded-full animate-ping"></span>
                          Checking serviceability...
                        </div>
                      )}
                      {serviceability.checked && (
                        <div className={`text-[10px] mt-1 font-normal flex items-center gap-1 px-2 py-0.5 rounded border ${
                          serviceability.serviceable
                            ? 'text-[#166534] bg-[#F0FDF4] border-[#BBF7D0]'
                            : 'text-[#854D0E] bg-[#FEFCE8] border-[#FEF08A]'
                        }`}>
                          <Truck className="w-3 h-3 shrink-0" />
                          <span>
                            {serviceability.serviceable
                              ? `Serviceable via ${serviceability.provider || 'Delhivery'}`
                              : 'Standard delivery available'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-normal text-[#736B63]">
                        Mobile / WhatsApp Number <span className="text-[#C26847]">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-3 py-2 bg-[#FAF7F2]/40 border border-[#E8E2D8] focus:bg-white focus:border-[#C26847] focus:ring-1 focus:ring-[#C26847]/20 rounded-md text-xs sm:text-sm text-gray-950 placeholder-gray-400 outline-none transition-colors"
                          placeholder="10-digit mobile number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* City and State in 2 columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-normal text-[#736B63]">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-[#FAF7F2]/40 border border-[#E8E2D8] focus:bg-white focus:border-[#C26847] focus:ring-1 focus:ring-[#C26847]/20 rounded-md text-xs sm:text-sm text-gray-950 placeholder-gray-400 outline-none transition-colors"
                        placeholder="City / District"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-normal text-[#736B63]">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-[#FAF7F2]/40 border border-[#E8E2D8] focus:bg-white focus:border-[#C26847] focus:ring-1 focus:ring-[#C26847]/20 rounded-md text-xs sm:text-sm text-gray-950 placeholder-gray-400 outline-none transition-colors"
                        placeholder="State"
                      />
                    </div>
                  </div>

                  {/* Optional Name & Notes in 2 columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-normal text-[#736B63]">
                        Recipient Name (Optional)
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-3 py-2 bg-[#FAF7F2]/40 border border-[#E8E2D8] focus:bg-white focus:border-[#C26847] focus:ring-1 focus:ring-[#C26847]/20 rounded-md text-xs sm:text-sm text-gray-950 placeholder-gray-400 outline-none transition-colors"
                          placeholder="Your name"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-normal text-[#736B63]">
                        Special Notes (Optional)
                      </label>
                      <div className="relative">
                        <FileText className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-3 py-2 bg-[#FAF7F2]/40 border border-[#E8E2D8] focus:bg-white focus:border-[#C26847] focus:ring-1 focus:ring-[#C26847]/20 rounded-md text-xs sm:text-sm text-gray-950 placeholder-gray-400 outline-none transition-colors"
                          placeholder="e.g. Call before delivery"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Order Action Section */}
                <div className="pt-2 border-t border-[#E8E2D8]">
                  <button
                    type="submit"
                    disabled={processingPayment}
                    className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-medium text-xs sm:text-sm tracking-wide rounded-md shadow-2xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {processingPayment ? (
                      <span className="flex items-center gap-2">
                        <Loader className="animate-spin" size={15} /> Booking Order...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <MessageCircle size={16} className="fill-current" />
                        <span>Book Order on WhatsApp • ₹{grandTotal.toFixed(2)}</span>
                      </span>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-[#736B63] mt-2">
                    Your order is confirmed automatically. WhatsApp opens with your receipt for dispatch.
                  </p>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="bg-white rounded-xl border border-[#E8E2D8] p-3.5 sm:p-5 shadow-2xs sticky top-16 space-y-3.5"
            >
              {/* Header */}
              <div className="pb-2.5 border-b border-[#E8E2D8] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={14} className="text-[#7D3219]" />
                  <h2 className="text-sm sm:text-base font-poppins font-normal text-gray-950">
                    Order Summary
                  </h2>
                </div>
                <span className="text-xs text-[#736B63] font-normal">
                  {items.reduce((s, it) => s + it.quantity, 0)} {items.reduce((s, it) => s + it.quantity, 0) === 1 ? 'item' : 'items'}
                </span>
              </div>
              
              {/* Item List */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar divide-y divide-[#E8E2D8]/60">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 pt-2 first:pt-0">
                    <div className="w-12 h-12 bg-[#FBF9F6] rounded-md flex items-center justify-center border border-[#E8E2D8] overflow-hidden shrink-0">
                      <img
                        src={fixImageUrl(item.image) || '/images/festive_gifts_banner.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-normal text-gray-950 text-xs truncate" title={item.name}>
                        {(item.name || 'Curated Product').replace(/_/g, ' ')}
                      </h3>
                      <p className="text-[11px] text-[#736B63]">
                        Qty: {item.quantity} {item.selectedSize ? `• ${item.selectedSize}` : ''}
                      </p>
                    </div>
                    <span className="font-normal text-gray-950 text-xs shrink-0">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-[#E8E2D8] pt-2.5 space-y-2 text-xs">
                <div className="flex justify-between text-[#736B63] font-normal">
                  <span>Subtotal</span>
                  <span className="text-gray-950">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#736B63] font-normal">
                  <span>Estimated Shipping</span>
                  <span className="text-gray-950">
                    {calculatedShippingFee === 0 ? (
                      <span className="text-[#16A34A] font-medium">FREE</span>
                    ) : (
                      `₹${calculatedShippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <div className="border-t border-[#E8E2D8] pt-2.5 flex justify-between items-baseline">
                  <div>
                    <span className="font-normal text-xs sm:text-sm text-gray-950 block">Total Amount</span>
                    <span className="text-[10px] text-[#736B63]">Inclusive of all taxes</span>
                  </div>
                  <span className="font-poppins font-normal text-base sm:text-lg text-[#7D3219]">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Minimal Trust Badges */}
              <div className="pt-2 border-t border-[#E8E2D8] flex items-center justify-between text-[11px] text-[#736B63]">
                <div className="flex items-center gap-1.5">
                  <Truck size={12} className="text-[#C26847] shrink-0" />
                  <span>Insured Shipping</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-[#C26847] shrink-0" />
                  <span>100% Authentic</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Order Success Modal with WhatsApp Action */}
      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          navigate('/profile');
        }}
        orderNumber={completedOrderDetails?.orderNumber || `GS${Date.now().toString().slice(-8)}`}
        customerName={formData.name || 'Valued Customer'}
        customerPhone={formData.phone}
        grandTotal={completedOrderDetails?.grandTotal || grandTotal}
        items={completedOrderDetails?.items || items}
        whatsappMessage={completedOrderDetails?.whatsappMessage}
      />
    </div>
  );
};

export default Checkout;