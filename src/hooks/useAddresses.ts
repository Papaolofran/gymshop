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
    onSuccess: () => {
      toast.success('Dirección eliminada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Error al eliminar dirección';
      toast.error(message);
    }
  });
};
