import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import type { Recipe, RecipeCreate } from '../types';

export const useRecipes = (params?: {
  query?: string;
  tags?: string;
  categories?: string;
  minKcal?: number;
  maxKcal?: number;
  minProtein?: number;
  maxProtein?: number;
  minFat?: number;
  maxFat?: number;
  minCarbs?: number;
  maxCarbs?: number;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['recipes', params],
    queryFn: async () => {
      const response = await apiClient.get('/recipes', { params });
      return response.data;
    },
  });
};

export const useRecipe = (id: string) => {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const response = await apiClient.get(`/recipes/${id}`);
      return response.data as Recipe;
    },
    enabled: !!id,
  });
};

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RecipeCreate) => {
      const response = await apiClient.post('/recipes', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};

export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RecipeCreate> }) => {
      const response = await apiClient.put(`/recipes/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipe', variables.id] });
    },
  });
};

export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/recipes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await apiClient.get('/tags');
      return response.data.tags as string[];
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/categories');
      return response.data.categories as string[];
    },
  });
};

export const uploadRecipeImage = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post(`/recipes/${id}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};


