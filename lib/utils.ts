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
  const expiry = new Date(expiryDateISO).getTime();
  const now = Date.now();
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function generateRandomId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `SN-${year}-${randomNum}`;
}

export function generateMockCredentials(productName: string, accountType: string, customEmail?: string) {
  const cleanName = productName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  
  const email = customEmail || `${cleanName}.vault${randomDigits}@subnexus-vip.com`;
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  const randomChars = Math.random().toString(36).slice(-8);
  const password = `Nexus#${randomChars}!2025`;

  return {
    email,
    password,
    profileName: accountType === 'shared_profile' ? `VIP Slot #${Math.floor(1 + Math.random() * 4)}` : undefined,
    pinCode: accountType === 'shared_profile' ? pin : undefined,
    inviteLink: accountType === 'direct_upgrade' || accountType === 'family_slot' 
      ? `https://auth.subnexus.io/accept-invite?token=inv_${Math.random().toString(36).substring(2)}`
      : undefined,
    notes: 'Keep credentials confidential. 100% replacement warranty active under Terms of Service.',
  };
}
