import { io, type Socket } from 'socket.io-client'
import type { EthValue } from './money'
import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { NftListResponse, OrderResponse } from '@/types/api'

export interface NftUpdatedEvent {
  resource: 'nft'
  resourceId: string
  eventId: string
  version: number
  occurredAt: string
  price?: EthValue
  available?: number
}

export interface OrderUpdatedEvent {
  resource: 'order'
  resourceId: string
  eventId: string
  version: number
  occurredAt: string
  status: 'pending' | 'confirmed' | 'rejected'
}

let socket: Socket | null = null

export function getRealtimeSocket() {
  if (!socket) {
    socket = io('/realtime', {
      autoConnect: false,
      transports: ['websocket'],
      reconnectionAttempts: 3,
      auth: { token: sessionStorage.getItem('kurio-session') },
    })
  }
  return socket
}

const seenEvents = new Set<string>()
const seenEventOrder: string[] = []
const resourceVersions = new Map<string, number>()
const terminalOrders = new Set<string>()

export type RealtimeNotice =
  | { kind: 'nft'; resourceId: string }
  | { kind: 'order'; orderId: string; status: OrderUpdatedEvent['status'] }

type RealtimeContextValue = { subscribe: (listener: (event: RealtimeNotice) => void) => () => void }
const RealtimeContext = createContext<RealtimeContextValue | null>(null)
const noticeListeners = new Set<(event: RealtimeNotice) => void>()
const realtimeContextValue: RealtimeContextValue = {
  subscribe: listener => {
    noticeListeners.add(listener)
    return () => noticeListeners.delete(listener)
  },
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [sessionToken, setSessionToken] = useState(() => sessionStorage.getItem('kurio-session'))
  const notify = (event: RealtimeNotice) => noticeListeners.forEach(listener => listener(event))
  useEffect(() => {
    const handleSessionChange = () => setSessionToken(sessionStorage.getItem('kurio-session'))
    window.addEventListener('kurio:session-changed', handleSessionChange)
    return () => window.removeEventListener('kurio:session-changed', handleSessionChange)
  }, [])
  useEffect(() => {
    if (!sessionToken) return
    const current = getRealtimeSocket()
    const applyNft = (event: NftUpdatedEvent) => {
        if (seenEvents.has(event.eventId)) return
        seenEvents.add(event.eventId)
        seenEventOrder.push(event.eventId)
        if (seenEventOrder.length > 100) {
          const expiredEvent = seenEventOrder.shift()
          if (expiredEvent) seenEvents.delete(expiredEvent)
        }
        const key = `${event.resource}:${event.resourceId}`
        if ((resourceVersions.get(key) ?? 0) >= event.version) return
        resourceVersions.set(key, event.version)
        queryClient.setQueriesData<NftListResponse>({ queryKey: ['nfts'] }, value => value ? {
          ...value,
          items: value.items.map(item => item.id === event.resourceId ? {
            ...item,
            ...(event.price === undefined ? {} : { price: event.price, priceFormatted: `${event.price} ETH` }),
            ...(event.available === undefined ? {} : { available: event.available }),
          } : item),
        } : value)
        queryClient.invalidateQueries({ queryKey: ['cart'] })
        queryClient.invalidateQueries({ queryKey: ['quote'] })
      notify({ kind: 'nft', resourceId: event.resourceId })
    }
    const applyOrder = (event: OrderUpdatedEvent) => {
        if (seenEvents.has(event.eventId)) return
        seenEvents.add(event.eventId)
        seenEventOrder.push(event.eventId)
        if (seenEventOrder.length > 100) {
          const expiredEvent = seenEventOrder.shift()
          if (expiredEvent) seenEvents.delete(expiredEvent)
        }
        const key = `${event.resource}:${event.resourceId}`
        if ((resourceVersions.get(key) ?? 0) >= event.version) return
        resourceVersions.set(key, event.version)
        if (terminalOrders.has(event.resourceId)) return
        if (event.status === 'confirmed' || event.status === 'rejected') terminalOrders.add(event.resourceId)
        queryClient.setQueryData<OrderResponse>(['order', event.resourceId], current => current ? { ...current, status: event.status, success: event.status === 'confirmed' } : current)
      notify({ kind: 'order', orderId: event.resourceId, status: event.status })
    }
    const handleConnect = () => {
      void queryClient.invalidateQueries({ queryKey: ['nfts'] })
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      void queryClient.invalidateQueries({ queryKey: ['quote'] })
      void queryClient.invalidateQueries({ queryKey: ['order'] })
    }
    current.on('nft.updated', applyNft)
    current.on('order.updated', applyOrder)
    current.on('connect', handleConnect)
    current.connect()
    return () => {
      current.off('nft.updated', applyNft)
      current.off('order.updated', applyOrder)
      current.off('connect', handleConnect)
    }
  }, [queryClient, sessionToken])
  return createElement(RealtimeContext.Provider, { value: realtimeContextValue }, children)
}

export function useRealtime(onNotice?: (event: RealtimeNotice) => void) {
  const context = useContext(RealtimeContext)
  useEffect(() => {
    if (!context || !onNotice) return
    return context.subscribe(onNotice)
  }, [context, onNotice])
}

export function closeRealtimeSocket() {
  socket?.removeAllListeners()
  socket?.disconnect()
  socket = null
}

export function resetRealtimeState() {
  seenEvents.clear()
  seenEventOrder.splice(0)
  resourceVersions.clear()
  terminalOrders.clear()
}
