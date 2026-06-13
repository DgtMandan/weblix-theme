export const DEFAULT_CURRENCY = 'USD';

export function formatUsd(amount, options = {}) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    maximumFractionDigits: 0,
    ...options
  }).format(Number(amount || 0));
}
