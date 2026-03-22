import { useQuery } from '@tanstack/react-query'
import { zeroAddress } from 'viem'
import { usePublicClient } from 'wagmi'
import { CONTRACT_ADDRESS } from '../constants/contract'
import { targetChain } from '../constants/wagmi'
import type { FaucetTx } from '../types/faucet'

export const useRecentTransactions = () => {
  const publicClient = usePublicClient({ chainId: targetChain.id })

  return useQuery({
    queryKey: ['recent-faucet-transactions', targetChain.id],
    queryFn: async (): Promise<FaucetTx[]> => {
      if (!publicClient) return []

      const latestBlock = await publicClient.getBlockNumber()
      const fromBlock = latestBlock > 5000n ? latestBlock - 5000n : 0n

      const [claimLogs, mintLogs, transferLogs] = await Promise.all([
        publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          event: {
            type: 'event',
            name: 'TokensClaimed',
            inputs: [
              { indexed: true, name: 'user', type: 'address' },
              { indexed: false, name: 'amount', type: 'uint256' },
            ],
          },
          fromBlock,
          toBlock: 'latest',
        }),
        publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          event: {
            type: 'event',
            name: 'TokensMinted',
            inputs: [
              { indexed: true, name: 'to', type: 'address' },
              { indexed: false, name: 'amount', type: 'uint256' },
            ],
          },
          fromBlock,
          toBlock: 'latest',
        }),
        publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          event: {
            type: 'event',
            name: 'Transfer',
            inputs: [
              { indexed: true, name: 'from', type: 'address' },
              { indexed: true, name: 'to', type: 'address' },
              { indexed: false, name: 'value', type: 'uint256' },
            ],
          },
          fromBlock,
          toBlock: 'latest',
        }),
      ])

      const blockNumbers = new Set<bigint>()
      for (const log of [...claimLogs, ...mintLogs, ...transferLogs]) {
        if (log.blockNumber) {
          blockNumbers.add(log.blockNumber)
        }
      }

      const blockTimestamps = new Map<bigint, number>()
      await Promise.all(
        [...blockNumbers].map(async (blockNumber) => {
          const block = await publicClient.getBlock({ blockNumber })
          blockTimestamps.set(blockNumber, Number(block.timestamp))
        }),
      )

      const claims: FaucetTx[] = claimLogs
        .filter((log) => log.blockNumber && log.transactionHash && log.args.user)
        .map((log) => ({
          hash: log.transactionHash as `0x${string}`,
          address: log.args.user as `0x${string}`,
          action: 'Claim',
          amount: (log.args.amount as bigint) ?? 0n,
          timestamp: blockTimestamps.get(log.blockNumber as bigint) ?? 0,
        }))

      const mints: FaucetTx[] = mintLogs
        .filter((log) => log.blockNumber && log.transactionHash && log.args.to)
        .map((log) => ({
          hash: log.transactionHash as `0x${string}`,
          address: log.args.to as `0x${string}`,
          action: 'Mint',
          amount: (log.args.amount as bigint) ?? 0n,
          timestamp: blockTimestamps.get(log.blockNumber as bigint) ?? 0,
        }))

      const transfers: FaucetTx[] = transferLogs
        .filter(
          (log) =>
            log.blockNumber &&
            log.transactionHash &&
            log.args.from &&
            log.args.to &&
            log.args.from !== zeroAddress &&
            log.args.to !== zeroAddress,
        )
        .map((log) => ({
          hash: log.transactionHash as `0x${string}`,
          address: log.args.from as `0x${string}`,
          action: 'Transfer',
          amount: (log.args.value as bigint) ?? 0n,
          timestamp: blockTimestamps.get(log.blockNumber as bigint) ?? 0,
        }))

      return [...claims, ...mints, ...transfers]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 15)
    },
    refetchInterval: 20000,
  })
}
