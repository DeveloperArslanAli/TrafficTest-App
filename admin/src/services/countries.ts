import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import api from './api';
import type { Country } from '../types';

export function useCountries() {
  return useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: async () => {
      const { data } = await api.get('/admin/countries');
      return data;
    },
  });
}

export function useCountry(id: string) {
  return useQuery<Country>({
    queryKey: ['country', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/countries/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateCountry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code: string; name: string; flagEmoji?: string }) => {
      const { data } = await api.post('/admin/countries', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['countries'] });
      message.success('Country added');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to add country';
      message.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
}

export function useCreateJurisdiction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ countryId, payload }: { countryId: string; payload: { code: string; name: string; type?: string } }) => {
      const { data } = await api.post(`/admin/countries/${countryId}/jurisdictions`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['countries'] });
      message.success('Jurisdiction added');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to add jurisdiction';
      message.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
}
