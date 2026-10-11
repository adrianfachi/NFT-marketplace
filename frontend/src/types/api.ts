import type { NftItem } from './nft'
import type { EthValue } from '@/lib/money'

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterPayload extends AuthCredentials {
  username: string
  name: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  username: string
  ens: string
  walletAddress: string
  walletType: string
  network: string
  secondaryWallet: string
  avatar: string
}

export interface WalletOption {
  id: string
  address: string
  type: string
  network: string
  primary: boolean
}

export interface AuthResponse {
  success: boolean
  token: string
  user: UserProfile
}

export type OrderStatus = 'pending' | 'confirmed' | 'rejected'

export interface SessionResponse {
  authenticated: boolean
  user: UserProfile | null
}

export interface CartItem extends NftItem {
  quantity: number
  price: EthValue
  subtotal: EthValue
}

export interface CartResponse {
  items: CartItem[]
  subtotal: string
  discount: string
  networkFee: string
  total: string
}

export interface NftListResponse {
  items: NftItem[]
  page: number
  pageSize: number
  total: number
}

export interface Quote {
  quoteId: string
  version: number
  items: Array<{ id: string; quantity: number; price: string; subtotal: string; title: string; image: string }>
  subtotal: string
  discount: string
  networkFee: string
  total: string
  coupon?: string
}

export interface CheckoutResponse {
  success: boolean
  transactionId: string
  date: string
  total: string
  networkFee: string
  wallet: string
  network: string
  items: Array<{ id: string; quantity: number; title: string; tokenId: string; price: EthValue; subtotal: EthValue; image: string }>
}

export interface FavoriteResponse {
  favorites: string[]
}

export interface OrderResponse extends CheckoutResponse {
  orderId: string
  status: OrderStatus
  version?: number
  explorerUrl?: string
  collector?: { name: string; email: string; profile: string }
  walletAddress?: string
}

export interface CouponResponse {
  valid: boolean
  code: string
  discount: string
  message: string
}

export interface ApiSuccessResponse {
  success: boolean
  message?: string
}
