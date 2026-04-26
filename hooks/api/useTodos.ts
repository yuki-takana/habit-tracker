import useSWR from 'swr';
import { todosApi } from '@/lib/api/services';
import { ENDPOINTS } from '@/lib/api/endpoints';

export function useTodos() {
  const { data, error, mutate, isValidating } = useSWR(ENDPOINTS.TODOS, todosApi.getAll);

  return {
    todos: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
    isValidating,
  };
}
