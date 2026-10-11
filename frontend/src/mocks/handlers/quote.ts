import { http, HttpResponse } from 'msw'
import { getState, userFromRequest, nftById, cartFor, updateNft } from '../db'
import { quoteFor } from './utils'
import { consumeScenarioMutation } from '../scenarios'
import { emitNftUpdate } from '../realtime'
import { add } from '@/lib/money'

export const quoteHandlers = [
  http.post('/api/quote', async ({ request }) => {
    const user = userFromRequest(request)
    if (!user) return HttpResponse.json({ code: 'UNAUTHENTICATED' }, { status: 401 })
    const firstItem = cartFor(user.id)[0]
    const mutation = consumeScenarioMutation(request)
    if (firstItem && mutation) {
      const nft = nftById(firstItem.id)
      if (nft) {
        const available = mutation === 'sold-out' ? 0 : nft.available
        const price = mutation === 'price-changed' ? add(nft.price, '0.001') : nft.price
        updateNft(firstItem.id, { available, price })
        emitNftUpdate(firstItem.id, price, available)
      }
    }
    const body = await request.json() as { coupon?: string }
    const quote = quoteFor(user.id, body.coupon ?? getState().appliedCoupon[user.id] ?? '')
    const unavailable = quote.items.find(item => {
      const nft = nftById(item.id)
      return !nft || (nft.available !== undefined && item.quantity > nft.available)
    })
    return unavailable ? HttpResponse.json({ code: 'OUT_OF_STOCK' }, { status: 409 }) : HttpResponse.json(quote)
  }),
]
