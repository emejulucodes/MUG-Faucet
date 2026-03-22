import { useCountdown } from '../../hooks/useCountdown'
import { useFaucetReads } from '../../hooks/useFaucetReads'
import { useRecentTransactions } from '../../hooks/useRecentTransactions'

export const useFaucetData = () => {
  const faucet = useFaucetReads()
  const txQuery = useRecentTransactions()

  const countdown = useCountdown({
    lastClaimTime: faucet.lastClaimTime,
    claimInterval: faucet.claimInterval,
    latestBlockTimestamp: faucet.latestBlockTimestamp,
  })

  return {
    faucet,
    txQuery,
    countdown,
  }
}
