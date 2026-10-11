import { http, HttpResponse } from 'msw'
import type { OrderResponse } from '@/types/api'
import { cartFor, getState, nftById, nextOrderId, persistState, setCart, userFromRequest, type MockOrder } from '../db'
import { quoteFor } from './utils'
import { scenarioOrderStatus, shouldTimeoutOrder } from '../scenarios'

interface OrderPayload {
  quoteId: string
  version: number
  wallet: string
  network?: string
  coupon?: string
  collector: { name: string; email: string; profile: string }
}

const fingerprint = (body: OrderPayload) => JSON.stringify(body)
function publicOrder(order: MockOrder): OrderResponse {
  return Object.fromEntries(
    Object.entries(order).filter(([key]) => key !== 'userId' && key !== 'idempotencyKey'),
  ) as OrderResponse
}

export const orderHandlers = [
  http.post('/api/orders', async ({ request }) => {
    const user = userFromRequest(request)
    if (!user) return HttpResponse.json({ code: 'UNAUTHENTICATED' }, { status: 401 })
    const key = request.headers.get('idempotency-key')
    if (!key) return HttpResponse.json({ code: 'IDEMPOTENCY_KEY_REQUIRED', message: 'Idempotency-Key é obrigatório.' }, { status: 400 })
    const body = await request.json() as OrderPayload
    const bodyFingerprint = fingerprint(body)
    const scopedKey = `${user.id}:${key}`
    const previous = getState().idempotentOrders[scopedKey]
    if (previous) {
      if (previous.fingerprint !== bodyFingerprint) return HttpResponse.json({ code: 'IDEMPOTENCY_CONFLICT' }, { status: 409 })
      return HttpResponse.json(publicOrder(getState().orders[previous.orderId]))
    }
    const quote = quoteFor(user.id, body.coupon ?? getState().appliedCoupon[user.id] ?? '')
    if (quote.quoteId !== body.quoteId || quote.version !== body.version) {
      return HttpResponse.json({ code: 'QUOTE_CHANGED', quote }, { status: 409 })
    }
    const outOfStock = quote.items.some(item => {
      const nft = nftById(item.id)
      return !nft || (nft.available !== undefined && item.quantity > nft.available)
    })
    if (outOfStock) return HttpResponse.json({ code: 'OUT_OF_STOCK', quote }, { status: 409 })
    const orderId = nextOrderId()
    const status: OrderResponse['status'] = scenarioOrderStatus(request) ?? 'confirmed'
    const order: MockOrder = {
      orderId,
      userId: user.id,
      status,
      success: status === 'confirmed',
      transactionId: status === 'confirmed' ? `0xKURIO${orderId.slice(-4).toUpperCase()}` : '',
      date: new Date().toISOString(),
      total: quote.total,
      networkFee: quote.networkFee,
      wallet: body.wallet,
      network: body.network ?? user.network,
      items: quote.items.flatMap(item => {
        const nft = nftById(item.id)
        return nft ? [{ id: nft.id, quantity: item.quantity, title: nft.title, tokenId: nft.tokenId, price: item.price, subtotal: item.subtotal, image: nft.image }] : []
      }),
      idempotencyKey: key,
      version: quote.version,
      collector: body.collector,
      walletAddress: user.walletAddress,
    }
    getState().orders[orderId] = order
    getState().idempotentOrders[scopedKey] = { orderId, fingerprint: bodyFingerprint }
    if (status === 'confirmed') {
      const purchased = new Map(quote.items.map(item => [item.id, item.quantity]))
      setCart(user.id, cartFor(user.id).flatMap(item => {
        const remaining = item.quantity - (purchased.get(item.id) ?? 0)
        return remaining > 0 ? [{ ...item, quantity: remaining }] : []
      }))
    } else {
      persistState()
    }
    if (shouldTimeoutOrder(request)) {
      await new Promise<never>(() => undefined)
    }
    return HttpResponse.json(publicOrder(order), { status: 201 })
  }),
  http.get('/api/orders', ({ request }) => {
    const user = userFromRequest(request)
    const key = new URL(request.url).searchParams.get('idempotencyKey')
    const order = key && user ? getState().orders[getState().idempotentOrders[`${user.id}:${key}`]?.orderId] : undefined
    if (!order || order.userId !== user?.id) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
    return HttpResponse.json(publicOrder(order))
  }),
  http.get('/api/orders/:id', ({ request, params }) => {
    const user = userFromRequest(request)
    const order = getState().orders[String(params.id)]
    if (!user || !order || order.userId !== user.id) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
    return HttpResponse.json(publicOrder(order))
  }),
]
