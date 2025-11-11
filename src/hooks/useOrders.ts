import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrder, getOrderById, getOrdersByUser } from '../services/orderService';
import toast from 'react-hot-toast';

// Hook para obtener órdenes de un usuario
export const useOrdersByUser = (userId: string) => {
  return useQuery({
    queryKey: ['orders', 'user', userId],
    queryFn: () => getOrdersByUser(userId),
    enabled: !!userId
  });
};

// Hook para obtener una orden específica
export const useOrderById = (orderId: string) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId
  });
};

// Hook para crear una orden
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      toast.success('¡Orden creada exitosamente!');
      
      // Invalidar órdenes del usuario para que se recarguen
      queryClient.invalidateQueries({ queryKey: ['orders', 'user'] });
      
      return data;
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Error al crear la orden';
      toast.error(message);
    }
  });
};
