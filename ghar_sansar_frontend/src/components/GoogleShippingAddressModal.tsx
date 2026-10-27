import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface GoogleShippingAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultFullName?: string;
  defaultEmail?: string;
}

export const GoogleShippingAddressModal: React.FC<GoogleShippingAddressModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultFullName = "",
  defaultEmail = ""
}) => {
  const { user, saveShippingAddress } = useAuth();

  const nameParts = (defaultFullName || user?.full_name || user?.name || "").trim().split(" ");
  const initialFirstName = nameParts[0] || "";
  const initialLastName = nameParts.slice(1).join(" ") || "";

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [streetAddress, setStreetAddress] = useState(user?.street_address || "");
  const [city, setCity] = useState(user?.city || "");
  const [state, setState] = useState(user?.state || "");
  const [zipCode, setZipCode] = useState(user?.pincode || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isDefault, setIsDefault] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!streetAddress.trim() || !city.trim() || !state.trim() || !zipCode.trim()) {
      setError("Please fill out all address details.");
      return;
    }

    setLoading(true);
    const res = await saveShippingAddress({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      streetAddress: streetAddress.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      phone: cleanPhone,
      isDefault
    });
    setLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || "Failed to save address. Please check your details.");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full p-7 md:p-8 shadow-2xl border border-gray-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title & Subtitle */}
        <div className="mb-6">
          <h2 className="font-serif text-2xl font-normal text-gray-900 tracking-tight">
            Add New Shipping Address
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Fill out the delivery contact and address details.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: First Name & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />
            </div>
          </div>

          {/* Row 2: Street Address */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Street Address
            </label>
            <input
              type="text"
              required
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
            />
          </div>

          {/* Row 3: City & State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                City
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                State
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />
            </div>
          </div>

          {/* Row 4: Zip/Postal Code & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Zip/Postal Code
              </label>
              <input
                type="text"
                required
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit number"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />
            </div>
          </div>

          {/* Default shipping checkbox */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="setDefaultShippingGoogle"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
            />
            <label 
              htmlFor="setDefaultShippingGoogle" 
              className="text-xs font-semibold text-gray-700 cursor-pointer select-none"
            >
              Set as default shipping address
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 border border-gray-200 text-gray-700 font-semibold text-xs uppercase tracking-wider rounded-full hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-2.5 bg-black text-white font-semibold text-xs uppercase tracking-wider rounded-full hover:bg-gray-800 transition shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoogleShippingAddressModal;
