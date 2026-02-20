import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getVariantsByProduct,
  createVariant,
  updateVariant,
  deleteVariant,
  type VariantFormData
} from '../services/variantService';
import toast from 'react-hot-toast';

// Hook para obtener variantes de un producto
export const useVariantsByProduct = (productId: string) => {
  return useQuery({
    queryKey: ['variants', productId],
    queryFn: () => getVariantsByProduct(productId),
    enabled: !!productId
  });
};

// Hook para crear variante
export const useCreateVariant = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variantData: VariantFormData) => createVariant(productId, variantData),
    onSuccess: () => {
      toast.success('Variante creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['variants', productId] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Error al crear variante';
      toast.error(message);
    }
  });
};

// Hook para actualizar variante
export const useUpdateVariant = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, data }: { variantId: string; data: Partial<VariantFormData> }) =>
      updateVariant(productId, variantId, data),
    onSuccess: () => {
      toast.success('Variante actualizada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['variants', productId] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Error al actualizar variante';
      toast.error(message);
    }
  });
};

// Hook para eliminar variante
export const useDeleteVariant = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variantId: string) => deleteVariant(productId, variantId),
    onSuccess: () => {
      toast.success('Variante eliminada exitosamente');
      // Invalidate both variant and product queries to ensure all data is refreshed
      queryClient.invalidateQueries({ queryKey: ['variants', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['product-admin', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Error al eliminar variante';
      toast.error(message);
    }
  });
};
