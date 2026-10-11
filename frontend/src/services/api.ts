import axios from 'axios'
import { http } from '../lib/axios'
import type {
  ApiSuccessResponse, 
  AuthCredentials, 
  AuthResponse, 
  CartResponse, 
  CouponResponse,
  FavoriteResponse,
  OrderResponse,
  SessionResponse,
  RegisterPayload, 
  UserProfile,
  NftListResponse,
  Quote,
  WalletOption,
} from '@/types/api';
import type { ApiError } from '@/types/errors'

interface ErrorPayload extends Partial<ApiError> {
  message?: string
  quote?: Quote
}

async function request<T>(url: string, init?: { method?: 'get' | 'post' | 'put'; data?: unknown; signal?: AbortSignal; headers?: Record<string, string> }): Promise<T> {
  try {
    const response = await http.request<T>({ url, method: init?.method ?? 'get', data: init?.data, signal: init?.signal, headers: init?.headers })
    return response.data
  } catch (error) {
    if (axios.isAxiosError<ErrorPayload>(error)) {
      const payload = error.response?.data
      const apiError = new Error(payload?.message ?? 'Não foi possível concluir a operação.') as Error & { apiError?: ApiError }
      apiError.apiError = {
        code: payload?.code ?? 'REQUEST_FAILED',
        message: payload?.message ?? 'Não foi possível concluir a operação.',
        fieldErrors: payload?.fieldErrors,
        retryable: payload?.retryable ?? (!error.response || error.response.status >= 500),
        status: error.response?.status,
      }
      if (payload?.quote) (apiError as Error & { apiError?: ApiError & { quote?: Quote } }).apiError!.quote = payload.quote
      throw apiError
    }
    throw error
  }
}

export const api = {
  getNfts: (params?: { search?: string; category?: string; sort?: string; page?: number; signal?: AbortSignal }) =>
    request<NftListResponse>(`/nfts?${new URLSearchParams(Object.entries(params ?? {}).filter(([key, value]) => key !== 'signal' && value !== undefined).map(([key, value]) => [key, String(value)]))}`, { signal: params?.signal }),
  login: (credentials: AuthCredentials) =>
    request<AuthResponse>('/auth/login', { method: 'post', data: credentials }),
  register: (payload: RegisterPayload) =>
    request<AuthResponse>('/auth/register', { method: 'post', data: payload }),
  logout: () => request<ApiSuccessResponse>('/auth/logout', { method: 'post' }),
  getSession: (signal?: AbortSignal) => request<SessionResponse>('/auth/session', { signal }),
  getOrder: (orderId: string, signal?: AbortSignal) => request<OrderResponse>(`/orders/${orderId}`, { signal }),
  getOrderByIdempotencyKey: (idempotencyKey: string, signal?: AbortSignal) =>
    request<OrderResponse>(`/orders?idempotencyKey=${encodeURIComponent(idempotencyKey)}`, { signal }),
  getProfile: () => request<UserProfile>('/user/profile'),
  getWallets: () => request<{ wallets: WalletOption[] }>('/wallets'),
  connectWallet: (wallet: Omit<WalletOption, 'id' | 'primary'>) =>
    request<{ wallet: WalletOption }>('/wallets/connect', { method: 'post', data: wallet }),
  disconnectWallet: (id: string) =>
    request<ApiSuccessResponse>('/wallets/disconnect', { method: 'post', data: { id } }),
  updateProfile: (profile: Partial<UserProfile>) =>
    request<{ success: boolean; user: UserProfile }>('/user/profile', { method: 'put', data: profile }),
  updatePassword: (currentPassword: string, newPassword: string) =>
    request<{ success: boolean; message: string }>('/user/password', { method: 'put', data: { currentPassword, newPassword } }),
  updateWallet: (wallet: Partial<UserProfile>) =>
    request<{ success: boolean; user: UserProfile }>('/user/wallet', { method: 'put', data: wallet }),
  getCart: (signal?: AbortSignal) => request<CartResponse>('/cart', { signal }),
  updateCart: (id: string, quantity: number) =>
    request<ApiSuccessResponse>('/cart', { method: 'post', data: { id, quantity } }),
  subscribeNewsletter: (email: string) =>
    request<ApiSuccessResponse>('/newsletter', { method: 'post', data: { email } }),
  getFavorites: () => request<FavoriteResponse>('/favorites'),
  toggleFavorite: (id: string, favorite: boolean) =>
    request<FavoriteResponse>('/favorites', { method: 'post', data: { id, favorite } }),
  applyCoupon: (code: string) =>
    request<CouponResponse>('/cart/coupon', { method: 'post', data: { code } }),
  getQuote: (coupon?: string) =>
    request<Quote>('/quote', { method: 'post', data: { coupon } }),
  createOrder: (payload: { quoteId: string; version: number; wallet: string; network?: string; coupon?: string; collector: { name: string; email: string; profile: string } }, idempotencyKey: string) =>
    request<OrderResponse>('/orders', { method: 'post', data: payload, headers: { 'Idempotency-Key': idempotencyKey } }),
}
