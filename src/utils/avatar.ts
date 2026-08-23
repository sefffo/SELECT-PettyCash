const AVATAR_PALETTE = ['#145DB8', '#0E7490', '#16A34A', '#D97706', '#7C3AED', '#DB2777'] as const;

export function avatarColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i += 1) hash = (hash * 31 + email.charCodeAt(i)) | 0;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]!;
}

export function initialsOf(email: string): string {
  const local = email.split('@')[0] ?? '?';
  const parts = local.split(/[._-]/).filter(Boolean);
  const chars = parts.length > 1 ? parts.map((p) => p[0]).join('') : local.slice(0, 2);
  return chars.toUpperCase();
}

export const CURRENCY_FLAGS: Record<string, string> = {
  EGP: '🇪🇬',
  USD: '🇺🇸',
  SAR: '🇸🇦',
};

export function currencyFlag(code: string | null | undefined): string {
  const key = (code ?? '').trim().toUpperCase();
  return CURRENCY_FLAGS[key] ?? '💱';
}