import { http, HttpResponse, ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import { cartFor, getState, nftById, nextRealtimeVersion, persistState, setCart, updateNft, userFromRequest } from './db'
import type { NftUpdatedEvent, OrderUpdatedEvent } from '@/lib/realtime'

const socketLink = ws.link('*/socket.io/*')
type Client = ReturnType<typeof toSocketIo> & { userId?: string; closeConnection: () => void }
const clients = new Set<Client>()

function now() {
  return '2026-10-10T23:00:00.000Z'
}

function emitNft(resourceId: string, price?: string, available?: number) {
  const version = nextRealtimeVersion('nft', resourceId)
  const event: NftUpdatedEvent = {
    eventId: `nft-${resourceId}-v${version}`,
    resource: 'nft',
    resourceId,
    version,
    occurredAt: now(),
    ...(price === undefined ? {} : { price }),
    ...(available === undefined ? {} : { available }),
  }

  clients.forEach(client => client.server.emit('nft.updated', event))
  return event
}

export function emitNftUpdate(resourceId: string, price?: string, available?: number) {
  return emitNft(resourceId, price, available)
}

function emitOrder(resourceId: string, status: OrderUpdatedEvent['status']) {
  const version = nextRealtimeVersion('order', resourceId)
  const event: OrderUpdatedEvent = {
    eventId: `order-${resourceId}-v${version}`,
    resource: 'order',
    resourceId,
    version,
    occurredAt: now(),
    status,
  }
  const ownerId = getState().orders[resourceId]?.userId
  if (!ownerId) throw new Error(`Cannot emit order.updated without an owner: ${resourceId}`)
  clients.forEach(client => {
    if (client.userId === ownerId) client.server.emit('order.updated', event)
  })
  return event
}

function readHandshakeToken(data: unknown) {
  if (typeof data !== 'string') return undefined
  const match = data.match(/^40(?:\/[^,]+)?(?:,(\{.*\}))?$/)
  if (!match?.[1]) return undefined
  try {
    const payload = JSON.parse(match[1]) as { token?: string }
    return payload.token
  } catch {
    return undefined
  }
}

export const socketHandler = socketLink.addEventListener('connection', connection => {
  const io = Object.assign(toSocketIo(connection), {
    closeConnection: () => connection.client.close(),
  }) as Client
  clients.add(io)
  const handleMessage = (event: MessageEvent) => {
    const token = readHandshakeToken(event.data)
    if (!token) return
    const user = userFromRequest(new Request('http://kurio.local', { headers: { Authorization: `Bearer ${token}` } }))
    io.userId = user?.id
  }
  connection.client.addEventListener('message', handleMessage)
  const cleanup = () => {
    connection.client.removeEventListener('message', handleMessage)
    clients.delete(io)
  }
  connection.server.addEventListener('close', cleanup)
  connection.client.addEventListener('close', cleanup)
})

export const realtimeHandlers = [
  http.post('/__mock/events/nft', async ({ request }) => {
    const body = await request.json() as { resourceId: string; price?: string; available?: number }
    if (!nftById(body.resourceId)) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
    updateNft(body.resourceId, { price: body.price, available: body.available })
    return HttpResponse.json(emitNft(body.resourceId, body.price, body.available))
  }),
  http.post('/__mock/events/order', async ({ request }) => {
    const body = await request.json() as { resourceId: string; status: OrderUpdatedEvent['status'] }
    const order = getState().orders[body.resourceId]
    if (!order) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
    order.status = body.status
    order.success = body.status === 'confirmed'
    if (body.status === 'confirmed') {
      const purchased = new Map(order.items.map(item => [item.id, item.quantity]))
      setCart(order.userId ?? '', cartFor(order.userId ?? '').flatMap(item => {
        const remaining = item.quantity - (purchased.get(item.id) ?? 0)
        return remaining > 0 ? [{ ...item, quantity: remaining }] : []
      }))
    }
    persistState()
    return HttpResponse.json(emitOrder(body.resourceId, body.status))
  }),
  http.post('/__mock/events/duplicate', async ({ request }) => {
    const body = await request.json() as { resource?: 'nft' | 'order'; resourceId: string }
    const resource = body.resource ?? 'nft'
    const event = resource === 'order'
      ? emitOrder(body.resourceId, getState().orders[body.resourceId]?.status ?? 'pending')
      : emitNft(body.resourceId)
    const duplicate = { ...event }
    clients.forEach(client => {
      if (resource === 'order' && client.userId !== getState().orders[body.resourceId]?.userId) return
      client.server.emit(`${resource}.updated`, duplicate)
    })
    return HttpResponse.json(duplicate)
  }),
  http.post('/__mock/events/stale', async ({ request }) => {
    const body = await request.json() as { resource?: 'nft' | 'order'; resourceId: string; version?: number }
    const resource = body.resource ?? 'nft'
    const event = resource === 'order'
      ? emitOrder(body.resourceId, getState().orders[body.resourceId]?.status ?? 'pending')
      : emitNft(body.resourceId)
    const stale = { ...event, eventId: `${event.eventId}-stale`, version: body.version ?? Math.max(0, event.version - 1) }
    clients.forEach(client => {
      if (resource === 'order' && client.userId !== getState().orders[body.resourceId]?.userId) return
      client.server.emit(`${resource}.updated`, stale)
    })
    return HttpResponse.json(stale)
  }),
  http.post('/__mock/socket/disconnect', () => {
    clients.forEach(client => client.closeConnection())
    return HttpResponse.json({ success: true })
  }),
  http.post('/__mock/socket/reconnect', () => HttpResponse.json({ success: true })),
]

export { socketLink }
