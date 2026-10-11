import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import type { FavoriteResponse } from '@/types/api'

export function useFavoritesQuery() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: api.getFavorites,
    staleTime: 30_000,
  })
}

export function useFavoriteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, favorite }: { id: string; favorite: boolean }) => api.toggleFavorite(id, favorite),
    onMutate: async ({ id, favorite }) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] })
      const previous = queryClient.getQueryData<FavoriteResponse>(['favorites'])
      queryClient.setQueryData<FavoriteResponse>(['favorites'], current => ({
        favorites: favorite
          ? [...new Set([...(current?.favorites ?? []), id])]
          : (current?.favorites ?? []).filter(item => item !== id),
      }))
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(['favorites'], context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  })
}
