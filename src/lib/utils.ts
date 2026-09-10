/**
 * Formats a number as a currency string.
 * @param amount - The numeric value to format.
 * @param currency - The ISO 4217 currency code (default: 'USD').
 * @param locale - The locale string (default: 'en-US').
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Merges class names, filtering out falsy values.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Truncates a string to a given length, appending an ellipsis if truncated.
 */
export function truncate(str: string, maxLength: number): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Converts a HEX color string (e.g. #10b981 or 10b981) to RGB comma-separated string (e.g. "16, 185, 129")
 */
export function hexToRgb(hex: string): string {
  if (!hex) return '16, 185, 129';
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length !== 6) return '16, 185, 129';
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return '16, 185, 129';
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r}, ${g}, ${b}`;
}

