import React, { useState, useEffect } from 'react';
import {
  Download,
  Share,
  PlusSquare,
  CheckCircle,
  X,
  Smartphone,
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
  const [canPrompt, setCanPrompt] = useState(() => {
    try {
      return isPwaInstallable();
    } catch {
      return false;
    }
  });
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    try {
      return isRunningStandalone();
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const userAgent = (typeof window !== 'undefined' && window.navigator?.userAgent ? window.navigator.userAgent : '').toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);
      setIsInstalled(isRunningStandalone());

      const handleInstallable = (e: any) => {
        setCanPrompt(e.detail);
      };
      window.addEventListener('simply_pwa_installable', handleInstallable);
      return () => window.removeEventListener('simply_pwa_installable', handleInstallable);
    } catch (err) {
      console.warn('PWA initialization error:', err);
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#18181b] p-5 sm:p-6 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-lg bg-[#222225] border border-white/[0.08] text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Brand Icon Header */}
        <div className="flex items-center gap-3">
          <SimplyLogo size="md" showText={false} />
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Install Fahemny IGCSE App
            </h3>
            <span className="text-[11px] font-medium text-[#FF5B37]">
              Offline Revision & Native Mobile Shell
            </span>
          </div>
        </div>

        {/* Benefits list */}
        <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-3.5 space-y-2 text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Instant 1-tap launch from your iPhone/Android Home Screen</span>
          </div>
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Offline access to Formula Sheets & Night Before Cheat Sheets</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-[#FF5B37] shrink-0" />
            <span>Full-screen view with zero browser URL bar distractions</span>
          </div>
        </div>

        {/* Platform Specific Install Steps */}
        {isInstalled ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-center text-xs text-emerald-300 font-medium">
            ✓ App is already installed and active on this device!
          </div>
        ) : isIOS ? (
          /* iOS Instructions */
          <div className="space-y-3 rounded-xl border border-white/[0.08] bg-[#141416] p-4 text-xs text-zinc-200">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-[#FF5B37]" />
              <span>How to Install on iPhone / iPad:</span>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-[11px] text-zinc-300">
              <li className="leading-relaxed">
                Tap the <strong className="text-white">Share</strong> icon in the Safari bottom bar (<Share className="h-3.5 w-3.5 inline text-[#FF5B37]" />).
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
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#FF5B37] hover:bg-[#ff6c4b] py-2.5 text-xs font-semibold text-white shadow-sm transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Install App on Device</span>
          </button>
        ) : (
          /* Fallback Desktop / Browser instructions */
          <div className="space-y-2 rounded-xl border border-white/[0.08] bg-[#141416] p-3.5 text-xs text-zinc-300">
            <p className="font-medium text-white">To install on Desktop or Chrome:</p>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Click the install icon (<Download className="h-3.5 w-3.5 inline text-[#FF5B37]" />) in your browser’s URL bar, or click your browser menu (⋮) and choose <strong>"Install Fahemny IGCSE"</strong>.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 transition py-1 cursor-pointer"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};
