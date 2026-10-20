// Pricing & Promotional Discount Service
// Central source of truth for Individual, Teacher, and School subscription tiers.
// Stored in localStorage so admin edits immediately take effect platform-wide.

export interface PlanPricing {
  id: 'plus' | 'pro' | 'teacher' | 'school';
  name: string;
  tagline: string;
  basePrice: number; // EGP
  discountPrice: number; // EGP
  interval: 'monthly' | 'annual';
  badge?: string;
  features: string[];
}

export interface PricingSettings {
  discountActive: boolean;
  promoTitle: string;
  discountEndsAt: string; // ISO string
  plans: {
    plus: { basePrice: number; discountPrice: number };
    pro: { basePrice: number; discountPrice: number };
    teacher: { basePrice: number; discountPrice: number };
    school: { basePrice: number; discountPrice: number };
  };
  paymentDetails: {
    instapayIpa: string;
    teldaTag: string;
    bdcAccountNumber: string;
    bdcAccountName: string;
  };
}

const STORAGE_KEY = 'simply_igcse_pricing_settings_v3';

// Default initial prices as specified in Day 3 Master Spec:
// - Plus: Base 350 EGP -> Discount 199 EGP
// - Pro: Base 500 EGP -> Discount 299 EGP
// - Teacher (up to 35): Base 1,200 EGP -> Discount 699 EGP
// - School: Base 4,500 EGP -> Discount 2,499 EGP
export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  discountActive: true,
  promoTitle: 'Ramadan / Launch Special (Save up to 45%)',
  // 7 days from now by default
  discountEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  plans: {
    plus: { basePrice: 350, discountPrice: 199 },
    pro: { basePrice: 500, discountPrice: 299 },
    teacher: { basePrice: 1200, discountPrice: 699 },
    school: { basePrice: 4500, discountPrice: 2499 },
  },
  paymentDetails: {
    instapayIpa: 'simply.igcse@instapay',
    teldaTag: '@simply_igcse',
    bdcAccountNumber: '0014-9821-4320-9912',
    bdcAccountName: 'Simply IGCSE Educational Services'
  }
};

export function getPricingSettings(): PricingSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PRICING_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PRICING_SETTINGS,
      ...parsed,
      plans: {
        ...DEFAULT_PRICING_SETTINGS.plans,
        ...(parsed.plans || {})
      },
      paymentDetails: {
        ...DEFAULT_PRICING_SETTINGS.paymentDetails,
        ...(parsed.paymentDetails || {})
      }
    };
  } catch {
    return DEFAULT_PRICING_SETTINGS;
  }
}

export function savePricingSettings(settings: PricingSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('simply_pricing_updated'));
  } catch (err) {
    console.error('Failed to save pricing settings:', err);
  }
}

export function resetDiscountTimer(days: number = 7): string {
  const newEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const current = getPricingSettings();
  const updated: PricingSettings = {
    ...current,
    discountActive: true,
    discountEndsAt: newEnd
  };
  savePricingSettings(updated);
  return newEnd;
}

export function getTimeRemaining(endsAt: string): { totalMs: number; days: number; hours: number; minutes: number; seconds: number; isExpired: boolean } {
  const totalMs = Math.max(0, new Date(endsAt).getTime() - Date.now());
  const seconds = Math.floor((totalMs / 1000) % 60);
  const minutes = Math.floor((totalMs / 1000 / 60) % 60);
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  return {
    totalMs,
    days,
    hours,
    minutes,
    seconds,
    isExpired: totalMs <= 0
  };
}

export function getEffectivePrice(planKey: 'plus' | 'pro' | 'teacher' | 'class' | 'school'): number {
  const settings = getPricingSettings();
  const normalizedKey: 'plus' | 'pro' | 'teacher' | 'school' = planKey === 'class' ? 'teacher' : planKey;
  const plan = settings.plans[normalizedKey];
  if (!plan) return 299;

  if (settings.discountActive) {
    const now = Date.now();
    const expiry = new Date(settings.discountEndsAt).getTime();
    if (now < expiry) {
      return plan.discountPrice;
    }
  }
  return plan.basePrice;
}
