import { nftsCatalog, type NftItem } from './nftsData'
import type { EthValue } from '@/lib/money'
import type { OrderResponse, UserProfile } from '@/types/api'

export interface CartItemRef {
  id: string
  quantity: number
}

interface MockUser extends UserProfile {
  password: string
}

export interface MockState {
  usersDb: MockUser[]
  sessions: Record<string, string>
  favoriteByUser: Record<string, string[]>
  cartReferences: Record<string, CartItemRef[]>
  appliedCoupon: Record<string, string>
  orders: Record<string, MockOrder>
  idempotentOrders: Record<string, { orderId: string; fingerprint: string }>
  nextUserId: number
  nextOrderId: number
  nftOverrides: Record<string, { price?: EthValue; available?: number }>
  nftVersions: Record<string, number>
  cartVersions: Record<string, number>
  realtimeVersions: Record<string, number>
  couponVersions: Record<string, number>
}

export type MockOrder = OrderResponse & { userId: string; idempotencyKey: string }

const STORAGE_KEY = 'kurio-mock-db'
const TOKEN_PREFIX = 'mock-jwt-token-'

const initialUsers = (): MockUser[] => [
  {
    id: 'user-1',
    email: 'contato@email.com',
    password: '123456',
    name: 'Adriano Colecionador',
    username: 'adrianonfts',
    ens: 'adriano.eth',
    walletAddress: '0xA91F...E82C',
    walletType: 'MetaMask',
    network: 'Ethereum',
    secondaryWallet: '',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
  },
  {
    id: 'user-2',
    email: 'gabriel@kurio.io',
    password: 'password123',
    name: 'Gabriel Silva',
    username: 'gabrielnfts',
    ens: 'gabriel.eth',
    walletAddress: '0x7B2C...33F1',
    walletType: 'Coinbase Wallet',
    network: 'Polygon',
    secondaryWallet: '0x111A...222B',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
  },
]

function createInitialState(): MockState {
  return {
    usersDb: initialUsers(),
    sessions: {},
    favoriteByUser: { 'user-1': [], 'user-2': [] },
    cartReferences: {
      'user-1': [{ id: '1', quantity: 2 }, { id: '5', quantity: 6 }, { id: '6', quantity: 9 }],
      'user-2': [{ id: '2', quantity: 1 }],
    },
    appliedCoupon: {},
    orders: {},
    idempotentOrders: {},
    nextUserId: 3,
    nextOrderId: 1,
    nftOverrides: {},
    nftVersions: {},
    cartVersions: { 'user-1': 1, 'user-2': 1 },
    realtimeVersions: {},
    couponVersions: {},
  }
}

function loadState(): MockState {
  if (typeof localStorage === 'undefined') return createInitialState()
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) as MockState : createInitialState()
  } catch {
    return createInitialState()
  }
}

let state = loadState()
state.nftOverrides ??= {}
state.nftVersions ??= {}
state.cartVersions ??= {}
state.realtimeVersions ??= {}
state.couponVersions ??= {}

export function persistState() {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function getState(): MockState {
  return state
}

export function resetMocks() {
  state = createInitialState()
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('kurio-orders')
  }
  persistState()
  return state
}

export function publicUser(user: MockUser): UserProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    ens: user.ens,
    walletAddress: user.walletAddress,
    walletType: user.walletType,
    network: user.network,
    secondaryWallet: user.secondaryWallet,
    avatar: user.avatar,
  }
}

export function userFromRequest(request: Request): MockUser | undefined {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const userId = token ? state.sessions[token] : undefined
  return userId ? state.usersDb.find(user => user.id === userId) : undefined
}

export function tokenFor(userId: string) {
  const token = `${TOKEN_PREFIX}${userId}`
  state.sessions[token] = userId
  persistState()
  return token
}

export function nftById(id: string) {
  const nft = nftsCatalog.find(item => item.id === id)
  const override = state.nftOverrides[id]
  return nft && override ? { ...nft, ...override, priceFormatted: `${override.price ?? nft.price} ETH` } : nft
}

export function updateNft(id: string, changes: { price?: EthValue; available?: number }) {
  state.nftOverrides[id] = { ...state.nftOverrides[id], ...changes }
  state.nftVersions[id] = (state.nftVersions[id] ?? 0) + 1
  persistState()
}

export function nextRealtimeVersion(resource: 'nft' | 'order', resourceId: string) {
  const key = `${resource}:${resourceId}`
  state.realtimeVersions[key] = (state.realtimeVersions[key] ?? 0) + 1
  persistState()
  return state.realtimeVersions[key]
}

export function couponVersion(coupon: string) {
  const key = coupon.trim().toUpperCase() || 'none'
  if (!state.couponVersions[key]) state.couponVersions[key] = Object.keys(state.couponVersions).length + 1
  persistState()
  return state.couponVersions[key]
}

export function cartFor(userId: string): CartItemRef[] {
  return state.cartReferences[userId] ?? (state.cartReferences[userId] = [])
}

export function favoriteFor(userId: string): string[] {
  return state.favoriteByUser[userId] ?? (state.favoriteByUser[userId] = [])
}

export function setCart(userId: string, items: CartItemRef[]) {
  state.cartReferences[userId] = items
  state.cartVersions[userId] = (state.cartVersions[userId] ?? 0) + 1
  persistState()
}

export function setCoupon(userId: string, coupon: string) {
  state.appliedCoupon[userId] = coupon
  persistState()
}

export function catalog(): NftItem[] {
  return nftsCatalog.map(nft => nftById(nft.id) ?? nft)
}

export function nextOrderId() {
  const value = `order-${String(state.nextOrderId).padStart(4, '0')}`
  state.nextOrderId += 1
  persistState()
  return value
}

export type { EthValue }
