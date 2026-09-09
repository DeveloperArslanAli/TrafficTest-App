import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import api from './api';

export function useValidateBatch() {
  return useMutation({
    mutationFn: async (items: any[]) => {
      const { data } = await api.post('/admin/content/validate', { items });
      return data;
    },
  });
}

export function useImportBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: any[]) => {
      const { data } = await api.post('/admin/content/import', { items });
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['questions'] });
      message.success(`Imported ${data.importedCount} questions as DRAFT`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to import batch';
      message.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
}

export function useBulkPublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data } = await api.post('/admin/content/publish', { ids });
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['questions'] });
      message.success(`Published ${data.publishedCount} questions`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to publish questions';
      message.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
}
