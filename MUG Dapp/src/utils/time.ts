export const ONE_DAY_SECONDS = 24 * 60 * 60

export const formatDuration = (seconds: number): string => {
  const safeSeconds = Math.max(0, seconds)
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remainingSeconds = safeSeconds % 60

  return `Retry in ${hours}h ${minutes}m ${remainingSeconds}s`
}
