import { http, HttpResponse } from 'msw'
import { cartFor, persistState, setCart, setCoupon } from '../db'
import { cartSnapshot, requireUser } from './utils'

export const cartHandlers = [
  http.get('/api/cart', ({ request }) => {
    try { return HttpResponse.json(cartSnapshot(requireUser(request).id)) } catch (error) { return error instanceof Response ? error : HttpResponse.json({ code: 'CART_FAILED' }, { status: 500 }) }
  }),
  http.post('/api/cart', async ({ request }) => {
    try {
      const user = requireUser(request)
      const body = await request.json() as { id: string; quantity: number }
      const items = cartFor(user.id).filter(item => item.id !== body.id)
      if (body.quantity > 0) items.push({ id: body.id, quantity: body.quantity })
      setCart(user.id, items)
      return HttpResponse.json({ success: true, message: 'Carrinho atualizado.' })
    } catch (error) { return error instanceof Response ? error : HttpResponse.json({ code: 'CART_FAILED' }, { status: 500 }) }
  }),
  http.post('/api/cart/coupon', async ({ request }) => {
    const user = requireUser(request)
    const { code } = await request.json() as { code: string }
    const normalized = code.trim().toUpperCase()
    if (normalized !== 'KURIO10') return HttpResponse.json({ valid: false, code: normalized, discount: '0.000', message: 'Cupom inválido.' }, { status: 400 })
    setCoupon(user.id, normalized)
    persistState()
    return HttpResponse.json({ valid: true, code: normalized, discount: '10%', message: 'Cupom aplicado.' })
  }),
]
