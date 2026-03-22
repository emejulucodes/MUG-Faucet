import { isAddress } from 'viem'
import { MUG_ABI } from '../abi/mug_abi'

const envAddress = import.meta.env.VITE_CONTRACT_ADDRESS ?? ''

if (!isAddress(envAddress)) {
  throw new Error('Invalid VITE_CONTRACT_ADDRESS in .env')
}

export const CONTRACT_ADDRESS = envAddress
export const CONTRACT_ABI = MUG_ABI
