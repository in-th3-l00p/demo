/**
 * Format a token amount for display, respecting decimals and precision.
 * Example: formatTokenAmount(1234567890n, 18, 4) → "0.0000"
 */
export function formatTokenAmount(
  amount: bigint | string,
  decimals: number,
  precision: number = 4,
): string {
  const value = typeof amount === 'string' ? BigInt(amount) : amount
  const divisor = 10n ** BigInt(decimals)
  const whole = value / divisor
  const remainder = value % divisor

  if (remainder === 0n) {
    return whole.toString()
  }

  const remainderStr = remainder.toString().padStart(decimals, '0')
  const trimmed = remainderStr.slice(0, precision)

  // Remove trailing zeros
  const cleaned = trimmed.replace(/0+$/, '')
  if (cleaned === '') {
    return whole.toString()
  }

  return `${whole}.${cleaned}`
}

/**
 * Format a number as USD currency string.
 */
export function formatUsd(value: number, minimumFractionDigits = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Truncate an Ethereum address for display.
 * Example: "0x1234...abcd"
 */
export function truncateAddress(address: string, start = 6, end = 4): string {
  if (address.length <= start + end) return address
  return `${address.slice(0, start)}...${address.slice(-end)}`
}

/**
 * Format large numbers with K/M/B suffixes.
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toFixed(2)
}

/**
 * Format a duration in seconds to a human-readable string.
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${mins}m`
}
