import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  getAllUsers,
  getUserById,
  getUserProfile,
  updateUser,
  deleteUser,
  deleteOwnAccount,
  updateUserRole,
  type UpdateUserData
} from '../services/userService';
import toast from 'react-hot-toast';
import { useUser } from './auth/useUser';
import { supabase } from '../supabase/client';

// Hook para obtener todos los usuarios (admin)
export const useAllUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers
  });
};

// Hook para obtener el perfil del usuario autenticado
export const useUserProfile = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: getUserProfile
  });
  
  // Uso de useEffect para manejar la detección de cuenta eliminada
  useEffect(() => {
    if (query.data?.fullName === '[Usuario eliminado]') {
      console.log('Perfil eliminado detectado, limpiando datos y session...');
      // Limpiar caché de React Query
      queryClient.clear();
    }
  }, [query.data, queryClient]);
  
  return query;
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

// Hook para que un usuario elimine su propia cuenta
export const useDeleteOwnAccount = () => {
  const { session } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<{ partialSuccess?: boolean }> => {
      if (!session?.user?.id) {
        throw new Error('Usuario no autenticado');
      }
      
      // Llamar al backend para eliminar la cuenta
      try {
        // Eliminar la cuenta
        await deleteOwnAccount(session.user.id);
        return { partialSuccess: false };
      } catch (error) {
        console.error('Error en deleteOwnAccount:', error);
        throw error;
      }
    },
    // Configuración para asegurar que no se reintente automáticamente
    retry: 0,
    onSuccess: async (data: { partialSuccess?: boolean } | undefined) => {
      toast.success('Tu cuenta ha sido eliminada correctamente');
      console.log('Cuenta eliminada exitosamente, iniciando proceso de limpieza...');
      
      // Detectar si la eliminación fue parcial (datos anonimizados pero problemas con auth)
      const isPartialSuccess = data?.partialSuccess;
      
      if (isPartialSuccess) {
        toast.error(
          'Tu información personal ha sido eliminada, pero por favor asegúrate de cerrar sesión manualmente.',
          { duration: 7000 }
        );
      }
      
      // Limpiar la cache de React Query
      queryClient.clear();
      
      try {
        // Cerrar sesión más agresivamente
        // 1. Intentar con el método oficial de Supabase
        await supabase.auth.signOut();
        
        // 2. Limpiar almacenamientos
        localStorage.clear();
        sessionStorage.clear();
        
        // 3. Eliminar cookies
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.trim().split('=');
          if (name && name.length > 0) { // Eliminar todas las cookies para mayor seguridad
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
        });
        
        // 4. Intentar invalidar la sesión actual en Supabase (si existe el método)
        try {
          // Comprobamos si el método existe antes de llamarlo
          if (typeof supabase.auth.signOut === 'function') {
            await supabase.auth.signOut();
          }
        } catch (error) {
          // Ignorar errores aquí
          console.debug('Error al intentar cerrar sesión adicional:', error);
        }
      } catch (e) {
        console.error('Error durante el proceso de cierre de sesión:', e);
      } finally {
        // Más agresivo: usar setTimeout para asegurar que todas las operaciones asincrónicas se completen
        setTimeout(() => {
          console.log('Recargando página completamente...');
          // Recargar la página completamente para forzar cierre de sesión
          window.location.href = '/?deleted=true';
        }, 1000);
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      console.error('Error en la mutación deleteOwnAccount:', error);
      
      // Determinar el mensaje de error más apropiado
      let errorMessage = 'Error al eliminar cuenta';
      
      if (error.message.includes('conexión') || error.message.includes('connect')) {
        errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté en ejecución.';
      } else if (error.message.includes('endpoint') || error.message.includes('404')) {
        errorMessage = 'El servicio para eliminar cuentas no está disponible.';
      } else {
        errorMessage = error.message || error.response?.data?.message || 'Error desconocido al eliminar la cuenta';
      }
      
      // Mostrar mensaje claro al usuario
      toast.error(errorMessage, {
        duration: 5000, // Mostrar por más tiempo para mensajes de error
        style: {
          borderRadius: '10px',
          background: '#FEE2E2',
          color: '#B91C1C',
          padding: '16px'
        }
      });
      
      // Si es un error de conexión, mostrar un mensaje adicional con instrucciones
      if (errorMessage.includes('backend') || errorMessage.includes('servidor')) {
        setTimeout(() => {
          toast.error('Asegúrate de que el servidor backend esté ejecutándose en http://localhost:3000', {
            duration: 7000
          });
        }, 1000);
      }
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
