import { api } from '../services/api'
import type { CartResponse } from '@/types/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatEth, mul } from '@/lib/money'


export function useCartQuery(enabled = true) {
  return useQuery({
    queryKey: ['cart'],
    queryFn: ({ signal }) => api.getCart(signal),
    staleTime: 5_000,
    enabled,
  })
}


export function useCartQuantityMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => api.updateCart(id, quantity),
    onMutate: async ({ id, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] })
      const previous = queryClient.getQueryData<CartResponse>(['cart'])
      queryClient.setQueryData<CartResponse>(['cart'], current => {
        if (!current) return current
        const items = current.items
          .map(item => item.id === id ? { ...item, quantity, subtotal: `${mul(String(item.price), quantity)} ETH` } : item)
          .filter(item => item.quantity > 0)
        const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal.replace(' ETH', '')), 0)
        return { ...current, items, subtotal: `${formatEth(String(subtotal))} ETH`, total: `${formatEth(String(subtotal + 0.016))} ETH` }
      })
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(['cart'], context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })
}


export function useAddToCartMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => api.updateCart(id, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })
}
