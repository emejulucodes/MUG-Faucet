import { useEffect, useMemo, useState } from 'react'
import { formatDuration, ONE_DAY_SECONDS } from '../utils/time'

type UseCountdownArgs = {
  lastClaimTime?: bigint
  claimInterval?: bigint
  latestBlockTimestamp?: number
}

export const useCountdown = ({
  lastClaimTime,
  claimInterval,
  latestBlockTimestamp,
}: UseCountdownArgs) => {
  const [now, setNow] = useState<number>(() => Math.floor(Date.now() / 1000))

  useEffect(() => {
    if (latestBlockTimestamp) {
      setNow(latestBlockTimestamp)
    }
  }, [latestBlockTimestamp])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow((prev) => prev + 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  return useMemo(() => {
    if (!lastClaimTime) {
      return {
        canClaim: true,
        remainingSeconds: 0,
        countdownText: 'Ready to claim',
      }
    }

    // Cooldown is enforced from the latest claim timestamp and updates every second.
    const intervalSeconds = Number(claimInterval ?? BigInt(ONE_DAY_SECONDS))
    const nextClaimTime = Number(lastClaimTime) + intervalSeconds
    const remainingSeconds = Math.max(0, nextClaimTime - now)

    return {
      canClaim: remainingSeconds === 0,
      remainingSeconds,
      countdownText: remainingSeconds > 0 ? formatDuration(remainingSeconds) : 'Ready to claim',
    }
  }, [claimInterval, lastClaimTime, now])
}
