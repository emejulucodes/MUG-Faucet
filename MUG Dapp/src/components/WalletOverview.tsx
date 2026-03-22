import { Copy, ExternalLink, Landmark, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import type { UseBalanceReturnType } from 'wagmi'
import { targetChain } from '../constants/wagmi'
import { shortenAddress } from '../utils/format'

type WalletOverviewProps = {
  address?: `0x${string}`
  tokenBalanceFormatted: string
  tokenSymbol: string
  nativeBalance?: UseBalanceReturnType['data']
}

export const WalletOverview = ({
  address,
  tokenBalanceFormatted,
  tokenSymbol,
  nativeBalance,
}: WalletOverviewProps) => {
  const copyAddress = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    toast.success('Wallet address copied')
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-5 shadow-[0_10px_25px_-15px_rgba(15,23,42,0.95)]">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
        <span className="inline-flex items-center gap-2 rounded-lg border border-cyan-900/70 bg-cyan-950/40 px-2.5 py-1.5 font-medium text-cyan-200">
          <Wallet size={16} />
          {shortenAddress(address)}
        </span>
        <div className="flex items-center gap-2">
          {address ? (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-slate-100"
              onClick={copyAddress}
            >
              <Copy size={14} />
              Copy
            </button>
          ) : null}
          {address ? (
            <a
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-slate-100"
              href={`${targetChain.blockExplorers?.default.url}/address/${address}`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={14} />
              Explorer
            </a>
          ) : null}
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
          <p className="text-xs text-slate-400">Token balance</p>
          <p className="mt-1.5 text-lg font-semibold text-emerald-300">{tokenBalanceFormatted} {tokenSymbol}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
          <p className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <Landmark size={12} />
            Native balance
          </p>
          <p className="mt-1.5 text-lg font-semibold text-slate-100">
            {nativeBalance ? `${Number(nativeBalance.formatted).toFixed(4)} ${nativeBalance.symbol}` : '-'}
          </p>
        </div>
      </div>
    </div>
  )
}
