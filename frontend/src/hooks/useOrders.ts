import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrder, getOrderById, getOrdersByUser, cancelOrder } from '../services/orderService';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

// Hook para obtener órdenes de un usuario
export const useOrdersByUser = (userId: string) => {
  const query = useQuery({
    queryKey: ['orders', 'user', userId],
    queryFn: () => getOrdersByUser(userId),
    enabled: !!userId,
    retry: 2, // Reintentar hasta 2 veces si hay error
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000), // Espera exponencial entre reintentos
  });
  
  // Manejo de errores mediante un useEffect
  useEffect(() => {
    if (query.error) {
      const error = query.error;
      const errorMsg = error instanceof Error && (error.message.includes('backend') || error.message.includes('servidor'))
        ? 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.'
        : error instanceof Error ? error.message : 'Error al cargar tus pedidos';
        
      toast.error(errorMsg, {
        id: 'orders-error',
        duration: 5000,
        style: {
          borderRadius: '10px',
          background: '#FEF2F2',
          color: '#B91C1C',
          padding: '12px'
        }
      });
    }
  }, [query.error]);
  
  return query;
};

// Hook para obtener una orden específica
export const useOrderById = (orderId: string) => {
  const query = useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
    retry: 2, // Reintentar hasta 2 veces si hay error
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000) // Espera exponencial
  });
  
  // Manejo de errores mediante un useEffect
  useEffect(() => {
    if (query.error) {
      const error = query.error;
      const errorMsg = error instanceof Error && (error.message.includes('backend') || error.message.includes('servidor'))
        ? 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.'
        : error instanceof Error ? error.message : 'Error al cargar los detalles del pedido';
        
      toast.error(errorMsg, {
        id: `order-error-${orderId}`,
        duration: 5000,
        style: {
          borderRadius: '10px',
          background: '#FEF2F2',
          color: '#B91C1C',
          padding: '12px'
        }
      });
    }
  }, [query.error, orderId]);
  
  return query;
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

// Hook para cancelar una orden
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: (_data, orderId) => {
      toast.success('Orden cancelada exitosamente');
      
      // Invalidar datos de la orden individual
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
      
      // Invalidar lista de órdenes del usuario
      queryClient.invalidateQueries({ queryKey: ['orders', 'user'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Error al cancelar la orden';
      toast.error(message);
    }
  });
};
