import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { motion } from "framer-motion";
import { Mail, Lock, User, Smartphone, CheckCircle, Circle, Eye, EyeOff, KeyRound, RefreshCw } from "lucide-react";
import { GoogleShippingAddressModal } from "../components/GoogleShippingAddressModal";

const passwordChecks = [
  { name: "min8", test: (v: string) => v.length >= 8, label: "At least 8 characters" },
  { name: "upper", test: (v: string) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { name: "lower", test: (v: string) => /[a-z]/.test(v), label: "One lowercase letter" },
  { name: "number", test: (v: string) => /\d/.test(v), label: "One number" }
];

const isValidPhone = (val: string) => /^\d{10}$/.test(val);
const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpMessage, setOtpMessage] = useState("");
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first box when OTP is sent
  useEffect(() => {
    if (otpSent && otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [otpSent]);

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

  // OTP Countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

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
      setOtpCountdown(res.expiresInSeconds ? 45 : 45);
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

  // Reset inactivity timer on user events
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (user) {
        logout();
        alert("Logged out");
        navigate("/login"); // Ensure user is navigated to login after logout
      }
    }, AUTO_LOGOUT_TIME);
  };

  // Setup inactivity listeners and timer
  useEffect(() => {
    if (!user) return; // Only track inactivity if logged in

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
      if (user.role?.toLowerCase() === "admin") {
        navigate("/admin");
      } else {
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
          navigate(from || "/", { replace: true });
        } else {
          setError("Invalid credentials");
        }
      } else {
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

        const success = await register(
          formData.name,
          formData.email,
          formData.password,
          formData.phone
        );
        if (success) {
          navigate(from || "/", { replace: true });
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="#" className="flex justify-center items-center space-x-2 mb-4">
          {/* <span className="text-2xl font-bold text-gray-900">GHAR SANSAR</span> */}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10"
        >
          <div className="flex justify-center mb-2">
            <img
              src="/ghar sansar logo.svg"
              alt="Ghar Sansar Logo"
              className="w-40 h-45"
            />
          </div>
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {isLogin ? (loginMethod === "otp" ? "Sign In with OTP" : "Sign In") : "Create Account"}
            </h2>
            <p className="mt-2 text-gray-600 text-sm">
              {isLogin
                ? (loginMethod === "otp"
                    ? "Passwordless login with a 6-digit code sent to your email"
                    : "Welcome back! Please enter your details")
                : "Join our community today"}
            </p>
          </div>

          {/* Login Method Tabs */}
          {isLogin && (
            <div className="flex border border-gray-200 rounded-lg p-1 bg-gray-50 mb-6">
              <button
                type="button"
                onClick={() => { setLoginMethod("password"); setError(""); }}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                  loginMethod === "password"
                    ? "bg-white text-gray-900 shadow-xs border border-gray-100"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod("otp"); setError(""); }}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  loginMethod === "otp"
                    ? "bg-[#0a2e22] text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Email OTP
              </button>
            </div>
          )}

          {isLogin && loginMethod === "otp" ? (
            <div className="space-y-5">
              {!otpSent ? (
                <div>
                  <label htmlFor="otpEmail" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="otpEmail"
                      type="email"
                      required
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-[#0a2e22] focus:border-[#0a2e22] text-sm"
                      placeholder="Enter your email (e.g. name@gmail.com)"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    A secure 6-digit verification code will be sent to your Gmail inbox.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700">
                      Enter 6-Digit Code
                    </label>
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtpCode(""); setError(""); }}
                      className="text-xs text-[#0a2e22] hover:underline font-semibold cursor-pointer"
                    >
                      Change Email
                    </button>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between items-center gap-2 sm:gap-2.5 py-1">
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
                            className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all duration-150 outline-none select-none
                              placeholder:text-gray-300 placeholder:text-2xl placeholder:font-normal
                              ${digit
                                ? "border-[#0a2e22] text-[#0a2e22] bg-[#f0f7f4] shadow-sm"
                                : "border-gray-200 text-gray-800 bg-white hover:border-gray-300 focus:border-[#0a2e22] focus:ring-2 focus:ring-[#0a2e22]/20"
                              }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  {otpMessage && (
                    <p className="mt-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded p-2 text-center">
                      {otpMessage}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Didn't receive code?</span>
                    {otpCountdown > 0 ? (
                      <span className="text-gray-400 font-medium">Resend in {otpCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={loading}
                        className="text-[#0a2e22] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Resend Code
                      </button>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              <div>
                <button
                  type="button"
                  onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-full shadow-sm text-xs font-bold uppercase tracking-widest text-white bg-[#0a2e22] hover:bg-[#061d15] focus:outline-none disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {loading ? "Please wait..." : !otpSent ? "Send Verification Code" : "Verify & Sign In"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <>
              {isLogin ? (
                <>
                    <div>
                      <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700">
                        Email or Phone
                      </label>
                      <div className="mt-1 relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          id="emailOrPhone"
                          name="emailOrPhone"
                          type="text"
                          required
                          value={formData.emailOrPhone}
                          onChange={handleInputChange}
                          className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your email or phone"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <div className="mt-1 relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <div className="mt-1 relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <div className="mt-1 relative">
                        <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                          className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your 10-digit phone"
                        />
                      </div>
                      {formData.phone && !isValidPhone(formData.phone) && (
                        <span className="text-xs text-red-500">Phone number must be exactly 10 digits.</span>
                      )}
                    </div>
                  </>
                )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {!isLogin && (
                  <ul className="mt-2 space-y-1 text-xs">
                    {passwordValidations.map((c) => (
                      <li key={c.name} className="flex items-center">
                        {c.valid ? (
                          <CheckCircle className="text-green-600 w-4 h-4 mr-1" />
                        ) : (
                          <Circle className="text-gray-300 w-4 h-4 mr-1" />
                        )}
                        <span className={c.valid ? "text-green-700" : "text-gray-500"}>
                          {c.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        formData.confirmPassword && (passwordsMatch ? "border-green-400" : "border-red-400")
                      }`}
                      placeholder="Re-enter your password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && !passwordsMatch && (
                    <span className="text-xs text-red-500">Passwords do not match.</span>
                  )}
                </div>
              )}

                {error && (
                  <div className="text-red-600 text-sm text-center">{error}</div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-full shadow-sm text-xs font-bold uppercase tracking-widest text-white bg-luxury-charcoal hover:bg-luxury-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-luxury-gold/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                  </button>
                </div>
              </>
            </form>
          )}

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 mb-6">
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
              className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-full shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none disabled:opacity-50 cursor-pointer"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5 mr-2" />
              Sign in with Google
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setLoginMethod("password");
              }}
              className="text-xs uppercase tracking-wider text-luxury-gold hover:text-luxury-charcoal font-bold cursor-pointer"
            >
              {isLogin
                ? "Don't have an account? Register"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Google Login Shipping Address Modal matching Image 3 */}
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
