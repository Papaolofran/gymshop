import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProductById, createProduct, updateProduct, deleteProduct, type ProductFormData } from '../services/productAdminService';
import toast from 'react-hot-toast';

// Hook para obtener producto por ID (admin)
export const useProductAdmin = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['product-admin', productId],
    queryFn: () => getProductById(productId!),
    enabled: !!productId,
  });
};

// Hook para crear producto
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: ProductFormData) => createProduct(productData),
    onSuccess: () => {
      toast.success('Producto creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Error al crear producto';
      toast.error(message);
    }
  });
};

// Hook para actualizar producto
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: Partial<ProductFormData> }) =>
      updateProduct(productId, data),
    onSuccess: () => {
      toast.success('Producto actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Error al actualizar producto';
      toast.error(message);
    }
  });
};

// Hook para eliminar producto
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      toast.success('Producto eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Error al eliminar producto';
      toast.error(message);
    }
  });
};
