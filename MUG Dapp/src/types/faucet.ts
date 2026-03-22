export type FaucetAction = 'Claim' | 'Mint' | 'Transfer'

export type FaucetTx = {
  hash: `0x${string}`
  address: `0x${string}`
  action: FaucetAction
  amount: bigint
  timestamp: number
}
