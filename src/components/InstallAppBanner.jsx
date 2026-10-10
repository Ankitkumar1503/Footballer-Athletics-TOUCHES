import React, { useState, useEffect } from "react";
import {
  Download,
  Share,
  PlusSquare,
  X,
  Smartphone,
  Check,
  Compass,
} from "lucide-react";
import { isMobileDevice } from "../lib/utils";

let globalDeferredPrompt =
  typeof window !== "undefined" ? window.deferredInstallPrompt || null : null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
    window.deferredInstallPrompt = e;
    // console.log("[PWA INSTALL] Global beforeinstallprompt event captured in InstallAppBanner listener!", e);
    window.dispatchEvent(new CustomEvent("pwa-installable", { detail: e }));
  });
}

export function InstallAppBanner({ className = "" }) {
  const [deferredPrompt, setDeferredPrompt] = useState(() =>
    typeof window !== "undefined"
      ? window.deferredInstallPrompt || globalDeferredPrompt
      : null,
  );
  const [isMobile, setIsMobile] = useState(isMobileDevice);
  const [isIOS, setIsIOS] = useState(false);
  const [isNonSafariIOS, setIsNonSafariIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check mobile status and standalone mode
    const checkStatus = () => {
      setIsMobile(isMobileDevice());
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(Boolean(isStandaloneMode));
    };

    // Check iOS user agent & specific browser (Chrome CriOS vs Safari)
    const checkBrowser = () => {
      const urlParams = new URLSearchParams(window.location.search);

      // Testing overrides via URL params for quick verification
      if (urlParams.get("test_ios_chrome") === "1") {
        setIsIOS(true);
        setIsNonSafariIOS(true);
        return;
      }
      if (urlParams.get("test_ios_safari") === "1") {
        setIsIOS(true);
        setIsNonSafariIOS(false);
        return;
      }

      const ua = window.navigator.userAgent || "";
      const isIOSDevice =
        /iphone|ipad|ipod/i.test(ua) ||
        (window.navigator.maxTouchPoints > 0 && /macintosh/i.test(ua));

      setIsIOS(isIOSDevice);

      if (isIOSDevice) {
        // Chrome on iOS contains "CriOS", Firefox contains "FxiOS", Edge contains "EdgiOS", etc.
        const isNonSafari = /crios|fxios|edgios|opios|duckduckgo|gsa/i.test(ua);
        setIsNonSafariIOS(isNonSafari);
      }
    };

    checkStatus();
    checkBrowser();

    const handleInstallable = (e) => {
      console.log(
        "[PWA INSTALL] InstallAppBanner received beforeinstallprompt/pwa-installable event:",
        e,
      );
      if (e && e.preventDefault && e !== window) {
        e.preventDefault();
        globalDeferredPrompt = e;
        window.deferredInstallPrompt = e;
      }
      const activePrompt = window.deferredInstallPrompt || globalDeferredPrompt;
      setDeferredPrompt(activePrompt);
    };

    // Sync state if prompt was already captured prior to component mounting
    if (window.deferredInstallPrompt || globalDeferredPrompt) {
      const activePrompt = window.deferredInstallPrompt || globalDeferredPrompt;
      console.log(
        "[PWA INSTALL] InstallAppBanner mounted with pre-captured prompt:",
        activePrompt,
      );
      setDeferredPrompt(activePrompt);
    }

    window.addEventListener("beforeinstallprompt", handleInstallable);
    window.addEventListener("pwa-installable", handleInstallable);
    window.addEventListener("resize", checkStatus);

    const handleAppInstalled = () => {
      console.log("[PWA INSTALL] Appinstalled event received!");
      setInstalledSuccess(true);
      setDeferredPrompt(null);
      globalDeferredPrompt = null;
      if (typeof window !== "undefined") window.deferredInstallPrompt = null;
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallable);
      window.removeEventListener("pwa-installable", handleInstallable);
      window.removeEventListener("resize", checkStatus);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent =
      deferredPrompt || window.deferredInstallPrompt || globalDeferredPrompt;
    console.log(
      "[PWA INSTALL] Install button clicked. deferredPrompt state:",
      promptEvent,
    );

    if (!promptEvent) {
      console.warn(
        "[PWA INSTALL] Install button clicked but no deferredPrompt event is stored!",
      );
      return;
    }

    try {
      console.log("[PWA INSTALL] Triggering prompt()...");
      promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      console.log(
        `[PWA INSTALL] User prompt choice outcome: ${choiceResult?.outcome}`,
      );
      if (choiceResult?.outcome === "accepted") {
        setInstalledSuccess(true);
      }
    } catch (err) {
      console.error("[PWA INSTALL] Error triggering install prompt:", err);
    } finally {
      setDeferredPrompt(null);
      globalDeferredPrompt = null;
      if (typeof window !== "undefined") window.deferredInstallPrompt = null;
    }
  };

  // Requirement FIX 1: NEVER render on desktop. ONLY render on mobile devices.
  if (!isMobile || isStandalone || dismissed) {
    return null;
  }

  if (installedSuccess) {
    return (
      <div
        className={`rounded-xl p-3 bg-emerald-950/80 border border-emerald-500/40 text-white flex items-center justify-between shadow-lg ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
              App Installed!
            </h4>
            <p className="text-[10px] text-white/70">
              TOUCHES is now added to your home screen.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/50 hover:text-white p-1"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  // 1. iOS + Non-Safari (e.g. Chrome / CriOS on iPhone)
  if (isIOS && isNonSafariIOS) {
    return (
      <div
        className={`relative rounded-xl p-3.5 bg-gradient-to-r from-[#1E1711] via-[#1A1418] to-[#171220] border-2 border-amber-500/60 shadow-2xl text-white space-y-2.5 ${className}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
              <Compass size={20} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-wider">
                Safari Required on iPhone
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Open in Safari to Install
              </h3>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-white/40 hover:text-white transition-colors"
            title="Close banner"
          >
            <X size={16} />
          </button>
        </div>

        <div className="bg-black/50 border border-amber-500/20 rounded-lg p-2.5 text-[11px] text-white/90 font-medium space-y-1.5">
          <p className="text-white/90">
            To install this app on iPhone, please open this link in{" "}
            <strong className="text-amber-400 font-bold">Safari</strong>:
          </p>
          <div className="text-[10px] text-white/80 space-y-1 pl-1">
            <p>
              1. Tap the <strong className="text-white">...</strong> menu in
              Chrome → tap{" "}
              <strong className="text-amber-300">Open in Safari</strong> (or
              copy & paste URL into Safari).
            </p>
            <p>
              2. In Safari, tap{" "}
              <strong className="text-[#00AEEF]">Share</strong>{" "}
              <Share size={11} className="inline text-[#00AEEF]" /> →{" "}
              <strong className="text-emerald-400">Add to Home Screen</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. iOS + Safari
  if (isIOS && !isNonSafariIOS) {
    return (
      <div
        className={`relative rounded-xl p-3.5 bg-gradient-to-r from-[#141926] via-[#101420] to-[#171120] border-2 border-[#00AEEF]/50 shadow-xl text-white space-y-2 ${className}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00AEEF]/20 text-[#00AEEF] flex items-center justify-center flex-shrink-0 border border-[#00AEEF]/30">
              <Smartphone size={20} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#00AEEF]/20 text-[#00AEEF] text-[8px] font-black uppercase tracking-wider">
                iPhone / iPad App
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                INSTALL TOUCHES APP
              </h3>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-white/40 hover:text-white transition-colors"
            title="Close banner"
          >
            <X size={16} />
          </button>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-lg p-2.5 text-[11px] text-white/90 font-medium space-y-1">
          <p className="flex items-center gap-1.5 flex-wrap">
            <span>On iPhone: tap</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/15 text-white font-bold text-[10px] border border-white/20">
              <Share size={12} className="text-[#00AEEF]" /> Share
            </span>
            <span>→</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/15 text-white font-bold text-[10px] border border-white/20">
              <PlusSquare size={12} className="text-emerald-400" /> Add to Home
              Screen
            </span>
          </p>
        </div>
      </div>
    );
  }

  // 3. Android / Desktop Chrome / Edge Install Banner
  return (
    <div
      className={`relative rounded-xl p-3.5 bg-gradient-to-r from-[#171424] via-[#121624] to-[#1E1119] border-2 border-[#FF4422]/60 shadow-2xl text-white space-y-2.5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF4422]/20 text-[#FF4422] flex items-center justify-center flex-shrink-0 border border-[#FF4422]/40 shadow-md">
            <Download size={22} className="animate-bounce" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FF4422]/20 text-[#FF4422] text-[8px] font-black uppercase tracking-widest">
              ⚡ App Experience
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Install TOUCHES App
            </h3>
            <p className="text-[10px] text-white/70 font-medium">
              Open without browser bars & access offline anytime
            </p>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-white/40 hover:text-white transition-colors"
          title="Dismiss"
        >
          <X size={16} />
        </button>
      </div>

      <div className="pt-0.5">
        <button
          onClick={handleInstallClick}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#FF4422] to-[#FF6600] hover:from-[#FF5533] hover:to-[#FF7711] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-[#FF4422]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Download size={15} />
          <span>INSTALL APP NOW</span>
        </button>
      </div>
    </div>
  );
}
