import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import axios from "axios";
import { motion } from "framer-motion";
import { Lock, ExternalLink, AlertCircle, RefreshCw, Check } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_AWS_API_URL || "/api";
const DEFAULT_REDIRECT_URI = "gharsansar://auth/callback";

type AuthStep = "idle" | "authenticating" | "generating" | "redirecting" | "error";

export const MobileAuth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const rawRedirectUri = searchParams.get("redirect_uri");
  const redirectUri = (rawRedirectUri && rawRedirectUri.trim()) || DEFAULT_REDIRECT_URI;

  const [step, setStep] = useState<AuthStep>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [deepLinkUrl, setDeepLinkUrl] = useState<string>("");

  const hasAutoStarted = useRef(false);

  const startGoogleAuth = async () => {
    try {
      setStep("authenticating");
      setErrorMessage("");

      // 1. Google Provider with explicit account chooser
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account"
      });

      // 2. Google Popup authentication
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      if (!fbUser || !fbUser.email) {
        throw new Error("Unable to retrieve email from Google Account.");
      }

      // 3. Request temporary, short-lived one-time authorization code from Gharsansar backend
      setStep("generating");
      const res = await axios.post(`${BACKEND_URL}/auth/mobile-code`, {
        email: fbUser.email,
        name: fbUser.displayName || "Google User",
        full_name: fbUser.displayName || "Google User",
        firebase_uid: fbUser.uid,
        photo_url: fbUser.photoURL || ""
      });

      if (!res.data.success || !res.data.code) {
        throw new Error(res.data.error || "Failed to generate authorization code.");
      }

      const oneTimeCode = res.data.code;

      // 4. Construct safe deep link containing ONLY the temporary authorization code
      const separator = redirectUri.includes("?") ? "&" : "?";
      const targetDeepLink = `${redirectUri}${separator}code=${encodeURIComponent(oneTimeCode)}`;
      setDeepLinkUrl(targetDeepLink);
      setStep("redirecting");

      // 5. Trigger immediate redirect to the Android app
      setTimeout(() => {
        window.location.href = targetDeepLink;
      }, 400);

    } catch (err: any) {
      console.error("[MobileAuth] Google Authentication Error:", err);
      setStep("error");

      const code = err?.code || "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setErrorMessage("Google sign-in was cancelled. Tap below to select your Google account.");
      } else if (code === "auth/popup-blocked") {
        setErrorMessage("Popup was blocked by your browser. Please tap 'Continue with Google' below.");
      } else if (code === "auth/network-request-failed") {
        setErrorMessage("Network error connecting to Google. Please check your internet connection.");
      } else {
        setErrorMessage(err?.response?.data?.error || err?.message || "Authentication failed. Please try again.");
      }
    }
  };

  // Attempt auto-start on mount if supported
  useEffect(() => {
    if (!hasAutoStarted.current) {
      hasAutoStarted.current = true;
      const timer = setTimeout(() => {
        startGoogleAuth();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <main className="min-h-[100dvh] bg-[#FAF8F5] flex flex-col items-center justify-center px-4 py-8 antialiased selection:bg-[#EAE4DC]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="w-full max-w-[390px] bg-white rounded-[24px] border border-[#EFECE6] shadow-[0_4px_24px_rgba(0,0,0,0.03)] px-6 py-7 sm:px-8 sm:py-8 text-center"
      >
        {/* Brand Logo with clean spacing */}
        <div className="flex justify-center mb-4">
          <img
            src="/ghar sansar logo.svg"
            alt="Ghar Sansar"
            className="h-14 sm:h-16 w-auto object-contain"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.endsWith("ghar_sansar_logo_nav.png")) {
                target.src = "/ghar_sansar_logo_nav.png";
              }
            }}
          />
        </div>

        {/* Heading & Subtitle */}
        <h1 className="text-2xl sm:text-[26px] font-serif font-bold text-[#1C1917] tracking-tight mb-2">
          Welcome back
        </h1>
        <p className="text-[13px] text-[#78716C] leading-relaxed max-w-[280px] mx-auto mb-6">
          Sign in with Google to access your wishlist, cart, orders and account.
        </p>

        {/* Dynamic States */}
        {step === "redirecting" ? (
          /* Successful Authentication State */
          <div className="py-2 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#EBF3ED] text-[#1E3E30] flex items-center justify-center mx-auto border border-[#D5E5DA]">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#1C1917] mb-1">
                You're signed in
              </h2>
              <p className="text-xs text-[#78716C]">
                Returning you to the Ghar Sansar app...
              </p>
            </div>

            {deepLinkUrl && (
              <div className="pt-2 space-y-2">
                <a
                  href={deepLinkUrl}
                  className="w-full h-[52px] inline-flex items-center justify-center space-x-2 bg-[#173027] hover:bg-[#1E3E30] active:bg-[#12241D] text-white rounded-[16px] text-[14px] font-medium transition-all shadow-sm cursor-pointer"
                >
                  <span>Open Ghar Sansar App</span>
                  <ExternalLink className="w-4 h-4 opacity-80" />
                </a>
                <p className="text-[11px] text-[#78716C]">
                  If the app doesn't open automatically, tap above.
                </p>
              </div>
            )}
          </div>
        ) : step === "authenticating" || step === "generating" ? (
          /* In-Progress Loading State */
          <div className="space-y-3">
            <button
              type="button"
              disabled
              className="w-full h-[52px] flex items-center justify-center space-x-3 bg-[#FAF8F5] border border-[#E5E0D6] rounded-[16px] text-[14px] font-medium text-[#44403C] cursor-not-allowed opacity-95"
            >
              <div className="w-4 h-4 border-2 border-[#173027] border-t-transparent rounded-full animate-spin" />
              <span>Signing you in...</span>
            </button>
            <p className="text-xs text-[#78716C]">
              {step === "authenticating"
                ? "Please choose your Google account in the window."
                : "Securing your session token..."}
            </p>
          </div>
        ) : (
          /* Idle or Error State */
          <div className="space-y-4">
            {step === "error" && errorMessage && (
              <div className="p-3 bg-[#FAF7F2] border border-[#EAE4DC] rounded-[14px] text-left">
                <div className="flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-[#9E472A] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#44403C] space-y-0.5">
                    <p className="font-semibold text-[#1C1917]">Unable to sign you in</p>
                    <p className="text-[#57534E] leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Primary Google Button CTA */}
            <button
              type="button"
              onClick={startGoogleAuth}
              className="w-full h-[52px] flex items-center justify-center space-x-3 bg-white hover:bg-[#FAF9F7] active:bg-[#F5F2EB] border border-[#DDD7CD] hover:border-[#CCC5B8] rounded-[16px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150 text-[15px] font-medium text-[#292524] cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {step === "error" && (
              <button
                type="button"
                onClick={startGoogleAuth}
                className="inline-flex items-center space-x-1.5 text-xs text-[#173027] hover:text-[#1E3E30] font-medium cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        {/* Compact Security Indicator & Brand Attribution */}
        <div className="mt-6 pt-5 border-t border-[#F2EFE9] flex items-center justify-center space-x-1.5 text-[12px] text-[#57534E]">
          <Lock className="w-3.5 h-3.5 text-[#173027] shrink-0" />
          <span>Secure Google sign-in • Encrypted session</span>
        </div>
        <p className="mt-2 text-[11px] text-[#A8A29E]">Powered by Ghar Sansar</p>
      </motion.div>
    </main>
  );
};

export default MobileAuth;
