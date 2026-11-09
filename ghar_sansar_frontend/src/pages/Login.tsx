import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import { GoogleShippingAddressModal } from "../components/GoogleShippingAddressModal";

const passwordChecks = [
  { name: "min8", test: (v: string) => v.length >= 8, label: "At least 8 characters" },
  { name: "upper", test: (v: string) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { name: "lower", test: (v: string) => /[a-z]/.test(v), label: "One lowercase letter" },
  { name: "number", test: (v: string) => /\d/.test(v), label: "One number" }
];

const isValidPhone = (val: string) => /^\d{10}$/.test(val);
const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // 30 minutes

interface LoginProps {
  initialIsRegister?: boolean;
}

const Login: React.FC<LoginProps> = ({ initialIsRegister = false }) => {
  const [isLogin, setIsLogin] = useState(!initialIsRegister);
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpMessage, setOtpMessage] = useState("");
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Registration OTP states
  const [registerOtpSent, setRegisterOtpSent] = useState(false);
  const [registerOtpCode, setRegisterOtpCode] = useState("");
  const [registerOtpCountdown, setRegisterOtpCountdown] = useState(0);
  const [registerOtpMessage, setRegisterOtpMessage] = useState("");
  const registerOtpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    emailOrPhone: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login, register, sendOtp, verifyOtp, loginWithGoogle, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "";

  // Auto-focus first digit box when registration OTP is sent
  useEffect(() => {
    if (registerOtpSent && registerOtpInputRefs.current[0]) {
      setTimeout(() => {
        registerOtpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [registerOtpSent]);

  // Countdown timer for registration OTP resend
  useEffect(() => {
    if (registerOtpCountdown <= 0) return;
    const timer = setInterval(() => {
      setRegisterOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [registerOtpCountdown]);

  const handleRegisterOtpDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (cleaned.length > 1) {
      const newFullCode = (cleaned + registerOtpCode.slice(cleaned.length)).slice(0, 6);
      setRegisterOtpCode(newFullCode);
      const nextIdx = Math.min(newFullCode.length, 5);
      registerOtpInputRefs.current[nextIdx]?.focus();
      return;
    }

    const currentArr = (registerOtpCode + "      ").slice(0, 6).split("");
    currentArr[index] = cleaned || " ";
    const newCode = currentArr.join("").trimEnd();
    setRegisterOtpCode(newCode);

    if (cleaned && index < 5) {
      registerOtpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleRegisterOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if ((!registerOtpCode[index] || registerOtpCode[index] === " ") && index > 0) {
        registerOtpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      registerOtpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      registerOtpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleRegisterOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasteData) {
      setRegisterOtpCode(pasteData);
      const nextIdx = Math.min(pasteData.length, 5);
      registerOtpInputRefs.current[nextIdx]?.focus();
    }
  };

  const handleResendRegisterOtp = async () => {
    if (registerOtpCountdown > 0 || loading) return;
    setError("");
    setLoading(true);
    const res = await sendOtp(formData.email.trim(), "registration");
    setLoading(false);
    if (res.success) {
      setRegisterOtpCountdown(45);
      setRegisterOtpMessage(`A fresh verification code has been sent to ${formData.email.trim()}`);
    } else {
      setError(res.error || "Failed to resend verification code.");
    }
  };

  // Auto-focus first box when login OTP is sent
  useEffect(() => {
    if (otpSent && otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [otpSent]);

  // Login OTP Countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const handleOtpDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (cleaned.length > 1) {
      const newFullCode = (cleaned + otpCode.slice(cleaned.length)).slice(0, 6);
      setOtpCode(newFullCode);
      const nextIdx = Math.min(newFullCode.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
      return;
    }

    const currentArr = (otpCode + "      ").slice(0, 6).split("");
    currentArr[index] = cleaned || " ";
    const newCode = currentArr.join("").trimEnd();
    setOtpCode(newCode);

    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if ((!otpCode[index] || otpCode[index] === " ") && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasteData) {
      setOtpCode(pasteData);
      const nextIdx = Math.min(pasteData.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const emailToUse = otpEmail.trim();
    if (!emailToUse || !isEmail(emailToUse)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);
    const res = await sendOtp(emailToUse);
    setLoading(false);
    if (res.success) {
      setOtpSent(true);
      setOtpCountdown(45);
      setOtpMessage(res.message || "Verification code sent to your email!");
    } else {
      setError(res.error || "Failed to send verification code");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setError("Please enter the 6-digit OTP code");
      return;
    }
    setError("");
    setLoading(true);
    const res = await verifyOtp(otpEmail.trim(), cleanCode);
    setLoading(false);
    if (res.success) {
      const stored = localStorage.getItem("user");
      let loggedUser: any = null;
      try {
        loggedUser = stored ? JSON.parse(stored) : null;
      } catch (e) { }

      const isUserAdmin = Boolean(
        (loggedUser?.role && loggedUser.role.toLowerCase() === "admin") ||
        (loggedUser?.email && (loggedUser.email.toLowerCase() === "gharsansarshop@gmail.com" || loggedUser.email.toLowerCase() === "gharsansarwebsite@gmail.com")) ||
        otpEmail.trim().toLowerCase() === "gharsansarshop@gmail.com" ||
        otpEmail.trim().toLowerCase() === "gharsansarwebsite@gmail.com"
      );

      if (isUserAdmin) {
        navigate("/admin", { replace: true });
        return;
      }

      if (res.isProfileIncomplete) {
        setShowAddressModal(true);
      } else {
        navigate(from || "/", { replace: true });
      }
    } else {
      setError(res.error || "Invalid or expired OTP");
    }
  };

  const passwordValidations = passwordChecks.map((item) => ({
    ...item,
    valid: item.test(formData.password)
  }));

  const passwordsMatch =
    !isLogin && formData.password && formData.confirmPassword
      ? formData.password === formData.confirmPassword
      : true;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset inactivity timer
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (user) {
        logout();
        alert("Logged out due to inactivity");
        navigate("/login");
      }
    }, AUTO_LOGOUT_TIME);
  };

  useEffect(() => {
    if (!user) return;
    const events = ["mousemove", "mousedown", "click", "scroll", "keypress", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [user, logout, navigate]);

  useEffect(() => {
    if (user && !showAddressModal) {
      const isUserAdmin = Boolean(
        (user.role && user.role.toLowerCase() === "admin") ||
        (user.email && (user.email.toLowerCase() === "gharsansarshop@gmail.com" || user.email.toLowerCase() === "gharsansarwebsite@gmail.com"))
      );

      if (isUserAdmin) {
        navigate("/admin", { replace: true });
        return;
      }

      const hasPhone = Boolean(user.phone && String(user.phone).trim().length >= 10);
      const hasAddress = Boolean(
        (user.street_address && String(user.street_address).trim().length > 0) ||
        (user.addresses && user.addresses.length > 0 && (user.addresses[0].address || user.addresses[0].street_address))
      );
      if (!hasPhone || !hasAddress) {
        setShowAddressModal(true);
      } else {
        navigate(from || "/");
      }
    }
  }, [user, navigate, from, showAddressModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const input = formData.emailOrPhone.trim();
        let email = "";
        let phone = "";

        if (isValidPhone(input)) {
          phone = input;
        } else if (isEmail(input)) {
          email = input;
        } else {
          setError("Please enter a valid email or 10-digit phone number");
          setLoading(false);
          return;
        }

        const success = await login(email || phone, formData.password);
        if (success) {
          const stored = localStorage.getItem("user");
          let loggedUser: any = null;
          try {
            loggedUser = stored ? JSON.parse(stored) : null;
          } catch (e) { }

          const cleanEnteredEmail = (email || "").trim().toLowerCase();
          const isUserAdmin = Boolean(
            (loggedUser?.role && loggedUser.role.toLowerCase() === "admin") ||
            (loggedUser?.email && (loggedUser.email.toLowerCase() === "gharsansarshop@gmail.com" || loggedUser.email.toLowerCase() === "gharsansarwebsite@gmail.com")) ||
            cleanEnteredEmail === "gharsansarshop@gmail.com" ||
            cleanEnteredEmail === "gharsansarwebsite@gmail.com"
          );

          if (isUserAdmin) {
            navigate("/admin", { replace: true });
          } else {
            navigate(from || "/", { replace: true });
          }
        } else {
          setError("Invalid email, phone, or password.");
        }
      } else {
        // REGISTRATION FLOW
        if (registerOtpSent) {
          const cleanCode = registerOtpCode.trim();
          if (!cleanCode || cleanCode.length !== 6) {
            setError("Please enter the complete 6-digit verification code");
            setLoading(false);
            return;
          }

          const res = await register(
            formData.name.trim(),
            formData.email.trim(),
            formData.password,
            formData.phone.trim(),
            cleanCode
          );

          if (res.success) {
            navigate(from || "/", { replace: true });
          } else {
            setError(res.error || "Verification failed. Invalid or expired OTP.");
          }
          setLoading(false);
          return;
        }

        if (!formData.name.trim()) {
          setError("Please enter your full name");
          setLoading(false);
          return;
        }

        if (!formData.email.trim() || !isEmail(formData.email.trim())) {
          setError("Please enter a valid email address");
          setLoading(false);
          return;
        }

        if (!isValidPhone(formData.phone)) {
          setError("Phone number must be exactly 10 digits");
          setLoading(false);
          return;
        }

        if (passwordValidations.some((c) => !c.valid) || !passwordsMatch) {
          setError(
            !passwordsMatch
              ? "Passwords do not match"
              : "Password does not meet all conditions"
          );
          setLoading(false);
          return;
        }

        const res = await sendOtp(formData.email.trim(), "registration");
        if (res.success) {
          setRegisterOtpSent(true);
          setRegisterOtpCountdown(45);
          setRegisterOtpCode("");
          setRegisterOtpMessage(`Verification code sent to ${formData.email.trim()}`);
        } else {
          setError(res.error || "Failed to send verification code. Please try again.");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen pt-16 pb-8 flex items-center justify-center p-4 sm:p-6 font-poppins selection:bg-[#F7EBE4] selection:text-[#7D3219] antialiased">
      <div className="w-full max-w-[740px]">

          {/* Compact, Perfectly Proportioned Editorial Card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="bg-white rounded-2xl border border-[#E8E2D8] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-2"
          >
            {/* Left Column: Atmospheric Architectural Visual (Equal 50% split) */}
            <div className="hidden lg:relative lg:flex flex-col justify-between p-7 text-white overflow-hidden bg-neutral-950 select-none">
              <img
                src="/images/sunlit_luxe_temple_lounge.png"
                alt="Ghar Sansar Interiors"
                className="absolute inset-0 w-full h-full object-cover opacity-85 transition-transform duration-1000 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />

              <div className="relative z-10">
                <span className="inline-block px-2.5 py-0.5 bg-white/15 backdrop-blur-md rounded-full text-[8.5px] font-semibold tracking-[0.24em] uppercase text-white/95 border border-white/20">
                  Homes • Décor • Lifestyle
                </span>
              </div>

              <div className="relative z-10">
                <h3 className="font-serif text-lg lg:text-xl font-normal leading-snug tracking-tight text-white mb-2">
                  Elevating spaces with timeless craftsmanship.
                </h3>
                <p className="text-[11px] text-white/75 font-light leading-relaxed">
                  Discover artisanal home accents, auspicious celebration gifts, and bespoke turnkey interior services.
                </p>
              </div>
            </div>

            {/* Right Column: Tailored Luxury Form */}
            <div className="p-6 sm:p-7 lg:p-8 flex flex-col justify-center">

              {/* Header */}
              <div className="mb-6 text-center">
                <h1 className="text-2xl sm:text-3xl font-poppins font-normal text-gray-950 tracking-tight text-center">
                  {isLogin
                    ? (loginMethod === "otp" ? "Sign In with OTP" : "Sign In")
                    : (registerOtpSent ? "Verify Email" : "Create Account")}
                </h1>
              </div>

                  {/* Error Alert */}
                  {error && (
                    <div className="mb-3.5 p-2 rounded-md bg-[#FDF2F0] border border-[#F5C2B8] text-[#9E2A1C] text-[11px] font-normal">
                      {error}
                    </div>
                  )}

                  {/* Forms */}
                  {isLogin && loginMethod === "otp" ? (
                    /* OTP Login Flow */
                    <div className="space-y-3">
                      {!otpSent ? (
                        <div>
                          <label htmlFor="otpEmail" className="block text-[10px] font-medium tracking-wide uppercase text-neutral-600 mb-1">
                            Email address
                          </label>
                          <input
                            id="otpEmail"
                            type="email"
                            required
                            value={otpEmail}
                            onChange={(e) => setOtpEmail(e.target.value)}
                            className="w-full h-10 px-3 bg-[#FAF9F7]/60 hover:bg-white focus:bg-white border border-[#E2DDD5] focus:border-[#C26847] rounded-md text-xs sm:text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#C26847] transition-all"
                            placeholder="name@example.com"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-[10px] font-medium tracking-wide uppercase text-neutral-600">
                              Enter 6-digit code
                            </label>
                            <button
                              type="button"
                              onClick={() => { setOtpSent(false); setOtpCode(""); setError(""); }}
                              className="text-[11px] text-[#C26847] hover:underline cursor-pointer"
                            >
                              Change email
                            </button>
                          </div>

                          <div className="flex justify-between items-center gap-1.5 py-0.5">
                            {[0, 1, 2, 3, 4, 5].map((index) => {
                              const digit = otpCode[index] && otpCode[index] !== " " ? otpCode[index] : "";
                              return (
                                <input
                                  key={index}
                                  ref={(el) => (otpInputRefs.current[index] = el)}
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                  onPaste={handleOtpPaste}
                                  placeholder="•"
                                  className={`w-9 sm:w-10 h-10 text-center text-base font-medium rounded-md border transition-all duration-150 outline-none
                              ${digit
                                      ? "border-[#8B3A22] text-[#8B3A22] bg-[#F7EBE4]/40 ring-1 ring-[#8B3A22]"
                                      : "border-[#E2DDD5] text-neutral-900 bg-white hover:border-neutral-400 focus:border-[#8B3A22] focus:ring-1 focus:ring-[#8B3A22]"
                                        ? "border-[#C26847] text-[#C26847] bg-[#F7EBE4]/40 ring-1 ring-[#C26847]"
                                        : "border-[#E2DDD5] text-neutral-900 bg-white hover:border-neutral-400 focus:border-[#C26847] focus:ring-1 focus:ring-[#C26847]"
                                    }`}
                                />
                              );
                            })}
                          </div>

                          {otpMessage && (
                            <div className="p-1.5 rounded-md bg-[#FAF7F2] border border-[#E8E2D8] text-neutral-700 text-[11px] text-center">
                              {otpMessage}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[11px] pt-0.5">
                            <span className="text-neutral-500">Didn't receive code?</span>
                            {otpCountdown > 0 ? (
                              <span className="text-neutral-400 font-medium">Resend in {otpCountdown}s</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSendOtp()}
                                disabled={loading}
                                className="text-[#C26847] hover:underline font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <RefreshCw className="w-3 h-3" />
                                Resend code
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="pt-0.5">
                        <button
                          type="button"
                          onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                          disabled={loading}
                          className="w-full h-10 bg-[#C26847] hover:bg-[#B05B3C] active:bg-[#5C2312] text-white font-medium text-xs tracking-widest uppercase rounded-md shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {loading ? "Please wait..." : !otpSent ? "Send Verification Code" : "Verify & Sign In"}
                        </button>
                      </div>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => { setLoginMethod("password"); setError(""); setOtpSent(false); }}
                          className="text-[11px] text-neutral-600 hover:text-neutral-900 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          Sign in with password instead
                        </button>
                      </div>
                    </div>
                  ) : (!isLogin && registerOtpSent) ? (
                    /* Registration OTP Verification */
                    <div className="space-y-3">
                      <div className="bg-[#FAF7F2] border border-[#E8E2D8] rounded-md p-2.5 text-center">
                        <p className="text-[11px] text-neutral-600">
                          Verification code dispatched to:
                        </p>
                        <div className="mt-0.5 inline-flex items-center gap-2 text-xs text-neutral-900 font-medium">
                          <span>{formData.email}</span>
                          <button
                            type="button"
                            onClick={() => { setRegisterOtpSent(false); setRegisterOtpCode(""); setError(""); }}
                            className="text-[#C26847] underline text-[10px] cursor-pointer"
                          >
                            Change
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium tracking-wide uppercase text-neutral-600 mb-1">
                          Enter 6-digit code
                        </label>
                        <div className="flex justify-between items-center gap-1.5 py-0.5">
                          {[0, 1, 2, 3, 4, 5].map((index) => {
                            const digit = registerOtpCode[index] && registerOtpCode[index] !== " " ? registerOtpCode[index] : "";
                            return (
                              <input
                                key={index}
                                ref={(el) => (registerOtpInputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleRegisterOtpDigitChange(index, e.target.value)}
                                onKeyDown={(e) => handleRegisterOtpKeyDown(index, e)}
                                onPaste={handleRegisterOtpPaste}
                                placeholder="•"
                                className={`w-9 sm:w-10 h-10 text-center text-base font-medium rounded-md border transition-all duration-150 outline-none
                            ${digit
                                    ? "border-[#8B3A22] text-[#8B3A22] bg-[#F7EBE4]/40 ring-1 ring-[#8B3A22]"
                                    : "border-[#E2DDD5] text-neutral-900 bg-white hover:border-neutral-400 focus:border-[#8B3A22] focus:ring-1 focus:ring-[#8B3A22]"
                                      ? "border-[#C26847] text-[#C26847] bg-[#F7EBE4]/40 ring-1 ring-[#C26847]"
                                      : "border-[#E2DDD5] text-neutral-900 bg-white hover:border-neutral-400 focus:border-[#C26847] focus:ring-1 focus:ring-[#C26847]"
                                  }`}
                              />
                            );
                          })}
                        </div>

                        {registerOtpMessage && (
                          <div className="mt-2 p-1.5 rounded-md bg-[#FAF7F2] border border-[#E8E2D8] text-neutral-700 text-[11px] text-center">
                            {registerOtpMessage}
                          </div>
                        )}

                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className="text-neutral-500">Didn't receive code?</span>
                          {registerOtpCountdown > 0 ? (
                            <span className="text-neutral-400 font-medium">Resend in {registerOtpCountdown}s</span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleResendRegisterOtp}
                              disabled={loading}
                              className="text-[#C26847] hover:underline font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Resend code
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="pt-0.5">
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={loading}
                          className="w-full h-10 bg-[#C26847] hover:bg-[#B05B3C] active:bg-[#5C2312] text-white font-medium text-xs tracking-widest uppercase rounded-md shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {loading ? "Creating..." : "Complete Registration"}
                        </button>
                      </div>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => { setRegisterOtpSent(false); setError(""); }}
                          className="text-[11px] text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          Back to registration details
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Standard Password Sign In OR Registration Input */
                    <form onSubmit={handleSubmit} className="space-y-3">
                      {isLogin ? (
                        <div>
                          <label htmlFor="emailOrPhone" className="block text-[10px] font-medium tracking-wide uppercase text-neutral-600 mb-1">
                            Email or Mobile Number
                          </label>
                          <input
                            id="emailOrPhone"
                            name="emailOrPhone"
                            type="text"
                            required
                            value={formData.emailOrPhone}
                            onChange={handleInputChange}
                            className="w-full h-10 px-3 bg-[#FAF9F7]/60 hover:bg-white focus:bg-white border border-[#E2DDD5] focus:border-[#C26847] rounded-md text-xs sm:text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#C26847] transition-all"
                            placeholder="e.g. name@example.com or 10-digit mobile"
                          />
                        </div>
                      ) : (
                        <>
                          <div>
                            <label htmlFor="name" className="block text-[10px] font-medium tracking-wide uppercase text-neutral-600 mb-1">
                              Full Name
                            </label>
                            <input
                              id="name"
                              name="name"
                              type="text"
                              required
                              value={formData.name}
                              onChange={handleInputChange}
                              className="w-full h-10 px-3 bg-[#FAF9F7]/60 hover:bg-white focus:bg-white border border-[#E2DDD5] focus:border-[#C26847] rounded-md text-xs sm:text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#C26847] transition-all"
                              placeholder="John Doe"
                            />
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-[10px] font-medium tracking-wide uppercase text-neutral-600 mb-1">
                              Email Address
                            </label>
                            <input
                              id="email"
                              name="email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full h-10 px-3 bg-[#FAF9F7]/60 hover:bg-white focus:bg-white border border-[#E2DDD5] focus:border-[#C26847] rounded-md text-xs sm:text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#C26847] transition-all"
                              placeholder="name@example.com"
                            />
                          </div>

                          <div>
                            <label htmlFor="phone" className="block text-[10px] font-medium tracking-wide uppercase text-neutral-600 mb-1">
                              Mobile Number (10 Digits)
                            </label>
                            <input
                              id="phone"
                              name="phone"
                              type="tel"
                              required
                              maxLength={10}
                              minLength={10}
                              pattern="[0-9]{10}"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full h-10 px-3 bg-[#FAF9F7]/60 hover:bg-white focus:bg-white border border-[#E2DDD5] focus:border-[#C26847] rounded-md text-xs sm:text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#C26847] transition-all"
                              placeholder="10-digit mobile number"
                            />
                            {formData.phone && !isValidPhone(formData.phone) && (
                              <span className="text-[10px] text-[#9E2A1C] mt-0.5 block">Phone number must be exactly 10 digits.</span>
                            )}
                          </div>
                        </>
                      )}

                      {/* Password Field */}
                      <div>
                        <label htmlFor="password" className="block text-[10px] font-medium tracking-wide uppercase text-neutral-600 mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full h-10 px-3 pr-10 bg-[#FAF9F7]/60 hover:bg-white focus:bg-white border border-[#E2DDD5] focus:border-[#C26847] rounded-md text-xs sm:text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#C26847] transition-all"
                            placeholder="Enter your password"
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                            onClick={() => setShowPassword((v) => !v)}
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Clean Helper Row Under Password */}
                        {isLogin && (
                          <div className="flex items-center justify-between text-xs pt-1">
                            <button
                              type="button"
                              onClick={() => { setLoginMethod("otp"); setError(""); setOtpEmail(formData.emailOrPhone); }}
                              className="text-[#C26847] hover:text-[#B05B3C] hover:underline font-medium text-[10.5px] cursor-pointer"
                            >
                              Sign in with OTP instead
                            </button>
                            <button
                              type="button"
                              onClick={() => { setLoginMethod("otp"); setError(""); }}
                              className="text-neutral-400 hover:text-neutral-700 text-[10.5px] cursor-pointer transition-colors"
                            >
                              Forgot password?
                            </button>
                          </div>
                        )}

                        {/* Password Checklist (Registration Only) */}
                        {!isLogin && (
                          <div className="mt-2 p-2 bg-[#FAF7F2] border border-[#E8E2D8] rounded-md">
                            <ul className="grid grid-cols-2 gap-1 text-[10px]">
                              {passwordValidations.map((c) => (
                                <li key={c.name} className="flex items-center gap-1.5">
                                  {c.valid ? (
                                    <CheckCircle2 className="text-[#C26847] w-3 h-3 shrink-0" />
                                  ) : (
                                    <Circle className="text-neutral-300 w-3 h-3 shrink-0" />
                                  )}
                                  <span className={c.valid ? "text-neutral-900 font-medium" : "text-neutral-500"}>
                                    {c.label}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password (Registration Only) */}
                      {!isLogin && (
                        <div>
                          <label htmlFor="confirmPassword" className="block text-[10px] font-medium tracking-wide uppercase text-neutral-600 mb-1">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              required
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className={`w-full h-10 px-3 pr-10 bg-[#FAF9F7]/60 hover:bg-white focus:bg-white border rounded-md text-xs sm:text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all ${formData.confirmPassword
                                ? passwordsMatch
                                  ? "border-[#E2DDD5] focus:border-[#8B3A22] focus:ring-1 focus:ring-[#8B3A22]"
                                    ? "border-[#E2DDD5] focus:border-[#C26847] focus:ring-1 focus:ring-[#C26847]"
                                    : "border-[#F5C2B8] focus:border-[#9E2A1C] focus:ring-1 focus:ring-[#9E2A1C]"
                                  : "border-[#E2DDD5] focus:border-[#8B3A22] focus:ring-1 focus:ring-[#8B3A22]"
                                : "border-[#E2DDD5] focus:border-[#C26847] focus:ring-1 focus:ring-[#C26847]"
                                }`}
                              placeholder="Re-enter your password"
                            />
                            <button
                              type="button"
                              tabIndex={-1}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                              onClick={() => setShowConfirmPassword((v) => !v)}
                            >
                              {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          {formData.confirmPassword && !passwordsMatch && (
                            <span className="text-[10px] text-[#9E2A1C] mt-0.5 block">Passwords do not match.</span>
                          )}
                        </div>
                      )}

                      {/* Luxury Action Button */}
                      <div className="pt-1">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full h-10 bg-[#C26847] hover:bg-[#B05B3C] active:bg-[#5C2312] text-white font-medium text-xs tracking-widest uppercase rounded-md shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Please wait...</span>
                            </div>
                          ) : isLogin ? (
                            "Sign In"
                          ) : (
                            "Continue"
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Social Divider & Google Button */}
                  {(!registerOtpSent || isLogin) && (
                    <>
                      <div className="relative my-3">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-[#E8E2D8]"></div>
                        </div>
                        <div className="relative flex justify-center text-[9px]">
                          <span className="px-3 bg-white text-neutral-400 uppercase tracking-widest">or</span>
                        </div>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={async () => {
                            setLoading(true);
                            const res = await loginWithGoogle();
                            setLoading(false);
                            if (res.success) {
                              if (res.isProfileIncomplete) {
                                setShowAddressModal(true);
                              } else {
                                navigate(from || "/", { replace: true });
                              }
                            }
                          }}
                          disabled={loading}
                          className="w-full h-10 flex justify-center items-center px-4 bg-white hover:bg-[#FAF9F7] border border-[#E2DDD5] hover:border-neutral-400 rounded-md text-xs font-normal text-neutral-700 transition shadow-2xs cursor-pointer disabled:opacity-50"
                        >
                          <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            className="h-3.5 w-3.5 mr-2"
                          />
                          <span>Continue with Google</span>
                        </button>
                      </div>
                    </>
                  )}

                  {/* Account Toggle */}
                  <div className="mt-3.5 pt-3 text-center border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setError("");
                        setRegisterOtpSent(false);
                        setRegisterOtpCode("");
                        setLoginMethod("password");
                      }}
                      className="text-[11px] text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                    >
                      {isLogin ? (
                        <>
                          Don't have an account?{" "}
                          <span className="text-[#C26847] font-semibold underline underline-offset-4 hover:text-[#B05B3C]">
                            Create an account
                          </span>
                        </>
                      ) : (
                        <>
                          Already have an account?{" "}
                          <span className="text-[#C26847] font-semibold underline underline-offset-4 hover:text-[#B05B3C]">
                            Sign in
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                  </div>
                </motion.div>
              </div>

              {/* Google Login Shipping Address Modal */}
              <GoogleShippingAddressModal
                isOpen={showAddressModal}
                onClose={() => {
                  setShowAddressModal(false);
                  navigate(from || "/", { replace: true });
                }}
                onSuccess={() => {
                  setShowAddressModal(false);
                  navigate(from || "/", { replace: true });
                }}
              />
            </div>
            );
};

            export default Login;
