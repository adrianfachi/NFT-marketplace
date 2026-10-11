import { delay, http, HttpResponse } from 'msw'
import { getState, resetMocks } from './db'

export const mockScenarios = [
  'default',
  'empty',
  'slow',
  'variable-latency',
  'offline',
  'http-4xx',
  'http-5xx',
  'session-expired',
  'unauthorized',
  'signup-conflict',
  'invalid-coupon',
  'expired-coupon',
  'price-changed',
  'sold-out',
  'order-timeout-after-create',
  'payment-confirmed',
  'payment-rejected',
  'payment-pending',
  'wallet-rejected',
  'wallet-disconnected',
] as const

export type MockScenario = typeof mockScenarios[number]

const STORAGE_KEY = 'kurio-mock-scenario'
const DEFAULT_SCENARIO: MockScenario = 'default'
let requestNumber = 0
let sessionExpiredAt = 3
let scenarioMutationApplied = false

function isScenario(value: string | null | undefined): value is MockScenario {
  return Boolean(value && (mockScenarios as readonly string[]).includes(value))
}

function storedScenario(): MockScenario | undefined {
  if (typeof localStorage === 'undefined') return undefined
  return isScenario(localStorage.getItem(STORAGE_KEY)) ? localStorage.getItem(STORAGE_KEY) as MockScenario : undefined
}

export function activeScenario(request?: Request): MockScenario {
  const queryScenario = request ? new URL(request.url).searchParams.get('scenario') : undefined
  const configured = import.meta.env.VITE_MOCK_SCENARIO as string | undefined
  return isScenario(queryScenario) ? queryScenario
    : storedScenario()
      ?? (isScenario(configured) ? configured : DEFAULT_SCENARIO)
}

export function setScenario(value: string): MockScenario {
  const scenario = isScenario(value) ? value : DEFAULT_SCENARIO
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, scenario)
  requestNumber = 0
  scenarioMutationApplied = false
  return scenario
}

export function resetScenario() {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY)
  requestNumber = 0
  sessionExpiredAt = 3
  scenarioMutationApplied = false
  resetMocks()
  return DEFAULT_SCENARIO
}

export function scenarioState(request?: Request) {
  return {
    scenario: activeScenario(request),
    requestNumber,
    sessionExpiredAt,
    available: mockScenarios,
  }
}

export function scenarioHandlers() {
  return [
    http.post('/__mock/scenario', async ({ request }) => {
      const body = await request.json() as { scenario?: string; sessionExpiredAt?: number }
      setScenario(body.scenario ?? DEFAULT_SCENARIO)
      if (typeof body.sessionExpiredAt === 'number' && Number.isInteger(body.sessionExpiredAt) && body.sessionExpiredAt > 0) {
        sessionExpiredAt = body.sessionExpiredAt
      }
      return HttpResponse.json(scenarioState(request))
    }),
    http.post('/__mock/reset', () => HttpResponse.json({ scenario: resetScenario(), state: getState() })),
    http.get('/__mock/state', ({ request }) => HttpResponse.json({ ...scenarioState(request), state: getState() })),
    http.all('*', async ({ request }) => {
      const scenario = activeScenario(request)
      const isApiRequest = request.url.includes('/api/')
      if (isApiRequest) requestNumber += 1
      if (isApiRequest) {
        if (scenario === 'slow') await delay(350)
        if (scenario === 'variable-latency') await delay(50 + ((requestNumber * 73) % 251))
        if (scenario === 'offline') return HttpResponse.error()
        if (scenario === 'http-4xx') return HttpResponse.json({ code: 'MOCK_HTTP_4XX', message: 'Erro 4xx simulado.' }, { status: 400 })
        if (scenario === 'http-5xx') return HttpResponse.json({ code: 'MOCK_HTTP_5XX', message: 'Erro 5xx simulado.' }, { status: 503 })
        if (scenario === 'session-expired' && requestNumber >= sessionExpiredAt) {
          return HttpResponse.json({ code: 'SESSION_EXPIRED', message: 'Sessão expirada.' }, { status: 401 })
        }
        if (scenario === 'unauthorized') {
          return HttpResponse.json({ code: 'FORBIDDEN', message: 'Acesso não autorizado.' }, { status: 403 })
        }
      }
      if (scenario === 'empty' && request.url.endsWith('/api/nfts')) {
        const url = new URL(request.url)
        return HttpResponse.json({
          items: [],
          page: Number(url.searchParams.get('page') ?? 1),
          pageSize: Number(url.searchParams.get('pageSize') ?? 12),
          total: 0,
        })
      }
      if (scenario === 'empty' && request.url.endsWith('/api/cart')) {
        return HttpResponse.json({ items: [], subtotal: '0.000', discount: '0.000', networkFee: '0.000', total: '0.000' })
      }
      if (scenario === 'signup-conflict' && request.url.endsWith('/api/auth/register')) {
        return HttpResponse.json({ code: 'EMAIL_EXISTS', message: 'E-mail já cadastrado.' }, { status: 409 })
      }
      if (scenario === 'invalid-coupon' && request.url.endsWith('/api/cart/coupon')) {
        return HttpResponse.json({ code: 'INVALID_COUPON', message: 'Cupom inválido.' }, { status: 400 })
      }
      if (scenario === 'expired-coupon' && request.url.endsWith('/api/cart/coupon')) {
        return HttpResponse.json({ code: 'EXPIRED_COUPON', message: 'Cupom expirado.' }, { status: 410 })
      }
      return undefined
    }),
  ]
}

export function scenarioForRequest(request: Request) {
  return activeScenario(request)
}

export function scenarioOrderStatus(request: Request) {
  const scenario = scenarioForRequest(request)
  return scenario === 'payment-rejected' ? 'rejected'
    : scenario === 'payment-confirmed' ? 'confirmed'
      : scenario === 'payment-pending' ? 'pending'
        : undefined
}

export function shouldTimeoutOrder(request: Request) {
  return scenarioForRequest(request) === 'order-timeout-after-create'
}

export function consumeScenarioMutation(request: Request) {
  const scenario = scenarioForRequest(request)
  if (scenarioMutationApplied || (scenario !== 'price-changed' && scenario !== 'sold-out')) return false
  scenarioMutationApplied = true
  return scenario
}
