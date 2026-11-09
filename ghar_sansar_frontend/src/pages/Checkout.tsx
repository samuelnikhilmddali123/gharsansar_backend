import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Lock,
  ShoppingBag,
  CheckCircle,
  Loader,
  Truck,
  Headphones,
  Award,
  Star,
  MessageCircle,
  ExternalLink,
  MapPin,
  Phone,
  User,
  FileText
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

  const API_BASE = import.meta.env.VITE_AWS_API_URL || "/api";

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
      if (!response.ok) throw new Error("Serviceability check failed");
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
        city: "Hyderabad (Direct)",
        state: "TS",
        provider: "Delhivery"
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

  const tax = totalPrice * 0.18; // 18% GST
  const grandTotal = totalPrice + calculatedShippingFee + tax;

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

    // Only address, pincode, and mobile are required!
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

      // Persist order in MongoDB Atlas via OrderContext
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
        status: 'confirmed', // Order Accepted
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

      // Generate clean WhatsApp message
      const rawMessage = generateFullCartWhatsAppMessage(effectiveOrderNumber, customerData, {
        items: orderItems,
        totalQuantity: items.reduce((s, it) => s + it.quantity, 0),
        subtotal: totalPrice,
        tax: tax,
        shipping: calculatedShippingFee,
        grandTotal: grandTotal
      });

      // Clear cart
      clearCart();
      toast.success('Order Accepted! Opening WhatsApp...');

      // Open WhatsApp click-to-chat
      openWhatsAppOrderUrl(rawMessage);

      // Open celebratory OrderSuccessModal showing "Order Accepted"
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

  // Full Page Order Complete State (Shows "Order Accepted")
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-[#f8f8f7] flex items-center justify-center py-16 px-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white p-10 md:p-12 rounded-[32px] shadow-2xl shadow-gray-200/50 text-center max-w-lg mx-auto border border-gray-100"
        >
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200"
          >
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </motion.div>

          <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full mb-3">
            Status: Order Accepted
          </span>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3 tracking-wide">
            Order Accepted!
          </h1>
          <p className="text-gray-500 mb-8 text-sm md:text-base leading-relaxed">
            Your order has been accepted. We will process and ship your items directly to your address.
          </p>

          <div className="bg-gray-50 py-3.5 px-6 rounded-2xl mb-8 border border-gray-200 inline-block">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Order Reference</span>
            <span className="text-base font-mono font-bold text-gray-900">
              #{completedOrderDetails?.orderNumber || `GS${Date.now().toString().slice(-8)}`}
            </span>
          </div>

          {/* WhatsApp Direct Action Button */}
          {completedOrderDetails?.whatsappMessage && (
            <button
              onClick={() => openWhatsAppOrderUrl(completedOrderDetails.whatsappMessage)}
              className="w-full mb-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-full transition-all duration-300 font-bold uppercase tracking-widest text-xs sm:text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>OPEN ON WHATSAPP</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
            </button>
          )}

          <button
            onClick={() => navigate('/products')}
            className="w-full bg-[#1A1918] hover:bg-[#004e38] text-white px-8 py-3.5 rounded-full transition-all duration-300 font-bold uppercase tracking-widest text-xs shadow-md cursor-pointer"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f7] font-sans pb-20">
      {/* Header */}
      <div className="pt-16 sm:pt-20 pb-8 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
            <span>WhatsApp Order Booking</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-normal text-luxury-charcoal mb-2 tracking-wide">
            Book Your Order
          </h1>
          <p className="text-gray-500 font-medium text-sm md:text-base">
            Enter your delivery address to place your order directly via WhatsApp
          </p>
        </motion.div>
      </div>

      {/* Main Checkout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Delivery Address Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>Delivery Address</span>
                  </h2>
                  <p className="text-xs text-gray-500">
                    Fill in your address below. Once filled, your order will be instantly booked and accepted!
                  </p>
                </div>

                {/* Saved Addresses Picker (if available) */}
                {user && user.addresses && user.addresses.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Select From Saved Addresses
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {user.addresses.map((addr: any) => {
                        const isSelected = formData.address === addr.address && formData.zipCode === addr.zipCode;
                        return (
                          <button
                            key={addr.id}
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
                            className={`text-left p-3 rounded-xl border text-xs transition-all duration-200 bg-white ${
                              isSelected 
                                ? 'border-emerald-600 ring-2 ring-emerald-500/10 shadow-xs' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <p className="font-bold text-gray-900 truncate">{addr.address}</p>
                            <p className="text-gray-500 text-[11px] mt-0.5">{addr.city}, {addr.state} - {addr.zipCode}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Delivery Address (Street / Flat / House) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Delivery Address (Flat / House No., Street, Landmark) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      required
                      rows={3}
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900 text-sm outline-none resize-none"
                      placeholder="e.g. Flat 402, Sai Residency, 4th Cross Road, Near City Center"
                    />
                  </div>

                  {/* PIN Code & Phone Number in 2 columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        PIN Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        maxLength={6}
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        onBlur={handleZipCodeBlur}
                        className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900 text-sm outline-none"
                        placeholder="6-digit PIN Code"
                      />
                      {serviceability.loading && (
                        <div className="text-[11px] text-emerald-700 flex items-center gap-1.5 mt-1 font-medium">
                          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></span>
                          Checking delivery serviceability...
                        </div>
                      )}
                      {serviceability.checked && (
                        <div className={`text-[11px] mt-1 font-semibold flex items-center gap-1.5 p-1.5 rounded-lg border ${
                          serviceability.serviceable
                            ? "text-emerald-800 bg-emerald-50 border-emerald-200"
                            : "text-amber-800 bg-amber-50 border-amber-200"
                        }`}>
                          <Truck className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {serviceability.serviceable
                              ? `Delivery available via ${serviceability.provider || "Delhivery"}`
                              : "Standard shipping available"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Mobile / WhatsApp Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900 text-sm outline-none"
                          placeholder="10-digit mobile number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* City and State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900 text-sm outline-none"
                        placeholder="City"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900 text-sm outline-none"
                        placeholder="State"
                      />
                    </div>
                  </div>

                  {/* Optional Contact Name and Delivery Instructions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center justify-between">
                        <span>Your Name (Optional)</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900 text-sm outline-none"
                          placeholder="Contact person name (optional)"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Delivery Notes (Optional)
                      </label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900 text-sm outline-none"
                          placeholder="Any special instructions"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Booking Banner & Submit Button */}
                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900">
                    <MessageCircle className="w-5 h-5 text-[#25D366] fill-[#25D366] shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <p className="font-bold text-emerald-950">Instant Order Booking via WhatsApp</p>
                      <p className="text-emerald-800 text-[11px] mt-0.5">
                        Your order is saved and automatically accepted. Clicking below launches WhatsApp with your pre-filled order receipt.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={processingPayment}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 px-6 rounded-2xl font-bold uppercase tracking-wider text-sm md:text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    {processingPayment ? (
                      <span className="flex items-center gap-2">
                        <Loader className="animate-spin" size={18} /> Booking Order...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 fill-current" />
                        <span>BOOK ORDER ON WHATSAPP • ₹{grandTotal.toFixed(2)}</span>
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-8 sticky top-24 space-y-6"
            >
              <h2 className="text-xl font-serif font-bold text-gray-900 flex items-center tracking-wide">
                <ShoppingBag className="w-5 h-5 mr-3 text-gray-400" />
                Order Summary ({items.reduce((s, it) => s + it.quantity, 0)} Items)
              </h2>
              
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pt-3 first:pt-0">
                    <div className="w-16 h-16 bg-[#f8f8f7] rounded-xl flex items-center justify-center p-1 border border-gray-100 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-xs truncate">{item.name}</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                      {item.selectedSize && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded mr-1">
                          {item.selectedSize}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-gray-900 text-xs">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-gray-900">
                    {calculatedShippingFee === 0 ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      `₹${calculatedShippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes (18% GST)</span>
                  <span className="font-bold text-gray-900">₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-900">Grand Total</span>
                  <span className="font-serif font-black text-xl text-[#004e38]">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-3 text-[11px] text-gray-500">
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-emerald-600 shrink-0" />
                  <span>Insured Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-emerald-600 shrink-0" />
                  <span>Order Protected</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* BEFORE FOOTER: Why Shop With Ghar Sansar */}
      <div className="border-t border-gray-200 mt-12 bg-white relative overflow-hidden py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">Why Shop With Ghar Sansar</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">Experience a new standard of luxury shopping delivered straight to your home.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#FAF9F6] border border-gray-100 rounded-2xl p-6 text-center">
              <Star className="w-6 h-6 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-1">Premium Quality</h3>
              <p className="text-xs text-gray-500">Curated collections of the highest grade materials.</p>
            </div>
            <div className="bg-[#FAF9F6] border border-gray-100 rounded-2xl p-6 text-center">
              <Truck className="w-6 h-6 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-1">Fast Delivery</h3>
              <p className="text-xs text-gray-500">Insured courier dispatch across AP & Telangana.</p>
            </div>
            <div className="bg-[#FAF9F6] border border-gray-100 rounded-2xl p-6 text-center">
              <Award className="w-6 h-6 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-1">Trusted Decor</h3>
              <p className="text-xs text-gray-500">Over a decade of styling premium homes.</p>
            </div>
            <div className="bg-[#FAF9F6] border border-gray-100 rounded-2xl p-6 text-center">
              <Headphones className="w-6 h-6 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-1">WhatsApp Assistance</h3>
              <p className="text-xs text-gray-500">Instant tracking and personal styling support.</p>
            </div>
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
