import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { Question } from '../types';
import api from './api';

export interface QuestionsQueryParams {
  category?: string;
  countryId?: string;
  jurisdictionId?: string;
  status?: string;
  difficulty?: string;
  search?: string;
  skip?: number;
  take?: number;
}

export interface QuestionsResult {
  total: number;
  skip: number;
  take: number;
  items: Question[];
}

// ── Fetch list ───────────────────────────────────────────────────────────────
export function useQuestions(
  param1?: string | QuestionsQueryParams,
  param2?: string,
) {
  const queryParams: QuestionsQueryParams =
    typeof param1 === 'object' && param1 !== null
      ? param1
      : {
          category: param1 as string | undefined,
          search: param2,
        };

  return useQuery<QuestionsResult>({
    queryKey: ['questions', queryParams],
    queryFn: async () => {
      const { data } = await api.get('/admin/questions', { params: queryParams });
      // If array returned (legacy fallback), normalize to QuestionsResult
      if (Array.isArray(data)) {
        return { total: data.length, skip: 0, take: data.length, items: data };
      }
      return data;
    },
  });
}

// ── Fetch single ─────────────────────────────────────────────────────────────
export function useQuestion(id: string) {
  return useQuery<Question>({
    queryKey: ['question', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/questions/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// ── Create ───────────────────────────────────────────────────────────────────
export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/admin/questions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data as Question;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['questions'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      message.success('Question created successfully');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to create question';
      message.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
}

// ── Update ───────────────────────────────────────────────────────────────────
export function useUpdateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const { data } = await api.put(`/admin/questions/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data as Question;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['questions'] });
      qc.invalidateQueries({ queryKey: ['question', id] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      message.success('Question updated successfully');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update question';
      message.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
}

// ── Delete ───────────────────────────────────────────────────────────────────
export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/questions/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['questions'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      message.success('Question archived');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to delete question';
      message.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
}

// ── Toggle publish ────────────────────────────────────────────────────────────
export function useTogglePublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const { data } = await api.patch(`/admin/questions/${id}/publish`, { isPublished });
      return data as Question;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['questions'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      message.success('Question status updated');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update publish status';
      message.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
}
