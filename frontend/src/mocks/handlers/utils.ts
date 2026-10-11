import { add, formatEth, mul, sub, type EthValue } from '@/lib/money'
import type { CartItem, CartResponse, Quote } from '@/types/api'
import { cartFor, couponVersion, getState, nftById, userFromRequest } from '../db'

export const NETWORK_FEE: EthValue = '0.016'

export function requireUser(request: Request) {
  const user = userFromRequest(request)
  if (!user) throw new Response(JSON.stringify({ code: 'UNAUTHENTICATED', message: 'Sessão necessária.' }), { status: 401 })
  return user
}

export function cartSnapshot(userId: string): CartResponse {
  const items: CartItem[] = cartFor(userId).flatMap(ref => {
    const nft = nftById(ref.id)
    return nft ? [{ ...nft, quantity: ref.quantity, subtotal: mul(nft.price, ref.quantity) }] : []
  })
  const subtotal = items.reduce<EthValue>((total, item) => add(total, item.subtotal), '0.000')
  return { items, subtotal, discount: '0.000', networkFee: NETWORK_FEE, total: add(subtotal, NETWORK_FEE) }
}

export function quoteFor(userId: string, coupon = ''): Quote {
  const cart = cartSnapshot(userId)
  const discount = coupon.toUpperCase() === 'KURIO10' ? formatEth(mul(cart.subtotal, 0.1)) : '0.000'
  const state = getState()
  const itemVersion = cart.items.reduce((total, item) => total + (state.nftVersions[item.id] ?? 0) * item.quantity, 0)
  const version = (state.cartVersions[userId] ?? 0) * 100000 + itemVersion * 100 + couponVersion(coupon)
  return {
    quoteId: `quote-${userId}-v${version}-${coupon.toUpperCase() || 'none'}`,
    version,
    items: cart.items.map(item => ({ id: item.id, quantity: item.quantity, price: item.price, subtotal: item.subtotal, title: item.title, image: item.image })),
    subtotal: cart.subtotal,
    discount,
    networkFee: cart.networkFee,
    total: add(sub(cart.subtotal, discount), cart.networkFee),
    coupon: coupon || undefined,
  }
}

export function sameQuote(left: Quote, right: Quote) {
  return left.quoteId === right.quoteId && left.version === right.version &&
    left.items.length === right.items.length &&
    left.items.every(item => right.items.some(other => other.id === item.id && other.quantity === item.quantity && other.price === item.price)) &&
    left.total === right.total
}
