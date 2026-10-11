import { Link } from '@tanstack/react-router'
import { Minus, Plus } from 'lucide-react'
import type { NftItem } from '../mocks/nftsData'
import { nftImage } from './Kurio'

export function NftCard({ nft, compact = false }: { nft: NftItem; compact?: boolean }) {
  return (
    <Link to="/nfts/$nftId" params={{ nftId: nft.id }} className={`nft-card block min-w-0 group ${compact ? 'compact' : ''}`}>
      <img src={nftImage(nft)} alt={nft.title} loading="lazy" width="320" height="320" className={`w-full aspect-square object-cover rounded-t-lg bg-[var(--panel)] ${compact ? 'p-2' : 'p-[9px]'} group-hover:outline group-hover:outline-1 group-hover:outline-[var(--gold)]`} />
      <div className="pt-2 flex flex-col gap-[5px]">
        <span className={compact ? 'text-[10px]' : 'text-[11px]'}>{nft.title}</span>
        <strong className="text-[var(--gold)] text-xs">{nft.priceFormatted}</strong>
      </div>
    </Link>
  )
}

export function Quantity({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" className="border-0 bg-[var(--primary)] text-[var(--ink)] rounded-full w-[18px] h-[18px] grid place-items-center cursor-pointer" aria-label="Diminuir quantidade" onClick={() => onChange(Math.max(0, value - 1))}><Minus size={12} /></button>
      <span>{value}</span>
      <button type="button" className="border-0 bg-[var(--primary)] text-[var(--ink)] rounded-full w-[18px] h-[18px] grid place-items-center cursor-pointer" aria-label="Aumentar quantidade" onClick={() => onChange(value + 1)}><Plus size={12} /></button>
    </div>
  )
}