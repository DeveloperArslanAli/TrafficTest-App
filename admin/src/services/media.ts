import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import type { PexelsPhoto, CuratedTheme } from '../types';

export interface PexelsSearchResponse {
  totalResults: number;
  page: number;
  perPage: number;
  photos: PexelsPhoto[];
}

export interface PexelsSearchParams {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: string;
}

export function usePexelsSearch(params: PexelsSearchParams, enabled = true) {
  return useQuery<PexelsSearchResponse>({
    queryKey: ['media', 'pexels', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/media/pexels/search', { params });
      return data;
    },
    enabled: enabled && params.query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMediaThemes() {
  return useQuery<CuratedTheme[]>({
    queryKey: ['media', 'themes'],
    queryFn: async () => {
      const { data } = await api.get('/admin/media/themes');
      return data;
    },
    staleTime: 60 * 60 * 1000,
  });
}

export function useSyncCloudinary() {
  return useMutation<
    { success: boolean; secureUrl: string; publicId: string | null; note?: string },
    Error,
    { photoUrl: string; folder?: string; publicId?: string }
  >({
    mutationFn: async (payload) => {
      const { data } = await api.post('/admin/media/sync-cloudinary', payload);
      return data;
    },
  });
}

export function useAttachToQuestion() {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    Error,
    { questionId: string; imageUrl: string; photographer?: string }
  >({
    mutationFn: async (payload) => {
      const { data } = await api.post('/admin/media/attach-question', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}

export function useAttachToSign() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { variantId: string; imageUrl: string }>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/admin/media/attach-sign', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signs'] });
    },
  });
}
