import { useMutation } from '@tanstack/react-query'
import { api } from '../services/api'

export function useNewsletterMutation() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await api.subscribeNewsletter(email)
      return response
    },
  })
}