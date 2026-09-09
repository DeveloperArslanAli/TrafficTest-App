import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import api from './api';
import type { DuplicateCandidate } from '../types';

export function useDuplicates(status?: string, type?: string) {
  return useQuery<DuplicateCandidate[]>({
    queryKey: ['duplicates', status, type],
    queryFn: async () => {
      const { data } = await api.get('/admin/duplicates', {
        params: { ...(status ? { status } : {}), ...(type ? { type } : {}) },
      });
      return data;
    },
  });
}

export function useDuplicateDetails(id: string) {
  return useQuery<{ candidate: DuplicateCandidate; entityA: any; entityB: any }>({
    queryKey: ['duplicate', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/duplicates/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useMergeDuplicate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, targetId, reason }: { id: string; targetId: string; reason: string }) => {
      const { data } = await api.post(`/admin/duplicates/${id}/merge`, { targetId, reason });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['duplicates'] });
      qc.invalidateQueries({ queryKey: ['signs'] });
      qc.invalidateQueries({ queryKey: ['questions'] });
      message.success('Duplicate successfully merged!');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to merge duplicate';
      message.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
}

export function useResolveDuplicate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason: string }) => {
      const { data } = await api.post(`/admin/duplicates/${id}/resolve`, { status, reason });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['duplicates'] });
      message.success('Duplicate resolution saved');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to resolve duplicate';
      message.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
}

export function useScanDuplicates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/admin/duplicates/scan');
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['duplicates'] });
      message.success(data?.message || 'Scan completed');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to scan duplicates';
      message.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
}
