import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { api } from '../services/api'
import { Feedback, Layout, NftCard, Quantity, type FeedbackState, nftImage, useCatalog } from '../components/Kurio'
import { useCartQuantityMutation, useCartQuery } from '../hooks/useCart'
import { IoTrashBinOutline, IoChevronBack } from "react-icons/io5"

export const Route = createFileRoute('/cart')({ component: Cart })

function Cart() {
  const navigate = useNavigate()
  const catalog = useCatalog()
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const cartQuery = useCartQuery()
  const cart = cartQuery.data
  const quantityMutation = useCartQuantityMutation()
  const [coupon, setCoupon] = useState('')
  const couponMutation = useMutation({ mutationFn: api.applyCoupon, onSuccess: () => cartQuery.refetch() })

  async function changeQuantity(id: string, quantity: number) {
    try {
      await quantityMutation.mutateAsync({ id, quantity })
      setFeedback({ type: 'success', message: quantity ? 'Quantidade atualizada.' : 'NFT removido do carrinho.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Não foi possível atualizar o carrinho.' })
    }
  }

  return (
    <Layout>
      <div className="w-full max-w-[1080px] mx-auto grid grid-cols-[1fr_300px] gap-[55px] py-[28px] pb-[70px] box-border max-md:flex max-md:flex-col max-md:items-center max-md:px-4 max-md:py-6 max-md:w-full max-md:overflow-x-hidden">
        <div className="hidden max-md:flex items-center justify-between mb-5 w-full max-w-[360px] mx-auto box-border">
          <button 
            type="button" 
            onClick={() => navigate({ to: '/' })}
            className="w-10 h-10 rounded-full bg-[var(--panel)] border border-[var(--line)] flex items-center justify-center text-white cursor-pointer shrink-0"
          >
            <IoChevronBack size={18} />
          </button>
          <h1 className="text-lg font-bold text-white font-mono truncate mx-2">Carrinho de NFTs</h1>
          <div className="w-10 shrink-0"></div>
        </div>

        <section className="w-full min-w-0 box-border max-md:max-w-[360px] max-md:mx-auto">
          <div className="text-[var(--text-soft)] max-md:hidden">Início / Mercado / Carrinho</div>
          <Feedback feedback={feedback} />
          
          <div className="grid grid-cols-[60px_1fr_120px_120px_120px_24px] items-center gap-3 border-b border-[var(--line)] pb-3 mt-[30px] text-xs font-mono max-md:hidden">
            <span className="col-span-2 text-white font-bold">NFTs</span>
            <span className="text-center text-[#c2a892]">Preço</span>
            <span className="text-center text-[#c2a892]">Edições</span>
            <span className="text-right text-[#c2a892]">Total</span>
            <span></span>
          </div>

          <div className="flex flex-col gap-2.5 mt-3 max-md:mt-0 w-full box-border">
            {cart?.items.map(item => {
              const numericPrice = parseFloat(item.priceFormatted.replace(/[^0-9.]/g, '')) || 0
              const itemTotal = (numericPrice * item.quantity).toFixed(2) + ' ETH'

              return (
                <div 
                  className="grid grid-cols-[60px_1fr_120px_120px_120px_24px] items-center gap-3 bg-[var(--panel)] p-3 rounded-xl max-md:flex max-md:items-center max-md:gap-3 max-md:p-2.5 max-md:rounded-2xl max-md:border max-md:border-[var(--line)] w-full box-border min-w-0" 
                  key={item.id}
                >
                  <img src={nftImage(item)} alt={item.title} className="w-[60px] h-[60px] object-cover rounded max-md:w-16 max-md:h-16 max-md:rounded-xl shrink-0" />
                  
                  <div className="max-md:flex-1 max-md:min-w-0 max-md:flex max-md:flex-col max-md:justify-between max-md:h-16">
                    <div>
                      <b className="font-bold text-white text-xs block max-md:text-xs font-mono truncate">{item.title}</b>
                      <p className="text-[var(--text-soft)] text-[10px] font-mono mt-0.5 max-md:text-[11px]">Edição: 1/50</p>
                    </div>
                    <strong className="text-right text-xs font-mono text-[var(--gold)] font-bold max-md:text-left max-md:text-sm">{item.priceFormatted}</strong>
                  </div>

                  <span className="text-center text-xs font-mono text-[#f5f1eb] max-md:hidden">{item.priceFormatted}</span>
                  
                  <div className="flex justify-center max-md:ml-auto max-md:self-center shrink-0">
                    <Quantity value={item.quantity} onChange={quantity => changeQuantity(item.id, quantity)} />
                  </div>

                  <strong className="text-right text-xs font-mono text-[var(--gold)] font-bold max-md:hidden">{itemTotal}</strong>
                  <button 
                    type="button" 
                    className="border-0 bg-transparent text-[var(--text-soft)] hover:text-[var(--gold)] cursor-pointer flex justify-end max-md:hidden transition-colors" 
                    disabled={quantityMutation.isPending} 
                    onClick={() => changeQuantity(item.id, 0)} 
                    aria-label={`Remover ${item.title}`}
                  >
                    <IoTrashBinOutline size={16} />
                  </button>
                </div>
              )
            })}
          </div>

          {!cart?.items.length && <p className="text-[var(--text-soft)] py-[25px]">Seu carrinho está vazio.</p>}
          <h3 className="text-[var(--gold)] text-sm border-b border-[var(--line)] pb-3 mt-[30px] max-md:hidden">Colecionadores também viram</h3>
          <div className="grid grid-cols-5 gap-5 my-5 mb-[65px] max-md:hidden">{catalog.slice(3, 8).map(nft => <NftCard compact key={nft.id} nft={nft} />)}</div>
        </section>
        
        <aside className="border-t border-[var(--line)] pt-3 max-md:mt-6 max-md:border-0 max-md:bg-[var(--panel)] max-md:p-4 max-md:rounded-3xl max-md:w-full max-md:max-w-[360px] max-md:mx-auto max-md:box-border max-md:min-w-0">
          <h3 className="text-sm font-bold mb-3 max-md:hidden">Resumo da carteira</h3>
          
          <div className="relative flex items-center mb-4 w-full box-border">
            <Input 
              value={coupon} 
              onChange={event => setCoupon(event.target.value)} 
              placeholder="Digite o código promocional..." 
              className="bg-transparent border border-[var(--line)] text-white p-[10px] pr-28 rounded-full text-xs placeholder:text-[var(--text-soft)] h-12 w-full box-border" 
            />
            <Button 
              type="button" 
              disabled={couponMutation.isPending} 
              onClick={() => couponMutation.mutate(coupon)} 
              className="absolute right-1 bg-[var(--primary)] text-[var(--ink)] font-bold rounded-full px-6 text-xs h-10 hover:bg-[var(--primary-light)] shrink-0"
            >
              Aplicar
            </Button>
          </div>

          {couponMutation.isError && <p className="text-[#ed8b6d] text-[10px] my-2" role="alert">{couponMutation.error.message}</p>}
          {couponMutation.isSuccess && <p className="text-[#73d6ae] text-[10px] my-2" role="status">Cupom aplicado.</p>}
          
          <p className="flex justify-between text-[var(--text-soft)] my-2 text-xs font-mono">Subtotal <span>{cart?.subtotal ?? '8.92 ETH'}</span></p>
          <p className="flex justify-between text-[var(--text-soft)] my-2 text-xs font-mono">Desconto do lançamento <span>{cart?.discount ?? '(-) 00.00'}</span></p>
          
          <div className="my-2">
            <p className="flex justify-between text-[var(--text-soft)] text-xs font-mono">Taxa de rede <span>{cart?.networkFee ?? '0.016 ETH'}</span></p>
            <span className="text-[10px] text-[var(--gold)] text-right block">Taxa estimada</span>
          </div>

          <p className="flex justify-between border-t border-[var(--line)] pt-3 mt-3 text-white text-sm font-mono font-bold"><b>Total</b><strong className="text-[var(--gold)] text-base">{cart?.total ?? '8.936 ETH'}</strong></p>
          
          <Link 
            className={`border-0 bg-[var(--primary)] text-[var(--ink)] font-bold py-3.5 px-6 text-center block w-full mt-5 rounded-full text-sm hover:bg-[var(--primary-light)] transition-colors box-border ${!cart?.items.length ? 'opacity-50 pointer-events-none' : ''}`} 
            to={sessionStorage.getItem('kurio-session') ? '/checkout' : '/login'}
            search={sessionStorage.getItem('kurio-session') ? undefined : { redirect: '/checkout' }}
          >
            Conectar e finalizar
          </Link>
          <Link to="/" className="block text-center p-3 text-[var(--gold)] max-md:hidden">Continuar explorando</Link>
        </aside>
      </div>
    </Layout>
  )
}