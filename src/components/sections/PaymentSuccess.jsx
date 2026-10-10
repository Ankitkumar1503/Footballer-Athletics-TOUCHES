import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  Share2,
  Download,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Sparkles
} from "lucide-react";

import { isMobileDevice } from "../../lib/utils";

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Payment status check (defaults to true if status is paid or parameter omitted)
  const rawStatus = searchParams.get("status");
  const isPaid = rawStatus ? rawStatus === "paid" || rawStatus === "success" : true;

  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(() => (typeof window !== "undefined" ? window.deferredInstallPrompt || null : null));
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(isMobileDevice);

  // APP_PUBLIC_URL configuration: use VITE_APP_PUBLIC_URL if present, otherwise window.location.origin
  const appPublicUrl = import.meta.env.VITE_APP_PUBLIC_URL || window.location.origin;

  // Listen for browser's native beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      console.log("[PWA INSTALL] PaymentSuccess captured beforeinstallprompt event:", e);
      if (e && e.preventDefault && e !== window) {
        e.preventDefault();
        window.deferredInstallPrompt = e;
      }
      setDeferredPrompt(window.deferredInstallPrompt || e);
    };

    const handleAppInstalled = () => {
      console.log("[PWA INSTALL] PaymentSuccess appinstalled event received!");
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (typeof window !== "undefined") window.deferredInstallPrompt = null;
    };

    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };

    if (window.deferredInstallPrompt) {
      console.log("[PWA INSTALL] PaymentSuccess mounted with pre-captured prompt:", window.deferredInstallPrompt);
      setDeferredPrompt(window.deferredInstallPrompt);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("pwa-installable", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("resize", checkMobile);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("pwa-installable", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(appPublicUrl);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = appPublicUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleNativeInstall = async () => {
    const promptEvent = deferredPrompt || window.deferredInstallPrompt;
    console.log("[PWA INSTALL] PaymentSuccess install button clicked. deferredPrompt state:", promptEvent);
    if (!promptEvent) {
      console.warn("[PWA INSTALL] PaymentSuccess install clicked but no prompt event stored!");
      return;
    }
    try {
      console.log("[PWA INSTALL] PaymentSuccess triggering prompt()...");
      promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      console.log(`[PWA INSTALL] PaymentSuccess user choice outcome: ${choiceResult?.outcome}`);
      if (choiceResult?.outcome === "accepted") {
        setIsInstalled(true);
      }
    } catch (err) {
      console.error("[PWA INSTALL] Error in PaymentSuccess install:", err);
    } finally {
      setDeferredPrompt(null);
      if (typeof window !== "undefined") window.deferredInstallPrompt = null;
    }
  };

  if (!isPaid) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            !
          </div>
          <h2 className="text-xl font-black uppercase text-football-text">Payment Pending or Cancelled</h2>
          <p className="text-xs text-football-text/70">
            We couldn't verify payment completion. If you believe this is an error, please try again or contact support.
          </p>
          <button
            onClick={() => navigate("/account")}
            className="w-full py-3 px-4 bg-football-accent text-white font-bold rounded-2xl text-xs uppercase"
          >
            Return to Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-football-text pb-24 pt-6 px-4">
      <div className="max-w-md mx-auto space-y-6">

        {/* ── Success Header ── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-2">
            <CheckCircle2 size={36} className="animate-bounce" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-widest uppercase">
            <ShieldCheck size={12} />
            <span>Lifetime Access Active</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-football-text">
            Welcome to <span className="text-football-accent text-glow">TOUCHES™</span>
          </h1>
          <p className="text-xs text-football-text/80 leading-relaxed max-w-xs mx-auto">
            Your full access pass is active. Scan below to install the app on your mobile phone!
          </p>
        </div>

        {/* ── PWA QR Code Section ── */}
        <div className="bg-[var(--bg-card)] border-2 border-football-accent/40 rounded-3xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
          
          {/* Subtle background glow accent */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-football-accent/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-football-accent">
              <Sparkles size={13} />
              <span>PWA Mobile Installation</span>
            </div>
            <h2 className="text-sm font-black uppercase text-football-text tracking-wide">
              Scan this QR code with your phone to install the TOUCHES app
            </h2>
          </div>

          {/* High contrast QR Code Canvas */}
          <div className="flex justify-center my-2">
            <div className="bg-white p-4 rounded-2xl shadow-xl border-4 border-football-accent/20 inline-block hover:scale-[1.02] transition-transform duration-200">
              <QRCodeSVG
                value={appPublicUrl}
                size={220}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/touches-favicon-1.png",
                  x: undefined,
                  y: undefined,
                  height: 36,
                  width: 36,
                  excavate: true,
                }}
              />
            </div>
          </div>

          <p className="text-[11px] font-medium text-football-text/70 break-all bg-[var(--bg-primary)] py-1.5 px-3 rounded-xl border border-football-text/10 inline-block max-w-full">
            {appPublicUrl}
          </p>

          {/* Copy Link & Direct Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
            <button
              onClick={handleCopyLink}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 border ${
                copied
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/30"
                  : "bg-[var(--bg-primary)] hover:bg-football-accent hover:text-white text-football-text border-football-text/20"
              }`}
            >
              {copied ? (
                <>
                  <Check size={16} />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            {isMobile && deferredPrompt && !isInstalled && (
              <button
                onClick={handleNativeInstall}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider bg-football-accent text-white hover:bg-football-accent-hover shadow-lg transition-all"
              >
                <Download size={16} />
                <span>Install PWA Now</span>
              </button>
            )}
          </div>

        </div>

        {/* ── Mobile Instructions Box ── */}
        <div className="bg-[var(--bg-card)] border border-football-text/15 rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-football-text/10">
            <Smartphone size={18} className="text-football-accent" />
            <h3 className="text-xs font-black uppercase tracking-wider text-football-text">
              How to Add to Home Screen
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* iPhone Instructions */}
            <div className="bg-[var(--bg-primary)] p-3.5 rounded-2xl border border-football-text/10 space-y-1">
              <div className="flex items-center justify-between font-black uppercase text-[11px] text-football-text">
                <span className="flex items-center gap-1.5">🍏 On iPhone (Safari):</span>
              </div>
              <p className="text-[11px] text-football-text/80 leading-relaxed">
                Tap <Share2 size={12} className="inline mx-1 text-football-accent" /> <strong>Share</strong> → scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
            </div>

            {/* Android Instructions */}
            <div className="bg-[var(--bg-primary)] p-3.5 rounded-2xl border border-football-text/10 space-y-1">
              <div className="flex items-center justify-between font-black uppercase text-[11px] text-football-text">
                <span className="flex items-center gap-1.5">🤖 On Android (Chrome):</span>
              </div>
              <p className="text-[11px] text-football-text/80 leading-relaxed">
                Tap the <strong>Install prompt</strong> banner at the bottom or tap menu (⋮) → <strong>Add to Home Screen</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* ── Direct Web App Navigation ── */}
        <div className="pt-2 text-center space-y-3">
          <Link
            to="/touch-counter"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-widest bg-football-accent hover:bg-football-accent-hover text-white shadow-xl hover:shadow-football-accent/30 transition-all duration-200"
          >
            <span>Launch TOUCHES Web App</span>
            <ArrowRight size={16} />
          </Link>

          <p className="text-[10px] text-football-text/60 font-medium">
            Need help? Contact <a href="mailto:footballerathleticss@gmail.com" className="underline hover:text-football-accent">footballerathleticss@gmail.com</a>
          </p>
        </div>

      </div>
    </div>
  );
}
