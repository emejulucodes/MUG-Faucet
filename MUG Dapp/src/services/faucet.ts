import { parseUnits } from 'viem'

export const parseTokenAmount = (value: string, decimals: number): bigint => {
  const normalized = value.trim()
  if (!normalized || Number(normalized) <= 0) {
    throw new Error('Amount must be greater than 0')
  }
  return parseUnits(normalized, decimals)
}

export const validateAddressInput = (value: string): `0x${string}` => {
  if (!/^0x[a-fA-F0-9]{40}$/.test(value.trim())) {
    throw new Error('Invalid recipient address')
  }
  return value.trim() as `0x${string}`
}
