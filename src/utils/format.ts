import type { TooltipValueType } from 'recharts';

const DATE_UNAVAILABLE = 'Date unavailable';

function toValidDate(value: string | null | undefined): Date | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-EG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencyByCode(amount: number, currency: string | null | undefined): string {
  const code = (currency ?? '').trim().toUpperCase();
  const safeCode = code === 'EGP' || code === 'USD' || code === 'SAR' ? code : 'EGP';
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: safeCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatTooltipCurrency(value: TooltipValueType | undefined): [string, string] {
  const amount = typeof value === 'number' ? value : 0;
  return [formatCurrency(amount), ''];
}

export function formatDate(dateString: string | null | undefined): string {
  const date = toValidDate(dateString);
  if (!date) return DATE_UNAVAILABLE;

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) {
    const hours = Math.floor(diff / 3600000);
    if (hours === 0) {
      const minutes = Math.floor(diff / 60000);
      return minutes <= 1 ? 'Just now' : `${minutes}m ago`;
    }
    return `${hours}h ago`;
  }
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatMonthYear(dateString: string | null | undefined): string {
  const date = toValidDate(dateString);
  if (!date) return DATE_UNAVAILABLE;
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
