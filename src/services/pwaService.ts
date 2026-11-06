// PWA Install Prompt Service

let deferredPrompt: any = null;

export const initPwaListener = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('simply_pwa_installable', { detail: true }));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('simply_pwa_installable', { detail: false }));
    console.log('Simply IGCSE was installed successfully');
  });
};

export const isPwaInstallable = (): boolean => {
  return !!deferredPrompt;
};

export const promptPwaInstall = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    return false;
  }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === 'accepted';
};

export const isRunningStandalone = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const matchMediaStandalone = window.matchMedia ? window.matchMedia('(display-mode: standalone)').matches : false;
    const navStandalone = (typeof window.navigator !== 'undefined' && (window.navigator as any)?.standalone === true);
    return Boolean(matchMediaStandalone || navStandalone);
  } catch {
    return false;
  }
};
