import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export function useProfileQuery() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: api.getProfile,
  })
}
