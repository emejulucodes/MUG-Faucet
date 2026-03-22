import { useQuery } from '@tanstack/react-query'
import { zeroAddress } from 'viem'
import { usePublicClient } from 'wagmi'
import { CONTRACT_ADDRESS } from '../constants/contract'
import { targetChain } from '../constants/wagmi'
import type { FaucetTx } from '../types/faucet'

const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60
const BLOCK_TIME_SAMPLE_SIZE = 1000n
const LOOKBACK_SAFETY_BUFFER = 1.25
const LOG_BATCH_SIZE = 20_000n
const MIN_LOOKBACK_BLOCKS = 5_000n
const MAX_LOOKBACK_BLOCKS = 120_000n

export const useRecentTransactions = () => {
  const publicClient = usePublicClient({ chainId: targetChain.id })

  return useQuery({
    queryKey: ['recent-faucet-transactions', targetChain.id],
    queryFn: async (): Promise<FaucetTx[]> => {
      if (!publicClient) return []

      const latestBlock = await publicClient.getBlockNumber()
      const sampleSize = latestBlock > BLOCK_TIME_SAMPLE_SIZE ? BLOCK_TIME_SAMPLE_SIZE : latestBlock

      let fromBlock = 0n
      if (sampleSize > 0n) {
        const sampledBlockNumber = latestBlock - sampleSize
        const [latestBlockData, sampledBlockData] = await Promise.all([
          publicClient.getBlock({ blockNumber: latestBlock }),
          publicClient.getBlock({ blockNumber: sampledBlockNumber }),
        ])

        const secondsElapsed = Number(latestBlockData.timestamp - sampledBlockData.timestamp)
        const safeSecondsPerBlock = Math.max(1, secondsElapsed / Number(sampleSize))
        const estimatedLookbackBlocks = BigInt(
          Math.ceil((THIRTY_DAYS_IN_SECONDS / safeSecondsPerBlock) * LOOKBACK_SAFETY_BUFFER),
        )

        const boundedLookbackBlocks =
          estimatedLookbackBlocks < MIN_LOOKBACK_BLOCKS
            ? MIN_LOOKBACK_BLOCKS
            : estimatedLookbackBlocks > MAX_LOOKBACK_BLOCKS
              ? MAX_LOOKBACK_BLOCKS
              : estimatedLookbackBlocks

        fromBlock = latestBlock > boundedLookbackBlocks ? latestBlock - boundedLookbackBlocks : 0n
      }

      const blockRanges: Array<{ fromBlock: bigint; toBlock: bigint }> = []
      for (let startBlock = fromBlock; startBlock <= latestBlock; startBlock += LOG_BATCH_SIZE) {
        const endBlock = startBlock + LOG_BATCH_SIZE - 1n
        blockRanges.push({
          fromBlock: startBlock,
          toBlock: endBlock > latestBlock ? latestBlock : endBlock,
        })
      }

      const claimLogs = []
      const mintLogs = []
      const transferLogs = []

      for (const range of blockRanges) {
        try {
          const [claimBatch, mintBatch, transferBatch] = await Promise.all([
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
              fromBlock: range.fromBlock,
              toBlock: range.toBlock,
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
              fromBlock: range.fromBlock,
              toBlock: range.toBlock,
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
              fromBlock: range.fromBlock,
              toBlock: range.toBlock,
            }),
          ])

          claimLogs.push(...claimBatch)
          mintLogs.push(...mintBatch)
          transferLogs.push(...transferBatch)
        } catch (error) {
          console.warn('Skipping failed log range', range, error)
        }
      }

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
    },
    refetchInterval: 20000,
  })
}
