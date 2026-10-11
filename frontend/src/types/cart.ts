import type { CartItem, CartResponse } from '../lib/api.types'

export type { CartItem, CartResponse }

export interface CartSummary {
  subtotal: string
  discount: string
  networkFee: string
  total: string
}
