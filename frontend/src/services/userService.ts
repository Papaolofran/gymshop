import axios from 'axios';
import { getAuthToken } from '../helpers/getAuthToken';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';


const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interface para usuario
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Interface para actualizar usuario
export interface UpdateUserData {
  fullName?: string;
  phone?: string;
}

// Obtener todos los usuarios (solo admin)
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const token = await getAuthToken();
    const response = await apiClient.get('/users', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

// Obtener perfil del usuario autenticado
export const getUserProfile = async (): Promise<User> => {
  try {
    const token = await getAuthToken();
    const response = await apiClient.get('/users/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Obtener un usuario por ID
export const getUserById = async (userId: string): Promise<User> => {
  try {
    const token = await getAuthToken();
    const response = await apiClient.get(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

// Actualizar usuario
export const updateUser = async (userId: string, userData: UpdateUserData): Promise<User> => {
  try {
    const token = await getAuthToken();
    const response = await apiClient.put(`/users/${userId}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

// Eliminar usuario (solo admin)
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const token = await getAuthToken();
    await apiClient.delete(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};

// Eliminar cuenta propia (usuario)
export const deleteOwnAccount = async (userId: string): Promise<void> => {
  try {
    // Verificar que el usuario está autenticado
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Usuario no autenticado');
    }

    // Intentar borrar la cuenta con manejo de errores más detallado
    try {
      await apiClient.delete(`/users/delete-account/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        // Aumentar el timeout para evitar problemas de conexión rápida
        timeout: 15000 
      });
    } catch (apiError: unknown) {
      // Manejo detallado de errores de API
      const error = apiError as {
        code?: string;
        response?: {
          status?: number;
          data?: {
            message?: string;
          };
        };
        message?: string;
      };
      
      if (error.code === 'ECONNREFUSED' || !error.response) {
        console.error('Error de conexión con el servidor:', error);
        throw new Error('No se puede conectar con el servidor. Por favor, verifica que el backend esté en ejecución.');
      } else if (error.response?.status === 404) {
        throw new Error('El endpoint para eliminar cuentas no existe en el servidor.');
      } else {
        console.error(`Error al eliminar cuenta:`, error.response?.data || error);
        throw new Error(error.response?.data?.message || 'Error desconocido al eliminar la cuenta');
      }
    }
  } catch (error: unknown) {
    console.error(`Error eliminando cuenta de usuario ${userId}:`, error);
    // Re-throw the error, preserving the message
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Error desconocido al eliminar la cuenta');
    }
  }
};

// Cambiar rol de usuario (solo admin)
export const updateUserRole = async (userId: string, role: string): Promise<User> => {
  try {
    const token = await getAuthToken();
    const response = await apiClient.put(`/users/${userId}/role`, { role }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error updating role for user ${userId}:`, error);
    throw error;
  }
};
