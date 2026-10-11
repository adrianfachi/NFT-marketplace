import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Layout } from '../../components/Kurio'
import { api } from '../../services/api'
import type { OrderResponse } from '@/types/api'

export const Route = createFileRoute('/checkout/success')({
  component: Success,
})

function Success() {
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [loading, setLoading] = useState(() => Boolean(sessionStorage.getItem('kurio-order-id')))

  useEffect(() => {
    const orderId = sessionStorage.getItem('kurio-order-id')
    if (!orderId) {
      return
    }

    const controller = new AbortController()
    api.getOrder(orderId, controller.signal)
      .then(response => {
        if (response.status === 'confirmed') setOrder(response)
        else setOrder(null)
      })
      .catch(() => {
        setOrder(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  if (loading) {
    return <Layout footer={false}><p className="text-center text-[var(--text-soft)] leading-[1.5] text-[9px]">Carregando recibo...</p></Layout>
  }

  if (!order) {
    return (
      <Layout footer={false}>
        <div className="w-[500px] max-w-full mx-auto my-10 bg-[var(--panel)] border-b-[6px] border-[var(--primary)] p-[22px] max-md:my-5 max-md:mx-6 max-md:p-[24px_18px]">
          <h3 className="text-center text-[11px] font-normal">Não foi possível confirmar este pedido.</h3>
          <p className="text-center text-[var(--text-soft)] leading-[1.5] text-[9px]">O pedido não existe ou ainda não foi confirmado pela rede.</p>
          <Link to="/cart" className="border-0 bg-[var(--primary)] text-[var(--ink)] font-bold py-[11px] px-[25px] text-center block w-max mx-auto mt-3">Voltar ao carrinho</Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout footer={false}>
      <div className="w-[500px] max-w-full mx-auto my-10 bg-[var(--panel)] border-b-[6px] border-[var(--primary)] p-[22px] max-md:my-5 max-md:mx-6 max-md:p-[24px_18px]">
        <div className="text-center text-[var(--gold)] border border-[var(--gold)] w-[42px] p-[5px] mx-auto mb-3 text-[9px]">THANK<br />YOU</div>
        <h3 className="text-center text-[11px] font-normal">Seus NFTs agora estão na sua carteira</h3>
        <div className="border-y border-[var(--line)] grid grid-cols-4 gap-2 py-[10px] text-[var(--text-soft)] text-[9px] max-md:grid-cols-2 max-md:gap-[18px_8px]">
          <span>ID da transação<br /><b className="text-white font-normal">{order.transactionId}</b></span>
          <span>Data<br /><b className="text-white font-normal">{order.date}</b></span>
          <span>Total<br /><b className="text-white font-normal">{order.total}</b></span>
          <span>Carteira<br /><b className="text-white font-normal">{order.wallet}</b></span>
        </div>
        <h4 className="text-xs font-bold my-3">Detalhes da transação</h4>
        {(order.items ?? []).map(item => (
          <div className="grid grid-cols-[42px_1fr_55px_70px] gap-2 items-center my-2 max-md:grid-cols-1" key={item.id}>
            <img src={item.image || '/src/assets/EmeraldApe.png'} alt={item.title} className="w-[42px] h-[42px] object-cover" />
            <span className="text-[10px]">{item.title}<small className="block text-[var(--text-soft)] text-[8px]">ID do token: {item.tokenId}</small></span>
            <small className="text-[var(--text-soft)]">( x {item.quantity} )</small>
            <strong className="text-[var(--gold)] text-[10px]">{item.subtotal}</strong>
          </div>
        ))}
        <p className="text-center text-[var(--text-soft)] leading-[1.5] text-[9px]">Rede: {order.network}</p>
        <p className="text-center text-[var(--text-soft)] leading-[1.5] text-[9px]">Taxa de rede: {order.networkFee}</p>
        <p className="flex justify-between border-t border-[var(--line)] pt-[10px] text-xs"><b>Total</b><strong className="text-[var(--gold)]">{order.total}</strong></p>
        <p className="text-center text-[var(--text-soft)] leading-[1.5] text-[9px]">Transação confirmada na {order.network} e registrada na rede.</p>
        <a href={order.explorerUrl ?? '/'} className="border-0 bg-[var(--primary)] text-[var(--ink)] font-bold py-[11px] px-[25px] text-center block w-max mx-auto mt-3">Ver no explorador</a>
      </div>
    </Layout>
  )
}