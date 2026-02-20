import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getAddressesByUser, 
  createAddress, 
  updateAddress, 
  deleteAddress,
  type AddressFormData 
} from '../services/addressService';
import toast from 'react-hot-toast';

// Hook para obtener direcciones de un usuario
export const useAddressesByUser = (userId: string) => {
  return useQuery({
    queryKey: ['addresses', userId],
    queryFn: () => getAddressesByUser(userId),
    enabled: !!userId
  });
};

// Hook para crear dirección
export const useCreateAddress = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressData: AddressFormData) => createAddress(userId, addressData),
    onSuccess: () => {
      toast.success('Dirección creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Error al crear dirección';
      toast.error(message);
    }
  });
};

// Hook para actualizar dirección
export const useUpdateAddress = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, data }: { addressId: string; data: AddressFormData }) => 
      updateAddress(userId, addressId, data),
    onSuccess: () => {
      toast.success('Dirección actualizada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Error al actualizar dirección';
      toast.error(message);
    }
  });
};

// Hook para eliminar dirección
export const useDeleteAddress = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => deleteAddress(userId, addressId),
    retry: 1, // Intentar una vez más si falla
    onSuccess: () => {
      toast.success('Dirección eliminada exitosamente', { duration: 3000 });
      // Invalidar la cache para forzar una recarga de las direcciones
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
    },
    onError: (error: Error) => {
      console.error('Error en hook de eliminar dirección:', error);
      
      // Determinar el mensaje de error adecuado
      let errorMessage = 'Error al eliminar dirección';
      
      if (error.message.includes('asociada a una o más órdenes')) {
        // Mensaje especial para direcciones usadas en órdenes
        errorMessage = error.message;
        toast.error(errorMessage, {
          duration: 5000,
          style: {
            borderRadius: '10px',
            background: '#FEF2F2',
            color: '#B91C1C',
            padding: '12px',
            fontWeight: '500'
          }
        });
      } else if (error.message.includes('conexión')) {
        errorMessage = 'Error de conexión. Verifica que el backend esté en ejecución.';
        
        // Intentar recargar la página después de un tiempo
        toast.error(errorMessage, {
          duration: 5000,
          style: {
            borderRadius: '10px',
            background: '#FEF2F2',
            color: '#B91C1C',
            padding: '12px'
          }
        });
        
        // Mensaje adicional con sugerencia
        setTimeout(() => {
          toast.error('Verifica que el servidor backend esté funcionando. Intenta reiniciar la aplicación.', {
            duration: 7000
          });
        }, 1000);
      } else {
        toast.error(errorMessage);
      }
    }
  });
};
