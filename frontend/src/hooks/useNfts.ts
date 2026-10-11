import { getNfts } from "@/services/nftsService";
import { useQuery } from "@tanstack/react-query";

export function useNftsQuery(params?: { search?: string; category?: string; sort?: string; page?: number }) {
  return useQuery({
    queryKey: ['nfts', params],
    queryFn: () => getNfts(params),
    staleTime: 30_000,
  })
}
