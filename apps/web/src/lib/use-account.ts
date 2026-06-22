import { useQuery } from '@tanstack/react-query';
import { api } from './api';

/** Loads the signed-in user's account (mock in standalone mode). */
export function useAccount() {
  return useQuery({
    queryKey: ['account'],
    queryFn: () => api.getAccount(),
  });
}
