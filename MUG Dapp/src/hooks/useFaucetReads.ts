import { useQuery } from '@tanstack/react-query'
import { useAccount, useBalance, useChainId, usePublicClient, useReadContracts } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../constants/contract'
import { targetChain } from '../constants/wagmi'

export const useFaucetReads = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient({ chainId: targetChain.id })

  const readResult = useReadContracts({
    contracts: [
      { abi: CONTRACT_ABI, address: CONTRACT_ADDRESS, functionName: 'totalSupply' },
      { abi: CONTRACT_ABI, address: CONTRACT_ADDRESS, functionName: 'MAX_SUPPLY' },
      { abi: CONTRACT_ABI, address: CONTRACT_ADDRESS, functionName: 'owner' },
      { abi: CONTRACT_ABI, address: CONTRACT_ADDRESS, functionName: 'symbol' },
      { abi: CONTRACT_ABI, address: CONTRACT_ADDRESS, functionName: 'name' },
      { abi: CONTRACT_ABI, address: CONTRACT_ADDRESS, functionName: 'decimals' },
      { abi: CONTRACT_ABI, address: CONTRACT_ADDRESS, functionName: 'CLAIM_AMOUNT' },
      { abi: CONTRACT_ABI, address: CONTRACT_ADDRESS, functionName: 'CLAIM_INTERVAL' },
      {
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: 'balanceOf',
        args: [address ?? '0x0000000000000000000000000000000000000000'],
      },
      {
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: 'lastClaimTime',
        args: [address ?? '0x0000000000000000000000000000000000000000'],
      },
      {
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: 'balanceOf',
        args: [CONTRACT_ADDRESS],
      },
    ],
    query: {
      refetchInterval: 10000,
    },
  })

  const latestBlockTimestampQuery = useQuery({
    queryKey: ['latestBlockTimestamp', targetChain.id],
    queryFn: async () => {
      if (!publicClient) return Math.floor(Date.now() / 1000)
      const block = await publicClient.getBlock({ blockTag: 'latest' })
      return Number(block.timestamp)
    },
    refetchInterval: 15000,
  })

  const nativeBalanceQuery = useBalance({
    address,
    chainId: targetChain.id,
    query: {
      refetchInterval: 10000,
      enabled: Boolean(address),
    },
  })

  const [
    totalSupply,
    maxSupply,
    owner,
    symbol,
    name,
    decimals,
    claimAmount,
    claimInterval,
    userBalance,
    lastClaimTime,
    contractBalance,
  ] = readResult.data?.map((item) => item.result) ?? []

  return {
    address,
    chainId,
    hasNetworkMismatch: Boolean(chainId) && chainId !== targetChain.id,
    totalSupply: (totalSupply as bigint | undefined) ?? 0n,
    maxSupply: (maxSupply as bigint | undefined) ?? 0n,
    owner: (owner as `0x${string}` | undefined) ?? '0x0000000000000000000000000000000000000000',
    symbol: (symbol as string | undefined) ?? 'MUG',
    name: (name as string | undefined) ?? 'MUG Token',
    decimals: Number((decimals as number | bigint | undefined) ?? 18),
    claimAmount: (claimAmount as bigint | undefined) ?? 0n,
    claimInterval: (claimInterval as bigint | undefined) ?? 86400n,
    userBalance: (userBalance as bigint | undefined) ?? 0n,
    lastClaimTime: (lastClaimTime as bigint | undefined) ?? 0n,
    contractBalance: (contractBalance as bigint | undefined) ?? 0n,
    latestBlockTimestamp: latestBlockTimestampQuery.data,
    isLoadingReads: readResult.isLoading || latestBlockTimestampQuery.isLoading,
    isRefetchingReads: readResult.isRefetching,
    nativeBalance: nativeBalanceQuery.data,
  }
}
