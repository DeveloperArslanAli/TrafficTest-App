import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import api from './api';
import type { Source } from '../types';

export function useSources() {
  return useQuery<Source[]>({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data } = await api.get('/admin/sources');
      return data;
    },
  });
}

export function useSource(id: string) {
  return useQuery<Source>({
    queryKey: ['source', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/sources/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Source>) => {
      const { data } = await api.post('/admin/sources', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sources'] });
      message.success('Source created successfully');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to create source';
      message.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
}

export function useUpdateSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload, markRequiresReview }: { id: string; payload: Partial<Source>; markRequiresReview?: boolean }) => {
      const { data } = await api.put(`/admin/sources/${id}`, { ...payload, markRequiresReview });
      return data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['sources'] });
      qc.invalidateQueries({ queryKey: ['source', id] });
      message.success('Source updated');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update source';
      message.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
}
