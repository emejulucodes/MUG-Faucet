export const isValidAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value.trim())

export const isPositiveNumber = (value: string) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0
}
