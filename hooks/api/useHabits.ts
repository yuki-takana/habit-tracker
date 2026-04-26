import useSWR from 'swr';
import { habitsApi } from '@/lib/api/services';
import { ENDPOINTS } from '@/lib/api/endpoints';

export function useHabits() {
  const { data, error, mutate, isValidating } = useSWR(ENDPOINTS.HABITS, habitsApi.getAll);

  return {
    habits: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
    isValidating,
  };
}
