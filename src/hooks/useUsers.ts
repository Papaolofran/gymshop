import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAllUsers,
  getUserById,
  getUserProfile,
  updateUser,
  deleteUser,
  updateUserRole,
  type UpdateUserData
} from '../services/userService';
import toast from 'react-hot-toast';

// Hook para obtener todos los usuarios (admin)
export const useAllUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers
  });
};

// Hook para obtener el perfil del usuario autenticado
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: getUserProfile
  });
};

// Hook para obtener un usuario por ID
export const useUserById = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId
  });
};

// Hook para actualizar usuario
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserData }) =>
      updateUser(userId, data),
    onSuccess: (_, variables) => {
      toast.success('Perfil actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Error al actualizar perfil';
      toast.error(message);
    }
  });
};

// Hook para eliminar usuario (admin)
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      toast.success('Usuario eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Error al eliminar usuario';
      toast.error(message);
    }
  });
};

// Hook para cambiar rol de usuario (admin)
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      toast.success('Rol actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Error al cambiar rol';
      toast.error(message);
    }
  });
};
