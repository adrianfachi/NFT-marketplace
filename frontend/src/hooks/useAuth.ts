import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../services/api"
import { closeRealtimeSocket, resetRealtimeState } from "../lib/realtime"

function notifySessionChanged() {
  sessionStorage.removeItem('kurio-order-id')
  sessionStorage.removeItem('checkout-idempotency-key')
  window.dispatchEvent(new Event('kurio:session-changed'))
}

export function useLoginMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.login,
    onSuccess: response => {
      sessionStorage.setItem('kurio-session', response.token)
      closeRealtimeSocket()
      resetRealtimeState()
      notifySessionChanged()
      queryClient.setQueryData(['profile'], response.user)
    },
  })
}

export function useRegisterMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.register,
    onSuccess: response => {
      sessionStorage.setItem('kurio-session', response.token)
      closeRealtimeSocket()
      resetRealtimeState()
      notifySessionChanged()
      queryClient.setQueryData(['profile'], response.user)
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      sessionStorage.removeItem('kurio-session')
      closeRealtimeSocket()
      resetRealtimeState()
      notifySessionChanged()
      queryClient.removeQueries({ queryKey: ['profile'] })
      queryClient.removeQueries({ queryKey: ['favorites'] })
      queryClient.removeQueries({ queryKey: ['cart'] })
    },
  })
}
