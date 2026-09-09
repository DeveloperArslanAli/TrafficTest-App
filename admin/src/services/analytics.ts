import { useQuery } from '@tanstack/react-query';
import api from './api';
import type { DashboardStats } from '../types';

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics/dashboard');
      return data;
    },
    refetchInterval: 30000,
  });
}
