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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-poppins selection:bg-[#F7EBE4] selection:text-[#7D3219]">
      <div 
        className="bg-white rounded-xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-[#E8E2D8] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title & Subtitle */}
        <div className="mb-6 pb-4 border-b border-[#E8E2D8]">
          <span className="text-[10px] sm:text-[11px] font-medium tracking-[0.22em] text-[#7D3219] uppercase font-sans mb-1 block">
            Profile Completion
          </span>
          <h2 className="text-xl sm:text-2xl font-normal text-gray-950 tracking-tight font-poppins">
            Add Shipping Address
          </h2>
          <p className="text-xs text-[#736B63] mt-1 font-normal">
            Please provide your delivery contact and address details to complete your profile.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-md bg-[#FDF2F0] border border-[#F5C2B8] text-[#9E2A1C] text-xs font-normal">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: First Name & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-800 mb-1.5">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-md text-xs sm:text-sm font-normal text-gray-950 placeholder-[#9E8E81] focus:outline-none focus:border-[#7D3219] focus:ring-1 focus:ring-[#7D3219] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-800 mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-md text-xs sm:text-sm font-normal text-gray-950 placeholder-[#9E8E81] focus:outline-none focus:border-[#7D3219] focus:ring-1 focus:ring-[#7D3219] transition-all"
              />
            </div>
          </div>

          {/* Row 2: Street Address */}
          <div>
            <label className="block text-xs font-medium text-gray-800 mb-1.5">
              Street Address
            </label>
            <input
              type="text"
              required
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-md text-xs sm:text-sm font-normal text-gray-950 placeholder-[#9E8E81] focus:outline-none focus:border-[#7D3219] focus:ring-1 focus:ring-[#7D3219] transition-all"
            />
          </div>

          {/* Row 3: City & State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-800 mb-1.5">
                City
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-md text-xs sm:text-sm font-normal text-gray-950 placeholder-[#9E8E81] focus:outline-none focus:border-[#7D3219] focus:ring-1 focus:ring-[#7D3219] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-800 mb-1.5">
                State
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-md text-xs sm:text-sm font-normal text-gray-950 placeholder-[#9E8E81] focus:outline-none focus:border-[#7D3219] focus:ring-1 focus:ring-[#7D3219] transition-all"
              />
            </div>
          </div>

          {/* Row 4: Zip/Postal Code & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-800 mb-1.5">
                Zip / Postal Code
              </label>
              <input
                type="text"
                required
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-md text-xs sm:text-sm font-normal text-gray-950 placeholder-[#9E8E81] focus:outline-none focus:border-[#7D3219] focus:ring-1 focus:ring-[#7D3219] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-800 mb-1.5">
                Mobile Phone (10 Digits)
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit number"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-md text-xs sm:text-sm font-normal text-gray-950 placeholder-[#9E8E81] focus:outline-none focus:border-[#7D3219] focus:ring-1 focus:ring-[#7D3219] transition-all"
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
              className="w-4 h-4 rounded-xs border-2 border-black accent-black cursor-pointer"
            />
            <label 
              htmlFor="setDefaultShippingGoogle" 
              className="text-xs font-normal text-gray-700 cursor-pointer select-none"
            >
              Set as default shipping address
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex justify-end items-center gap-3 border-t border-[#E8E2D8]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 bg-[#FAF7F2] hover:bg-white text-gray-950 border border-[#E8E2D8] hover:border-[#D9B4A4] rounded-md text-xs sm:text-sm font-normal transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] hover:border-[#7D3219] rounded-md text-xs sm:text-sm font-medium transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoogleShippingAddressModal;
