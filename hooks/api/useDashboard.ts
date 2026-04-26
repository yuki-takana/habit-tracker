import useSWR from 'swr';
import { dashboardApi } from '@/lib/api/services';
import { ENDPOINTS } from '@/lib/api/endpoints';

export function useDashboardSummary() {
  const { data, error, mutate, isValidating } = useSWR(ENDPOINTS.DASHBOARD_SUMMARY, dashboardApi.getSummary);

  return {
    summary: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
    isValidating,
  };
}

export function useActiveBlueprints() {
  const { data, error, mutate, isValidating } = useSWR(ENDPOINTS.DASHBOARD_BLUEPRINTS, dashboardApi.getActiveBlueprints);

  return {
    blueprints: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
    isValidating,
  };
}
