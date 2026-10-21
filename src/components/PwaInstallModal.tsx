import React, { useState, useEffect } from 'react';
import {
  Download,
  Share,
  PlusSquare,
  CheckCircle,
  X,
  Smartphone,
  Sparkles,
  WifiOff
} from 'lucide-react';
import {
  isPwaInstallable,
  promptPwaInstall,
  isRunningStandalone
} from '../services/pwaService';
import { SimplyLogo } from './SimplyLogo';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [canPrompt, setCanPrompt] = useState(isPwaInstallable());
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(isRunningStandalone());

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);
    setIsInstalled(isRunningStandalone());

    const handleInstallable = (e: any) => {
      setCanPrompt(e.detail);
    };
    window.addEventListener('simply_pwa_installable', handleInstallable);
    return () => window.removeEventListener('simply_pwa_installable', handleInstallable);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (canPrompt) {
      const accepted = await promptPwaInstall();
      if (accepted) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Brand Icon Header */}
        <div className="flex items-center gap-3">
          <SimplyLogo size="md" showText={false} />
          <div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Install Simply IGCSE App
            </h3>
            <span className="text-[11px] font-bold text-indigo-400">
              Offline Revision & Native Mobile Shell
            </span>
          </div>
        </div>

        {/* Benefits list */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Instant 1-tap launch from your iPhone/Android Home Screen</span>
          </div>
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Offline access to Formula Sheets & Night Before Cheat Sheets</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>Full-screen view with zero browser URL bar distractions</span>
          </div>
        </div>

        {/* Platform Specific Install Steps */}
        {isInstalled ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-center text-xs text-emerald-300 font-bold">
            ✓ App is already installed and active on this device!
          </div>
        ) : isIOS ? (
          /* iOS Instructions */
          <div className="space-y-3 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 text-xs text-slate-200">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Smartphone className="h-4 w-4" />
              <span>How to Install on iPhone / iPad:</span>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-[11px] text-slate-300">
              <li className="leading-relaxed">
                Tap the <strong className="text-white">Share</strong> icon in the Safari bottom bar (<Share className="h-3.5 w-3.5 inline text-indigo-400" />).
              </li>
              <li className="leading-relaxed">
                Scroll down and select <strong className="text-white">"Add to Home Screen"</strong> (<PlusSquare className="h-3.5 w-3.5 inline text-emerald-400" />).
              </li>
              <li className="leading-relaxed">
                Tap <strong className="text-white">"Add"</strong> in the top-right corner.
              </li>
            </ol>
          </div>
        ) : canPrompt ? (
          /* Native Android / Chrome 1-Click Install */
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 py-3 text-xs sm:text-sm font-black text-white shadow-xl shadow-indigo-500/25 transition active:scale-95 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Install App on Device</span>
          </button>
        ) : (
          /* Fallback Desktop / Browser instructions */
          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 text-xs text-slate-300">
            <p className="font-semibold text-white">To install on Desktop or Chrome:</p>
            <p className="text-[11px] text-slate-400">
              Click the install icon (<Download className="h-3.5 w-3.5 inline text-indigo-400" />) in your browser’s URL bar, or click your browser menu (⋮) and choose <strong>"Install Simply IGCSE"</strong>.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition py-1 cursor-pointer"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};
