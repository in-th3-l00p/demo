/**
 * Convert a human-readable amount to the smallest unit (wei, etc.)
 * Example: toSmallestUnit("1.5", 18) → 1500000000000000000n
 */
export function toSmallestUnit(amount: string, decimals: number): bigint {
  const [whole = '0', fraction = ''] = amount.split('.')
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole + paddedFraction)
}

/**
 * Convert from smallest unit back to a human-readable string.
 * Example: fromSmallestUnit(1500000000000000000n, 18) → "1.5"
 */
export function fromSmallestUnit(amount: bigint | string, decimals: number): string {
  const value = typeof amount === 'string' ? BigInt(amount) : amount
  const isNegative = value < 0n
  const abs = isNegative ? -value : value
  const divisor = 10n ** BigInt(decimals)
  const whole = abs / divisor
  const remainder = abs % divisor

  if (remainder === 0n) {
    return `${isNegative ? '-' : ''}${whole}`
  }

  const remainderStr = remainder.toString().padStart(decimals, '0').replace(/0+$/, '')
  return `${isNegative ? '-' : ''}${whole}.${remainderStr}`
}

/**
 * Parse and sanitize user input for token amounts.
 * Returns a cleaned string suitable for toSmallestUnit, or null if invalid.
 */
export function parseAmountInput(input: string): string | null {
  // Remove whitespace and commas
  const cleaned = input.replace(/[\s,]/g, '')

  // Must match a valid decimal number pattern
  if (!/^\d+(\.\d+)?$/.test(cleaned)) {
    return null
  }

  // Remove leading zeros (but keep "0.xxx")
  const normalized = cleaned.replace(/^0+(?=\d)/, '')
  return normalized || '0'
}

/**
 * Calculate the minimum amount after slippage.
 * Example: applySlippage("1000", 0.005) → "995" (0.5% slippage)
 */
export function applySlippage(amount: string, slippage: number): string {
  const value = BigInt(amount)
  // Use basis points for precision: slippage 0.005 → 50 basis points
  const bps = BigInt(Math.floor(slippage * 10000))
  const result = value - (value * bps) / 10000n
  return result.toString()
}
