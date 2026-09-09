import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import api from './api';
import type { TrafficSign } from '../types';

export function useSigns(params: { category?: string; search?: string; skip?: number; take?: number } = {}) {
  return useQuery<{ total: number; skip: number; take: number; items: TrafficSign[] }>({
    queryKey: ['signs', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/signs', { params });
      return data;
    },
  });
}

export function useSign(id: string) {
  return useQuery<TrafficSign>({
    queryKey: ['sign', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/signs/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useSignImpact(id: string) {
  return useQuery<{
    signId: string;
    canonicalCode: string;
    canonicalName: string;
    questionCount: number;
    variantCount: number;
    affectedCountries: string[];
    sampleQuestions: { id: string; questionCode: string; text: string }[];
  }>({
    queryKey: ['sign-impact', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/signs/${id}/impact`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateSign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<TrafficSign>) => {
      const { data } = await api.post('/admin/signs', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['signs'] });
      message.success('Canonical sign created successfully');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to create sign';
      message.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
}

export function useUpdateSign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<TrafficSign> }) => {
      const { data } = await api.put(`/admin/signs/${id}`, payload);
      return data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['signs'] });
      qc.invalidateQueries({ queryKey: ['sign', id] });
      message.success('Canonical sign updated successfully');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update sign';
      message.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
}

export function useArchiveSign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/signs/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['signs'] });
      message.success('Sign archived successfully');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to archive sign';
      message.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
}

export function useAddSignVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ signId, formData }: { signId: string; formData: FormData }) => {
      const { data } = await api.post(`/admin/signs/${signId}/variants`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: (_data, { signId }) => {
      qc.invalidateQueries({ queryKey: ['signs'] });
      qc.invalidateQueries({ queryKey: ['sign', signId] });
      message.success('Country variant added successfully');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to add variant';
      message.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
}
