import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

export const useMealPlans = () => {
  return useQuery({
    queryKey: ['mealPlans'],
    queryFn: async () => {
      const response = await apiClient.get('/meal-plans');
      return response.data.mealPlans;
    },
  });
};

export const useMealPlan = (id: string) => {
  return useQuery({
    queryKey: ['mealPlan', id],
    queryFn: async () => {
      const response = await apiClient.get(`/meal-plans/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateMealPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/meal-plans', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    },
  });
};

export const useUpdateMealPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/meal-plans/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      queryClient.invalidateQueries({ queryKey: ['mealPlan', variables.id] });
    },
  });
};

export const useDeleteMealPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/meal-plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    },
  });
};

export const useGenerateMealPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/meal-plans/${id}/generate`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mealPlan', variables] });
    },
  });
};

export const useUpsertMealEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mealPlanId, data }: { mealPlanId: string; data: any }) => {
      const response = await apiClient.post(`/meal-plans/${mealPlanId}/entries`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mealPlan', variables.mealPlanId] });
    },
  });
};

export const useDeleteMealEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mealPlanId, entryId }: { mealPlanId: string; entryId: string }) => {
      await apiClient.delete(`/meal-plans/${mealPlanId}/entries/${entryId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mealPlan', variables.mealPlanId] });
    },
  });
};

export const useShoppingList = (mealPlanId: string) => {
  return useQuery({
    queryKey: ['shoppingList', mealPlanId],
    queryFn: async () => {
      const response = await apiClient.get(`/meal-plans/${mealPlanId}/shopping-list`);
      return response.data.shoppingList;
    },
    enabled: !!mealPlanId,
  });
};


