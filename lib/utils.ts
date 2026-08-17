import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateDaysRemaining(expiryDateISO: string): number {
  if (!expiryDateISO) return 0;
  const expiry = new Date(expiryDateISO).getTime();
  const now = Date.now();
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function calculateExpiryProgress(startDateISO?: string, expiryDateISO?: string, planDuration?: string): number {
  if (!expiryDateISO) return 0;
  const expiry = new Date(expiryDateISO).getTime();
  const now = Date.now();
  if (now >= expiry) return 0;

  let totalDurationMs = 0;
  if (startDateISO) {
    const start = new Date(startDateISO).getTime();
    totalDurationMs = expiry - start;
  }

  if (totalDurationMs <= 0 || isNaN(totalDurationMs)) {
    const durationDaysMap: Record<string, number> = {
      '1_month': 30,
      '3_months': 90,
      '6_months': 180,
      '12_months': 365,
      'lifetime': 3650,
    };
    const days = (planDuration && durationDaysMap[planDuration]) ? durationDaysMap[planDuration] : 30;
    totalDurationMs = days * 24 * 60 * 60 * 1000;
  }

  const remainingMs = Math.max(0, expiry - now);
  const percentage = Math.max(0, Math.min(100, (remainingMs / totalDurationMs) * 100));
  return Math.round(percentage);
}

export function generateRandomId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `KY-${year}-${randomNum}`;
}

export function generateInitialCredentials(productName: string, accountType: string = 'private_account', customerEmail?: string) {
  const cleanName = productName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  
  const email = customerEmail ? customerEmail.trim() : `${cleanName}.access${randomDigits}@customer-vip.io`;
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  const randomChars = Math.random().toString(36).slice(-8);
  const password = `Keyoon#${randomChars}!2026`;

  return {
    email,
    password,
    profileName: accountType === 'shared_profile' || accountType === 'shared_screen' ? `VIP Slot #${Math.floor(1 + Math.random() * 4)}` : undefined,
    pinCode: accountType === 'shared_profile' || accountType === 'shared_screen' ? pin : undefined,
    inviteLink: accountType === 'direct_upgrade' || accountType === 'family_slot' 
      ? `https://auth.keyoon.com/accept-invite?token=inv_${Math.random().toString(36).substring(2)}`
      : undefined,
    notes: 'Keep credentials confidential. 100% full replacement warranty active under Keyoon Terms of Service.',
  };
}

export const generateMockCredentials = generateInitialCredentials;
